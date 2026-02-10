// Una bascula se usa mucho en una aduana para saber el peso real de toda la unidad, esto con el fin de saber si el peso de la carga mas la suma de la unidad es un peso segura para transitar.

const mqtt = require("mqtt");

// Configuración de Flespi
const FLESPI_TOKEN = "00JPhGmcOjTYTgZFFMdj0jTsGeF5Bu9MGxhWJI87Jhn6nS3FhEXOQRDjHjYOjIO8";
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: FLESPI_TOKEN,
    password: "",
    keepalive: 60
});

// Función para simular peso del vehículo
function generarPeso() {
    // Peso base trailer/rabón: 8,000 a 25,000 kg
    let peso = Math.random() * (25000 - 8000) + 8000;

    // Variación normal ±500 kg
    peso += (Math.random() - 0.5) * 1000;

    // Pico ocasional 5%
    if (Math.random() < 0.05) {
        peso = Math.random() * 5000 + 25000;
    }

    return Math.round(peso);
}

// Envío a Flespi cada 3 segundos
client.on("connect", () => {
    console.log("Conectado a Flespi");

    setInterval(() => {
        const peso = generarPeso();
        const payload = {
            sensor: "Bascula",
            zona: "Bascula 1",
            peso_kg: peso
        };

        client.publish(
            "BASCULA/Bascula1",
            JSON.stringify(payload),
            { qos: 1 }
        );

        console.log("Enviado:", payload);

    }, 3000);
});