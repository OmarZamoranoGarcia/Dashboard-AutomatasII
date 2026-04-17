import { enviarSensor } from "./sensorClient.js";

function generarCalidadAire() {
  const prob = Math.random();
  if (prob < 0.3) return "Mala";
  if (prob < 0.6) return "Regular";
  return "Buena";
}

function crearLectura() {
  return {
    Sensor: "MQ-135",
    Zona: "Oficina 1",
    Calidad_Aire: generarCalidadAire(),
  };
}

const lectura = crearLectura();
console.log("Enviando:", lectura);
enviarSensor(lectura);

setInterval(() => {
  const lectura = crearLectura();
  console.log("Enviando:", lectura);
  enviarSensor(lectura);
}, 3000);
