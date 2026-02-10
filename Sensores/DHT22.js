// Un sensor DTH22 mide temperatura y humedad. En una aduana se suelen usar para el monitoreo de contenedores refigerados para ver si estan dentro de los margenes legales y seguros.

const mqtt = require("mqtt");

// Configuración de Flespi
const FLESPI_TOKEN = "00JPhGmcOjTYTgZFFMdj0jTsGeF5Bu9MGxhWJI87Jhn6nS3FhEXOQRDjHjYOjIO8";
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: FLESPI_TOKEN,
    password: "",
    keepalive: 60
});

// Función para simular temperatura de contenedor refrigerado
function generarTemperatura() {
    let temp = Math.random() * 6 + 2; // 2 a 8 °C
    temp += (Math.random() - 0.5);    // pequeña variación ±0.5
    return Number(temp.toFixed(1));
}

// Función para simular humedad
function generarHumedad() {
    let hum = Math.random() * 20 + 60; // 60 a 80 %
    hum += (Math.random() - 0.5) * 5;  // pequeña variación ±2.5%
    if (Math.random() < 0.3) hum = Math.random() * 5 + 90; // 90–95 %
    return Number(hum.toFixed(1));
}

// Determinar estado de humedad
function estadoHumedad(hum) {
    return hum > 85 ? "Humedad alta" : "Normal";
}

// Envío a Flespi cada 3 segundos
client.on("connect", () => {
    console.log("Conectado a Flespi");

    setInterval(() => {
        const temp = generarTemperatura();
        const hum = generarHumedad();

        const payload = {
            sensor: "DHT22",
            zona: "Revision 1",
            temperatura_C: temp,
            humedad_pct: hum,
            estado: estadoHumedad(hum),
        };

        client.publish(
            "DHT22/Revision1",
            JSON.stringify(payload),
            { qos: 1 }
        );

        console.log("Enviado:", payload);

    }, 3000);
});