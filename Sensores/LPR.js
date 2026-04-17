import { enviarSensor } from "./sensorClient.js";

function rand() {
  return Math.floor(Math.random() * 26);
}

function generarMatricula() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = () => Math.floor(Math.random() * 900) + 100;
  // El parser semántico espera formato /^[A-Z]{2,3}-\d{2,3}(-[A-Z]{0,2})?$/
  // formato1: "ABC-123"  formato2: "AB-12-CD"  → ambos cumplen el regex
  const formato1 = `${letras[rand()]}${letras[rand()]}${letras[rand()]}-${numeros()}`;
  const formato2 = `${letras[rand()]}${letras[rand()]}-${Math.floor(Math.random() * 90 + 10)}-${letras[rand()]}${letras[rand()]}`;
  return Math.random() > 0.5 ? formato1 : formato2;
}

function crearLectura() {
  return {
    Sensor: "LPR",
    Zona: "Caseta 1",
    Matricula: generarMatricula(),
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
