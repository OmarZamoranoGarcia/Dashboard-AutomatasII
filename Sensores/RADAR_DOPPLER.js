import { enviarSensor } from "./sensorClient.js";

function generarVelocidad() {
  let base = Math.random() * 35 + 5;
  if (Math.random() < 0.3) {
    base = Math.random() * 30 + 50;
  }
  return Number(base.toFixed(1));
}

function generarDireccion() {
  const dirs = ["Norte", "Sur", "Este", "Oeste"];
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function estadoVelocidad(vel) {
  return vel > 40 ? "Exceso de velocidad" : "Normal";
}

function crearLectura() {
  const velocidad = generarVelocidad();
  return {
    Sensor: "Radar Doppler",
    Zona: "Carril 1",
    Velocidad_kmh: velocidad,
    Direccion: generarDireccion(),
    Estado: estadoVelocidad(velocidad),
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
