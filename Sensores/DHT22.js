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

const temp = generarTemperatura();
const hum = generarHumedad();

const objeto = {
    Sensor: "DHT22",
    Zona: "Revision 1",
    Temperatura: temp,
    Humedad: hum,
    Estado: estadoHumedad(hum),
    };