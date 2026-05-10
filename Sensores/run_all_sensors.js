// Lanza todos los sensores en paralelo como procesos hijos.
// Uso: node run_all_sensors.js

import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SENSORES = [
  "BASCULA.js",
  "DEXA.js",
  "DHT22.js",
  "FLIR_CAM_TERMICA.js",
  "LPR.js",
  "MQ135_SEN_AMB.js",
  "RADAR_DOPPLER.js",
  "RFID_UHF_READER.js",
  "SENSOR_PIR.js",
  "SONOMETRO.js",
];

// Colores ANSI para distinguir cada sensor en la consola
const COLORES = ["\x1b[36m","\x1b[33m","\x1b[32m","\x1b[35m","\x1b[34m",
                 "\x1b[91m","\x1b[92m","\x1b[93m","\x1b[94m","\x1b[95m"];
const RESET = "\x1b[0m";

const procesos = [];

async function iniciarSensores() {
  for (let i = 0; i < SENSORES.length; i++) {
    const archivo = SENSORES[i];
    const nombre = archivo.replace(".js", "");
    const color  = COLORES[i % COLORES.length];
    const prefijo = `${color}[${nombre}]${RESET}`;

    // Esperar 2 segundos entre el inicio de cada sensor para no saturar la RAM
    await new Promise(resolve => setTimeout(resolve, 2000));

    const proc = spawn("node", [join(__dirname, archivo)], {
      cwd: __dirname,
    });

    procesos.push(proc);

    proc.stdout.on("data", (data) => {
      String(data).trimEnd().split("\n").forEach((linea) => {
        console.log(`${prefijo} ${linea}`);
      });
    });

    proc.stderr.on("data", (data) => {
      String(data).trimEnd().split("\n").forEach((linea) => {
        console.error(`${prefijo} ${linea}`);
      });
    });

    console.log(`${prefijo} ▶ Iniciado (PID ${proc.pid})`);
  }
}

iniciarSensores();

function shutdown() {
  console.log("\nDeteniendo todos los sensores...");
  procesos.forEach((p) => p.kill());
  process.exit(0);
}

process.on("SIGINT",  shutdown);
process.on("SIGTERM", shutdown);

console.log(`\n${SENSORES.length} sensores activos. Presiona Ctrl+C para detenerlos.\n`);
