// Un RFID UHF Reader (lector RFID de Ultra High Frequency) es un dispositivo que lee y escribe información en etiquetas RFID que operan en el rango de 860–960 MHz.

const mqtt = require("mqtt");

// configuracion de flespi mqtt
const FLESPI_TOKEN = "00JPhGmcOjTYTgZFFMdj0jTsGeF5Bu9MGxhWJI87Jhn6nS3FhEXOQRDjHjYOjIO8";
const client = mqtt.connect("mqtt://mqtt.flespi.io", {
    username: FLESPI_TOKEN,
    password: "",
    keepalive: 60
});

// array de unidades
const unidades = [
    "Rabon GMC Blanco 2005",
    "Step Ban Ford 450 Amarillo 1995",
    "Panel Ford 250 Blanca 2000",
    "Rabon Ford Blanco 1989",
    "Trailer T680 kenworth Rojo 2025"
];

// generar un EPC (lectura de una etiqueta)
function generarEPC() {
    const hex = "0123456789ABCDEF";
    let epc = "";
    for (let i = 0; i < 24; i++) {
        epc += hex[Math.floor(Math.random() * 16)];
    }
    return epc;
}

// funcion para obtener el modelo de una unidad aleatoria
function obtenerUnidad() {
    return unidades[Math.floor(Math.random() * unidades.length)];
}

// dependiendo de la cadena de la etiqueta, se sabra si el pedimento se pagó o no
function estadoPedimento() {
    return Math.random() < 0.7 ? "Pagado" : "Sin pagar";
}

// Eenvio a flespi cada 3 seg
client.on("connect", () => {
    console.log("Conectado a Flespi MQTT");

    setInterval(() => {
        const payload = {
            sensor: "RFID UHF Reader",
            zona: "caseta 1",
            tag: generarEPC(),
            unidad: obtenerUnidad(),
            estado: estadoPedimento()
        };

        client.publish("RFID_UHF/reader1", JSON.stringify(payload), { qos: 1 });

        console.log("Enviado: ", payload);
    }, 3000); 
});