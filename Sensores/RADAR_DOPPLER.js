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

const velocidad = generarVelocidad();
        const objeto = {
            Sensor: "Radar Doppler",
            Zona: "Carril 1",
            Velocidad_kmh: velocidad,
            Direccion: generarDireccion(),
            Estado: estadoVelocidad(velocidad)
        };

setInterval(() => {
    console.log(objeto)
},3000);