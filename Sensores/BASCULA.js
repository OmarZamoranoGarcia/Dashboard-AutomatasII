import { enviarSensor } from "./sensorClient.js";

function generarPeso() {
  let peso = Math.random() * (25000 - 8000) + 8000;
  peso += (Math.random() - 0.5) * 1000;
  if (Math.random() < 0.05) {
    peso = Math.random() * 5000 + 25000;
  }
  return Math.round(peso);
}

function crearLectura() {
  return {
    sensor: "_Bascula",
    zona: "Bascula1_",
    peso: generarPeso(),
    unidad: "kg",
  };
}

// Primera lectura inmediata, luego cada 3 segundos
const lectura = crearLectura();
console.log("Enviando:", lectura);
enviarSensor(lectura);

setInterval(() => {
  const lectura = crearLectura();
  console.log("Enviando:", lectura);
  enviarSensor(lectura);
}, 3000);
