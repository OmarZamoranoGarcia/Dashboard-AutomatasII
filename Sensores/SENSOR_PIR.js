import { enviarSensor } from "./sensorClient.js";

function generarTemperatura() {
  let temp = Math.random() * 5 + 20;
  temp += (Math.random() - 0.5) * 2;
  if (Math.random() < 0.30) {
    temp = Math.random() * 1.5 + 36;
  }
  return Number(temp.toFixed(1));
}

function detectarMovimiento(temp) {
  return temp >= 36 ? "Movimiento detectado" : "Sin movimiento";
}

function crearLectura() {
  const temp = generarTemperatura();
  return {
    Sensor: "Sensor PIR",
    Zona: "Entrada principal",
    Temperatura: temp,
    Presencia: detectarMovimiento(temp),
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
