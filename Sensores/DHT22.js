import { enviarSensor } from "./sensorClient.js";

function generarTemperatura() {
  let temp = Math.random() * 6 + 2;
  temp += (Math.random() - 0.5);
  return Number(temp.toFixed(1));
}

function generarHumedad() {
  let hum = Math.random() * 20 + 60;
  hum += (Math.random() - 0.5) * 5;
  if (Math.random() < 0.3) hum = Math.random() * 5 + 90;
  return Number(hum.toFixed(1));
}

function estadoHumedad(hum) {
  return hum > 85 ? "Humedad alta" : "Normal";
}

function crearLectura() {
  const temp = generarTemperatura();
  const hum = generarHumedad();
  return {
    Sensor: "DHT22",
    Zona: "Revision 1",
    Temperatura: temp,
    Humedad: hum,
    Estado: estadoHumedad(hum),
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
