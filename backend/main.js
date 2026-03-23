import { parseInput } from "./sintactico.js";
import { analyzeSemantics, cstToFields } from "./semantico.js";

const examples = {
  bascula_ok: `{
    sensor: _Bascula,
    zona: Bascula1_,
    peso: 15000,
    unidad: kg
  }`,

  bascula_warning: `{
    sensor: _Bascula,
    zona: Bascula1_,
    peso: 27000,
    unidad: kg
  }`,

  dht22_ok: `{
    Sensor: DHT22,
    Zona: "Revision 1",
    Temperatura: 5,
    Humedad: 92,
    Estado: "Humedad alta"
  }`,

  dht22_incoherencia: `{
    Sensor: DHT22,
    Zona: "Revision 1",
    Temperatura: 5,
    Humedad: 65,
    Estado: "Humedad alta"
  }`,

  radar_ok: `{
    Sensor: "Radar Doppler",
    Zona: "Carril 1",
    Velocidad_kmh: 25,
    Direccion: Norte,
    Estado: Normal
  }`,

  radar_incoherencia: `{
    Sensor: "Radar Doppler",
    Zona: "Carril 1",
    Velocidad_kmh: 75,
    Direccion: Sur,
    Estado: Normal
  }`,

  sensor_desconocido: `{
    Sensor: SensorXYZ,
    Zona: "Zona 1",
    Valor: 42
  }`,
};

// Distintos escenarios bajo esta linea
const input = examples.bascula_ok;

// Pipeline: Léxico -> Sintáctico -> Semántico
const parseResult = parseInput(input);

if (parseResult.lexErrors) {
  console.error("Errores léxicos:", parseResult.lexErrors);
  process.exit(1);
}

if (parseResult.parseErrors) {
  console.error("Errores sintácticos:", parseResult.parseErrors);
  process.exit(1);
}

const fields = cstToFields(parseResult.cst);
const semantic = analyzeSemantics(fields);

console.log("Sensor:", semantic.sensorName);
console.log("Campos:", fields);

if (semantic.warnings.length > 0) {
  console.warn("Advertencias:", semantic.warnings);
}

if (!semantic.valid) {
  console.error("Errores semánticos:", semantic.errors);
  process.exit(1);
}

console.log("Mensaje válido.");
