// Un sonometro en una aduana se usa regularmente para detectar niveles extraños de ruido en los motores de las unidades, ya que es mas facil detectar fallas en base al ruido de estas.

const mqtt = require("mqtt");

// Configuración de Flespi
const FLESPI_TOKEN = "00JPhGmcOjTYTgZFFMdj0jTsGeF5Bu9MGxhWJI87Jhn6nS3FhEXOQRDjHjYOjIO8";
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: FLESPI_TOKEN,
    password: "",
    keepalive: 60
});

// Función para simular nivel de ruido de motor
function generarRuidoMotor() {
    // Nivel normal: 70–85 dB
    let ruido = Math.random() * 15 + 70;

    // Pico ocasional: 20% de probabilidad
    let estado = "Normal";
    if (Math.random() < 0.2) {
        ruido += Math.random() * 10; // 10 dB extra
        estado = "Posible fallo en motor";
    }

    return { ruido: Number(ruido.toFixed(1)), estado };
}

// Envío a Flespi cada 3 segundos
client.on("connect", () => {
    console.log("Conectado a Flespi");

    setInterval(() => {
        const { ruido, estado } = generarRuidoMotor();

        const payload = {
            sensor: "SONOMETRO",
            zona: "REVISION 1",
            nivel_dB: ruido,
            estado: estado
        };

        client.publish(
            "SONOMETRO/Revision1",
            JSON.stringify(payload),
            { qos: 1 }
        );

        console.log("Enviado:", payload);

    }, 3000);
});