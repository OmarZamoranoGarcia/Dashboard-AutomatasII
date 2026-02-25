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

const temp = generarTemperatura();
        const objeto = {
            Sensor: "Sensor PIR",
            Zona: "Entrada principal",
            Temperatura: temp,
            Presencia: detectarMovimiento(temp),
        };

setInterval(() => {
    console.log(objeto)
},3000);