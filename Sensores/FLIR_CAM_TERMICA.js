import { enviarSensor } from "./sensorClient.js";

function generarTempMotor() {
  const r = Math.random();
  let temp;
  if (r < 0.70) {
    temp = Math.random() * (95 - 70) + 70;
  } else if (r < 0.95) {
    temp = Math.random() * (120 - 96) + 96;
  } else {
    temp = Math.random() * (140 - 121) + 121;
  }
  temp = parseFloat(temp.toFixed(2));
  const estado = temp > 100 ? "Muy caliente" : "Normal";
  return { temperatura: temp, estado };
}

function crearLectura() {
  const { temperatura, estado } = generarTempMotor();
  return {
    Sensor: "FLIR TERMICA",
    Zona: "caseta 1",
    Temperatura: temperatura,
    Estado: estado,
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
