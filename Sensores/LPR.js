// El significado de LPR o ALPR es Reconocimiento Automático de Placa de Matrículas por sus siglas en inglés. Es un sistema capaz de detectar, y reproducir digitalmente los caracteres de la placa o matrícula de un vehículo por medio de captura de video.

const mqtt = require("mqtt");

// configuracion de flespi
const FLESPI_TOKEN = "00JPhGmcOjTYTgZFFMdj0jTsGeF5Bu9MGxhWJI87Jhn6nS3FhEXOQRDjHjYOjIO8";
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: FLESPI_TOKEN,
    password: "",
    keepalive: 60
});

// funcion para generar placas aleatorias. Por ejemplo: "GTM-452B" o "MXA-92-4K"
function generarMatricula() {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numeros = () => Math.floor(Math.random() * 900) + 100;

    // Estilo MX/CA aleatorio simple
    const formato1 = `${letras[rand()]}${letras[rand()]}${letras[rand()]}-${numeros()}`;
    const formato2 = `${letras[rand()]}${letras[rand()]}-${Math.floor(Math.random() * 90 + 10)}-${letras[rand()]}${letras[rand()]}`;

    return Math.random() > 0.5 ? formato1 : formato2;
}

function rand() {
    return Math.floor(Math.random() * 26);
}

// envio a flespi por mqtt cada 3 seg
client.on("connect", () => {
    console.log("Conectado a Flespi");

    setInterval(() => {
        const matricula = generarMatricula();
        const payload = {
            sensor: "LPR",
            zona: "Caseta 1",
            placa_detectada: matricula
        };

        client.publish(
            "LPR/camera1",
            JSON.stringify(payload),
            { qos: 1 }
        );

        console.log("Enviado:", payload);

    }, 3000); 
});