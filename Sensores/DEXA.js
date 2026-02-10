// En una aduana, un escáner DEXA (Dual-Energy X-ray Absorptiometry) no se usa con su propósito médico original, sino para la detección de contrabando oculto en personas.

const mqtt = require("mqtt");

// configuracion de flespi
const FLESPI_TOKEN = "00JPhGmcOjTYTgZFFMdj0jTsGeF5Bu9MGxhWJI87Jhn6nS3FhEXOQRDjHjYOjIO8";
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: FLESPI_TOKEN,
    password: "",
    keepalive: 60
});

// simulacion de resultados DEXA
// 70% Limpio
// 30% Objeto detectado
function resultadoDexa() {
    const random = Math.random();
    return random < 0.30 ? "Objeto detectado" : "Limpio";
}

// envia a flespi cada 3 seg
client.on("connect", () => {
    console.log("Conectado a Flespi");

    setInterval(() => {
        const estado = resultadoDexa();

        const payload = {
            sensor: "DEXA_RX",
            zona: "Revision peatonal 1",
            estado: estado,
            nivel_densidad: estado === "Objeto detectado"
                ? Math.floor(Math.random() * 40 + 60)  // 60–100%
                : Math.floor(Math.random() * 20 + 5),   // 5–25%
        };

        client.publish("DEXA/RX1", JSON.stringify(payload), { qos: 1 });

        console.log("Enviado: ", payload);
    }, 3000); 
});