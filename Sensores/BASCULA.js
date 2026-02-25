// Función para simular peso del vehículo
function generarPeso() {
    // Peso base trailer/rabón: 8,000 a 25,000 kg
    let peso = Math.random() * (25000 - 8000) + 8000;

    // Variación normal ±500 kg
    peso += (Math.random() - 0.5) * 1000;

    // Pico ocasional 5%
    if (Math.random() < 0.05) {
        peso = Math.random() * 5000 + 25000;
    }

    return Math.round(peso);
}

const objeto = {
            Sensor: "Bascula",
            Zona: "Bascula 1",
            Peso: generarPeso()
        };

setInterval(()=>{
    console.log(objeto)
},3000)