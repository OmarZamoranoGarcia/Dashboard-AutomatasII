import fs from "fs";
import path from "path";
import { parseInput } from "../sintactico.js";
import { analyzeSemantics, cstToFields } from "../semantico.js";

// Ruta del archivo buffer.
const DEXT_PATH = path.resolve("buffer_pendiente.dext");

// Intervalo de reintento de reconexión en milisegundos
const RETRY_INTERVAL_MS = 15000;

let pool = null;
let retryTimer = null;
let dbDisponible = true;

export function iniciarDextBuffer(pgPool) {
    pool = pgPool;
}

// Serializa un objeto de campos al formato de bloque .dext
function serializarBloque(fields) {
    const lineas = Object.entries(fields).map(([k, v]) => {
        const valor = typeof v === "string" ? `"${v}"` : v;
        return `    ${k}: ${valor}`;
    });
    return `{\n${lineas.join(",\n")}\n}`;
}

// Extrae bloques { } del contenido del archivo .dext
function extraerBloques(contenido) {
    const bloques = [];
    let profundidad = 0;
    let inicio = -1;

    for (let i = 0; i < contenido.length; i++) {
        if (contenido[i] === "{") {
            if (profundidad === 0) inicio = i;
            profundidad++;
        } else if (contenido[i] === "}") {
            profundidad--;
            if (profundidad === 0 && inicio !== -1) {
                bloques.push(contenido.slice(inicio, i + 1).trim());
                inicio = -1;
            }
        }
    }

    return bloques;
}

function inferirTipoSensor(sensorName) {
    const mapa = {
        "_Bascula":        "bascula",
        "DEXA_RX":         "dexa",
        "DHT22":           "dht22",
        "FLIR TERMICA":    "flir",
        "LPR":             "lpr",
        "MQ-135":          "mq135",
        "Radar Doppler":   "radar",
        "RFID UHF Reader": "rfid",
        "Sensor PIR":      "pir",
        "SONOMETRO":       "sonometro",
    };
    return mapa[sensorName] || null;
}

// Escribe una lectura válida al buffer .dext cuando la BD no está disponible
export function guardarEnBuffer(fields) {
    const bloque = serializarBloque(fields);
    const separador = "\n\n";

    try {
        fs.appendFileSync(DEXT_PATH, bloque + separador, "utf-8");
        console.warn(`[dext] Lectura guardada en buffer: ${DEXT_PATH}`);
    } catch (err) {
        console.error("[dext] No se pudo escribir en el buffer:", err.message);
    }
}

// Intenta insertar un bloque en la BD. Devuelve true si lo logra
async function insertarBloque(bloque) {
    const parseResult = parseInput(bloque);

    if (parseResult.lexErrors || parseResult.parseErrors) {
        // Bloque malformado, se descarta con log
        console.warn("[dext] Bloque descartado por error de parsing.");
        return true;
    }

    const fields = cstToFields(parseResult.cst);
    const semantic = analyzeSemantics(fields);

    if (!semantic.valid) {
        console.warn(`[dext] Bloque descartado por error semántico: ${semantic.errors.join(", ")}`);
        return true;
    }

    await pool.query(
        `INSERT INTO lecturas (sensor, tipo_sensor, zona, datos, advertencias, fuente)
         VALUES ($1, $2, $3, $4, $5, 'dext')`,
        [
            semantic.sensorName,
            inferirTipoSensor(semantic.sensorName),
            fields.zona || fields.Zona || null,
            JSON.stringify(fields),
            JSON.stringify(semantic.warnings),
        ]
    );

    return true;
}

// Procesa el archivo .dext pendiente, bloque a bloque
// Si algún INSERT falla, reescribe los bloques restantes y detiene el proceso
async function procesarBuffer() {
    if (!fs.existsSync(DEXT_PATH)) return;

    const contenido = fs.readFileSync(DEXT_PATH, "utf-8").trim();
    if (!contenido) {
        fs.unlinkSync(DEXT_PATH);
        return;
    }

    const bloques = extraerBloques(contenido);
    if (bloques.length === 0) {
        fs.unlinkSync(DEXT_PATH);
        return;
    }

    console.log(`[dext] Procesando ${bloques.length} lectura(s) pendiente(s)...`);

    let insertados = 0;
    const fallidos = [];

    for (const bloque of bloques) {
        try {
            await insertarBloque(bloque);
            insertados++;
        } catch (err) {
            // La BD volvió a fallar, guardar los bloques restantes
            console.error("[dext] BD no disponible durante reproceso:", err.message);
            fallidos.push(...bloques.slice(bloques.indexOf(bloque)));
            break;
        }
    }

    if (fallidos.length > 0) {
        // Reescribir solo los bloques que no se pudieron insertar
        fs.writeFileSync(DEXT_PATH, fallidos.join("\n\n") + "\n\n", "utf-8");
        console.warn(`[dext] ${fallidos.length} lectura(s) permanecen en buffer.`);
    } else {
        fs.unlinkSync(DEXT_PATH);
        console.log(`[dext] Buffer procesado: ${insertados} lectura(s) insertadas. Archivo eliminado.`);
    }
}

// Verifica si la BD responde con un SELECT 1
async function verificarConexion() {
    try {
        await pool.query("SELECT 1");
        return true;
    } catch {
        return false;
    }
}

// Inicia el ciclo de monitoreo de la BD
// Si hay buffer pendiente y la BD está disponible, lo procesa
// Si la BD cae durante la operación normal, activa el modo buffer
export function iniciarMonitoreo() {
    async function ciclo() {
        const disponible = await verificarConexion();

        if (!disponible && dbDisponible) {
            dbDisponible = false;
            console.warn("[dext] BD no disponible. Activando buffer .dext.");
        }

        if (disponible && !dbDisponible) {
            dbDisponible = true;
            console.log("[dext] BD reconectada. Procesando buffer pendiente.");
            await procesarBuffer();
        }

        if (disponible && fs.existsSync(DEXT_PATH)) {
            // Puede haber un buffer de una ejecución anterior
            console.log("[dext] Buffer encontrado al iniciar. Procesando...");
            await procesarBuffer();
        }

        retryTimer = setTimeout(ciclo, RETRY_INTERVAL_MS);
    }

    // Primera ejecución: esperar un momento para que el pool esté listo
    setTimeout(ciclo, 2000);
}

// Devuelve si la BD está disponible actualmente
export function estaDbDisponible() {
    return dbDisponible;
}
