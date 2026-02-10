// Un sensor PIR (Passive Infrared Sensor) en una aduana se utiliza principalmente para detectar movimiento de personas basándose en los cambios de radiación infrarroja emitida por cuerpos calientes, como los humanos. Es un dispositivo pasivo, no emite señales, solo detecta cambios de calor.

const mqtt = require("mqtt");

// Configuración de Flespi
const FLESPI_TOKEN = "00JPhGmcOjTYTgZFFMdj0jTsGeF5Bu9MGxhWJI87Jhn6nS3FhEXOQRDjHjYOjIO8";
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: FLESPI_TOKEN,
    password: "",
    keepalive: 60
});

function generarTemperatura(){
    // Temperatura base del ambiente: 20–25 °C
    let temp = Math.random() * 5 + 20; // 20 a 25

    // Pequeños cambios normales ±1 °C
    temp += (Math.random() - 0.5) * 2;

    // Pico ocasional
    if (Math.random() < 0.30) {
        temp = Math.random() * 1.5 + 36; // 36 a 37.5 °C
    }

    return temp.toFixed(1);
}

// Función para simular detección PIR
function detectarMovimiento(temp) {
    return (temp < 36)? "Sin movimiento" : "Movimiento detectado";
}

// Envío a Flespi cada 3 seg
client.on("connect", () => {
    console.log("Conectado a flespi");

    setInterval(() => {
        const temp = generarTemperatura();
        const payload = {
            sensor: "Sensor PIR",
            zona: "Entrada principal",
            temp: temp,
            presencia: detectarMovimiento(temp),
        };

        client.publish(
            "PIR/entradaPrincipal",
            JSON.stringify(payload),
            { qos: 1 }
        );

        console.log("Enviado:", payload);

    }, 3000);
});