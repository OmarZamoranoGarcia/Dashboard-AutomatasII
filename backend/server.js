import "dotenv/config"; 
import express from "express";
import cors from "cors";
import pg from "pg";
import { parseInput } from "./sintactico.js";
import { analyzeSemantics, cstToFields } from "./semantico.js";
import authRouter, { setPool as setAuthPool } from "./routes/auth.js";
import { requireAuth, requireRol } from "./middleware/auth.js";
import { iniciarDextBuffer, iniciarMonitoreo, guardarEnBuffer, estaDbDisponible } from "./dext/buffer.js";

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
    host:     process.env.DB_HOST     || "localhost",
    port:     Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || "sensores_aduaneros",
    user:     process.env.DB_USER     || "postgres",
    password: process.env.DB_PASSWORD || "123",
});

pool.connect((err, client, release) => {
    if (err) {
        console.error("Error al conectar con PostgreSQL:", err.message);
        process.exit(1);
    }
    release();
    console.log("Conexión a PostgreSQL establecida.");

    iniciarDextBuffer(pool);
    iniciarMonitoreo();
});

setAuthPool(pool);

// Rutas públicas de autenticación
app.use("/api/auth", authRouter);

// POST /api/sensor
// Recibe el texto plano del mensaje del sensor, lo valida con el pipeline y persiste en BD.
// Si la BD no está disponible, la lectura válida se guarda en buffer_pendiente.dext
app.post("/api/sensor", requireAuth(pool), async (req, res) => {
    const { mensaje } = req.body;

    if (!mensaje || typeof mensaje !== "string") {
        return res.status(400).json({ error: "El campo 'mensaje' es requerido y debe ser un string." });
    }

    const parseResult = parseInput(mensaje);

    if (parseResult.lexErrors) {
        return res.status(422).json({ etapa: "lexico", errores: parseResult.lexErrors });
    }

    if (parseResult.parseErrors) {
        return res.status(422).json({ etapa: "sintactico", errores: parseResult.parseErrors });
    }

    const fields = cstToFields(parseResult.cst);
    const semantic = analyzeSemantics(fields);

    if (!semantic.valid) {
        return res.status(422).json({
            etapa: "semantico",
            sensor: semantic.sensorName,
            errores: semantic.errors,
            advertencias: semantic.warnings,
        });
    }

    const tipoSensor = inferirTipoSensor(semantic.sensorName);

    // Si la BD no está disponible, derivar al buffer .dext
    if (!estaDbDisponible()) {
        guardarEnBuffer(fields);
        return res.status(202).json({
            mensaje: "BD no disponible. Lectura guardada en buffer local.",
            sensor: semantic.sensorName,
            advertencias: semantic.warnings,
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO lecturas (sensor, tipo_sensor, zona, datos, advertencias, fuente)
             VALUES ($1, $2, $3, $4, $5, 'api')
             RETURNING id, created_at`,
            [
                semantic.sensorName,
                tipoSensor,
                fields.zona || fields.Zona || null,
                JSON.stringify(fields),
                JSON.stringify(semantic.warnings),
            ]
        );

        return res.status(201).json({
            id: result.rows[0].id,
            sensor: semantic.sensorName,
            tipo_sensor: tipoSensor,
            datos: fields,
            advertencias: semantic.warnings,
            timestamp: result.rows[0].created_at,
        });
    } catch (dbErr) {
        // La BD falló en medio de la petición, guardar en buffer
        console.error("Error al insertar en BD:", dbErr.message);
        guardarEnBuffer(fields);
        return res.status(202).json({
            mensaje: "Error de BD. Lectura guardada en buffer local.",
            sensor: semantic.sensorName,
            advertencias: semantic.warnings,
        });
    }
});

// GET /api/sensor
// Devuelve lecturas con filtros opcionales:
//   ?sensor=DHT22         filtra por nombre de sensor exacto
//   ?tipo=dht22           filtra por tipo de sensor
//   ?zona=Caseta+1        filtra por zona
//   ?fuente=dext          filtra por fuente (api o dext)
//   ?desde=ISO8601        lecturas desde esta fecha
//   ?hasta=ISO8601        lecturas hasta esta fecha
//   ?advertencias=true    solo lecturas con advertencias
//   ?limit=50             limita resultados (default 100, max 500)
app.get("/api/sensor", requireAuth(pool), async (req, res) => {
    const { sensor, tipo, zona, fuente, desde, hasta, advertencias, limit = 100 } = req.query;
    const limitNum = Math.min(Math.max(parseInt(limit) || 100, 1), 500);

    const condiciones = [];
    const params = [];
    let idx = 1;

    if (sensor)             { condiciones.push(`sensor = $${idx++}`);                     params.push(sensor); }
    if (tipo)               { condiciones.push(`tipo_sensor = $${idx++}`);                params.push(tipo); }
    if (zona)               { condiciones.push(`zona ILIKE $${idx++}`);                   params.push(`%${zona}%`); }
    if (fuente)             { condiciones.push(`fuente = $${idx++}`);                     params.push(fuente); }
    if (desde)              { condiciones.push(`created_at >= $${idx++}`);                params.push(desde); }
    if (hasta)              { condiciones.push(`created_at <= $${idx++}`);                params.push(hasta); }
    if (advertencias === "true") { condiciones.push(`jsonb_array_length(advertencias) > 0`); }

    const where = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";
    params.push(limitNum);

    try {
        const result = await pool.query(
            `SELECT id, sensor, tipo_sensor, zona, datos, advertencias, fuente, created_at
             FROM lecturas ${where}
             ORDER BY created_at DESC
             LIMIT $${idx}`,
            params
        );
        return res.json(result.rows);
    } catch (dbErr) {
        console.error("Error al consultar BD:", dbErr.message);
        return res.status(500).json({ error: "Error interno al consultar lecturas." });
    }
});

// GET /api/sensor/:id
app.get("/api/sensor/:id", requireAuth(pool), async (req, res) => {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido." });
    }

    try {
        const result = await pool.query(
            `SELECT id, sensor, tipo_sensor, zona, datos, advertencias, fuente, created_at
             FROM lecturas WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Lectura no encontrada." });
        }

        return res.json(result.rows[0]);
    } catch (dbErr) {
        console.error("Error al consultar BD:", dbErr.message);
        return res.status(500).json({ error: "Error interno al consultar la lectura." });
    }
});

// GET /api/sensores
// Devuelve la lista de sensores distintos con estadísticas
app.get("/api/sensores", requireAuth(pool), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT sensor, tipo_sensor,
                    COUNT(*) AS total,
                    MAX(created_at) AS ultima_lectura,
                    COUNT(*) FILTER (WHERE jsonb_array_length(advertencias) > 0) AS con_advertencias
             FROM lecturas
             GROUP BY sensor, tipo_sensor
             ORDER BY ultima_lectura DESC`
        );
        return res.json(result.rows);
    } catch (dbErr) {
        console.error("Error al consultar BD:", dbErr.message);
        return res.status(500).json({ error: "Error interno." });
    }
});

// GET /api/sensores/config
// Devuelve la configuración de todos los sensores registrados
app.get("/api/sensores/config", requireAuth(pool), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, nombre, tipo, zona, descripcion, activo, created_at
             FROM sensores_config
             ORDER BY tipo, nombre`
        );
        return res.json(result.rows);
    } catch (dbErr) {
        console.error("Error al consultar configuración:", dbErr.message);
        return res.status(500).json({ error: "Error interno." });
    }
});

// GET /api/estadisticas
// Resumen general: totales por tipo, lecturas recientes, alertas activas
app.get("/api/estadisticas", requireAuth(pool), async (req, res) => {
    try {
        const [porTipo, recientes, alertas] = await Promise.all([
            pool.query(
                `SELECT tipo_sensor, COUNT(*) AS total
                 FROM lecturas
                 GROUP BY tipo_sensor
                 ORDER BY total DESC`
            ),
            pool.query(
                `SELECT sensor, zona, created_at
                 FROM lecturas
                 ORDER BY created_at DESC
                 LIMIT 10`
            ),
            pool.query(
                `SELECT sensor, zona, advertencias, created_at
                 FROM lecturas
                 WHERE jsonb_array_length(advertencias) > 0
                 ORDER BY created_at DESC
                 LIMIT 20`
            ),
        ]);

        return res.json({
            por_tipo: porTipo.rows,
            recientes: recientes.rows,
            alertas: alertas.rows,
        });
    } catch (dbErr) {
        console.error("Error al obtener estadísticas:", dbErr.message);
        return res.status(500).json({ error: "Error interno." });
    }
});

// GET /api/usuarios (solo admin)
app.get("/api/usuarios", requireAuth(pool), requireRol("admin"), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, username, email, rol, activo, created_at, last_login
             FROM usuarios
             ORDER BY created_at DESC`
        );
        return res.json(result.rows);
    } catch (err) {
        console.error("Error consultando usuarios:", err.message);
        return res.status(500).json({ error: "Error interno." });
    }
});

// PATCH /api/usuarios/:id (solo admin)
app.patch("/api/usuarios/:id", requireAuth(pool), requireRol("admin"), async (req, res) => {
    const id = parseInt(req.params.id);
    const { activo, rol } = req.body;

    if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido." });
    }

    const actualizaciones = [];
    const params = [];
    let idx = 1;

    if (activo !== undefined) { actualizaciones.push(`activo = $${idx++}`); params.push(activo); }
    if (rol) {
        if (!["admin", "supervisor", "operador"].includes(rol)) {
            return res.status(400).json({ error: "Rol inválido." });
        }
        actualizaciones.push(`rol = $${idx++}`);
        params.push(rol);
    }

    if (actualizaciones.length === 0) {
        return res.status(400).json({ error: "Sin campos para actualizar." });
    }

    params.push(id);

    try {
        const result = await pool.query(
            `UPDATE usuarios SET ${actualizaciones.join(", ")}
             WHERE id = $${idx}
             RETURNING id, username, email, rol, activo`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        return res.json(result.rows[0]);
    } catch (err) {
        console.error("Error actualizando usuario:", err.message);
        return res.status(500).json({ error: "Error interno." });
    }
});

function inferirTipoSensor(sensorName) {
    if (!sensorName) return null;
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
