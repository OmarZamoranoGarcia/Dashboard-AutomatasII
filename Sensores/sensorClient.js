import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const SENSOR_USERNAME = process.env.SENSOR_USERNAME;
const SENSOR_PASSWORD = process.env.SENSOR_PASSWORD;

let tokenCache = null;

// Obtiene (o reutiliza) el token JWT
async function obtenerToken() {
  if (tokenCache) return tokenCache;

  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: SENSOR_USERNAME,
      password: SENSOR_PASSWORD,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Login fallido: ${data.error || res.status}`);
  }

  const data = await res.json();
  tokenCache = data.token;

  // Limpiar el caché 30 segundos antes de que expire (8 h - 30 s)
  const msExpira = new Date(data.expira_at).getTime() - Date.now() - 30_000;
  setTimeout(() => { tokenCache = null; }, Math.max(msExpira, 0));

  return tokenCache;
}

function serializarObjeto(obj) {
  const pares = Object.entries(obj).map(([key, value]) => {
    if (typeof value === "number") return `${key}: ${value}`;
    const str = String(value);
    if (/[\s\-]/.test(str)) return `${key}: "${str}"`;
    return `${key}: ${str}`;
  });
  return `{\n  ${pares.join(",\n  ")}\n}`;
}

export async function enviarSensor(objeto) {
  const mensaje = serializarObjeto(objeto);

  try {
    // Si el token expiró (401) se reintenta una vez con login fresco
    for (let intento = 0; intento < 2; intento++) {
      const token = await obtenerToken();

      const res = await fetch(`${BACKEND_URL}/api/sensor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mensaje }),
      });

      // Token rechazado → limpiar caché y reintentar
      if (res.status === 401 && intento === 0) {
        tokenCache = null;
        continue;
      }

      const data = await res.json();

      if (!res.ok) {
        console.error(
          `[${objeto.sensor || objeto.Sensor}] Error ${res.status} (${data.etapa || "?"})`,
          data.errores || data.error
        );
      } else {
        const warnings = data.advertencias?.length
          ? `  ${data.advertencias.join(" | ")}`
          : "";
        console.log(
          `[${data.sensor}] Guardado ID=${data.id} @ ${new Date(data.timestamp).toLocaleTimeString()}${warnings}`
        );
      }
      break;
    }
  } catch (err) {
    console.error(`[${objeto.sensor || objeto.Sensor}] Sin conexión:`, err.message);
  }
}
