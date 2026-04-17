import { enviarSensor } from "./sensorClient.js";

function generarRuidoMotor() {
  let ruido = Math.random() * 15 + 70;
  let estado = "Normal";
  if (Math.random() < 0.2) {
    ruido += Math.random() * 10;
    estado = "Posible fallo en motor";
  }
  return { ruido: Number(ruido.toFixed(1)), estado };
}

function crearLectura() {
  const { ruido, estado } = generarRuidoMotor();
  return {
    Sensor: "SONOMETRO",
    Zona: "REVISION 1",
    Nivel_dB: ruido,
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
