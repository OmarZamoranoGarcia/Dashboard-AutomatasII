// Un Radar Doppler en una aduana se utiliza principalmente para detección, vigilancia y control del movimiento, aprovechando que esta tecnología mide velocidad y dirección de objetos en movimiento mediante el efecto Doppler.

const mqtt = require("mqtt");

// Configuración de Flespi
const FLESPI_TOKEN = "00JPhGmcOjTYTgZFFMdj0jTsGeF5Bu9MGxhWJI87Jhn6nS3FhEXOQRDjHjYOjIO8";
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: FLESPI_TOKEN,
    password: "",
    keepalive: 60
});

// Función para generar velocidad con picos realistas
// Rango normal en aduana: 5 km/h a 40 km/h (vehículos avanzando lento)
// Pico ocasional: 50–80 km/h (si alguien acelera ilegalmente)
function generarVelocidad() {
    let base = Math.random() * 35 + 5; // 5 a 40 km/h

    // Posible pico
    if (Math.random() < 0.3) {  
        base = Math.random() * 30 + 50; // 50 a 80 km/h
    }
    return Number(base.toFixed(1));
}

// dirección del movimiento
function generarDireccion() {
    const dirs = ["Norte", "Sur", "Este", "Oeste"];
    return dirs[Math.floor(Math.random() * dirs.length)];
}

// estado según velocidad
function estadoVelocidad(vel) {
    return vel > 40 ? "Exceso de velocidad" : "Normal";
}

// envío a flespi cada 3 seg
client.on("connect", () => {
    console.log("Conectado a flespi");

    setInterval(() => {
        const velocidad = generarVelocidad();
        const payload = {
            sensor: "Radar Doppler",
            zona: "Carril 1",
            velocidad_kmh: velocidad,
            direccion: generarDireccion(),
            estado: estadoVelocidad(velocidad)
        };

        client.publish(
            "RADAR_DOPPLER/Carril1",
            JSON.stringify(payload),
            { qos: 1 }
        );

        console.log("Enviado:", payload);

    }, 3000);
});