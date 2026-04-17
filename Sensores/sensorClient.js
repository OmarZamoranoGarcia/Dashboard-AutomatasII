// Utilidad compartida: serializa un objeto JS al formato que espera
// el parser léxico/sintáctico del backend y lo envía por POST.

const BACKEND_URL = "http://localhost:3000/api/sensor";

/**
 * Convierte un objeto plano en el string que el parser acepta.
 * Ejemplo: { Sensor: "DHT22", Temperatura: 5 }
 *       -> '{ Sensor: DHT22, Temperatura: 5 }'
 *
 * Reglas:
 *  - Strings con espacios → se envuelven en comillas dobles
 *  - Números             → sin comillas
 *  - Strings sin espacios→ sin comillas
 */
function serializarObjeto(obj) {
  const pares = Object.entries(obj).map(([key, value]) => {
    if (typeof value === "number") {
      return `${key}: ${value}`;
    }
    const str = String(value);
    // Si contiene espacios o caracteres especiales, usar comillas dobles
    if (/[\s\-]/.test(str)) {
      return `${key}: "${str}"`;
    }
    return `${key}: ${str}`;
  });
  return `{\n  ${pares.join(",\n  ")}\n}`;
}

/**
 * Envía el objeto serializado al backend.
 * Imprime en consola el resultado o el error.
 */
export async function enviarSensor(objeto) {
  const mensaje = serializarObjeto(objeto);

  try {
    const res = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensaje }),
    });

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
  } catch (err) {
    console.error(`[${objeto.sensor || objeto.Sensor}] Sin conexión:`, err.message);
  }
}
