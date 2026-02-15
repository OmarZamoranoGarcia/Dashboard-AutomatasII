// Función para simular calidad del aire
function generarCalidadAire() {
    const prob = Math.random();
    if (prob < 0.3) return "Mala";
    if (prob < 0.6) return "Regular";
    return "Buena";
}

const calidad = generarCalidadAire();
        const objeto = {
            Sensor: "MQ-135",
            Zona: "Oficina 1",
            Calidad_Aire: calidad
        };