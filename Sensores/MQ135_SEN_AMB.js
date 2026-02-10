// El sensor MQ-135 es un sensor que mide la calidad del aire y dependiendo del voltaje es la concentracion del tipo de gas, es decir, no identifica el gas sino la calidad del aire en base a los gases presentes.

const mqtt = require("mqtt");

// Configuración de Flespi
const FLESPI_TOKEN = "00JPhGmcOjTYTgZFFMdj0jTsGeF5Bu9MGxhWJI87Jhn6nS3FhEXOQRDjHjYOjIO8";
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: FLESPI_TOKEN,
    password: "",
    keepalive: 60
});

// Función para simular calidad del aire
function generarCalidadAire() {
    const prob = Math.random();
    if (prob < 0.3) return "Mala";
    if (prob < 0.6) return "Regular";
    return "Buena";
}

// envio a Flespi cada 3 seg
client.on("connect", () => {
    console.log("Conectado a Flespi");

    setInterval(() => {
        const calidad = generarCalidadAire();
        const payload = {
            sensor: "MQ-135",
            zona: "Oficina 1",
            calidad_aire: calidad
        };

        client.publish(
            "MQ135/Oficina1",
            JSON.stringify(payload),
            { qos: 1 }
        );

        console.log("Enviado:", payload);

    }, 3000);
});