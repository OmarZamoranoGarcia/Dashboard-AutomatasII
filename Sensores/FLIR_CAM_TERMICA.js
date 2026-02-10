// Una cámara FLIR (Forward Looking Infrared – cámara de imagen térmica) en una aduana se usa principalmente para detección, inspección y seguridad, aprovechando su capacidad de ver calor en lugar de luz visible.

const mqtt = require("mqtt");

// configuracion de flespi mqtt
const FLESPI_TOKEN = "00JPhGmcOjTYTgZFFMdj0jTsGeF5Bu9MGxhWJI87Jhn6nS3FhEXOQRDjHjYOjIO8";
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: FLESPI_TOKEN,
    password: "",
    keepalive: 60
});

// simulacon de temperatura
function generarTempMotor() {
    const r = Math.random();
    let temp;

    if (r < 0.70) {
        // temperatura normal de operación
        temp = Math.random() * (95 - 70) + 70;  // 70–95 °C
    } else if (r < 0.95) {
        // sobrecalentamiento moderado
        temp = Math.random() * (120 - 96) + 96; // 96–120 °C
    } else {
        // calor extremo
        temp = Math.random() * (140 - 121) + 121; // 121–140 °C
    }

    temp = parseFloat(temp.toFixed(2));
    const estado = temp > 100 ? "Muy caliente" : "Normal";
    return { temperatura: temp, estado };
}

//envio a flespi cada 3 seg
client.on("connect", () => {
    console.log("Conectado a Flespi MQTT");

    setInterval(() => {
        const {temperatura, estado} = generarTempMotor();

        const payload = {
            sensor: "FLIR TERMICA",
            zona: "caseta 1",
            temperatura: temperatura,
            estado: estado
        };

        client.publish("FLIR/caseta1", JSON.stringify(payload), { qos: 1 });

        console.log("Enviado: ", payload);
    }, 3000);
});