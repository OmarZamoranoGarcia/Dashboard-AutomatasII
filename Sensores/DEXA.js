import { enviarSensor } from "./sensorClient.js";

function crearLectura() {
  const random = Math.random();
  const estado = random < 0.30 ? "Objeto detectado" : "Limpio";
  return {
    sensor: "DEXA_RX",
    zona: "Revision peatonal 1",
    estado: estado,
    nivel_densidad:
      estado === "Objeto detectado"
        ? Math.floor(Math.random() * 40 + 60)  // 60–100%
        : Math.floor(Math.random() * 20 + 5),  // 5–25%
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
