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

const { ruido, estado } = generarRuidoMotor();

        const objeto = {
            Sensor: "SONOMETRO",
            Zona: "REVISION 1",
            Nivel_dB: ruido,
            Estado: estado
        };

setInterval(() => {
    console.log(objeto)
},3000);