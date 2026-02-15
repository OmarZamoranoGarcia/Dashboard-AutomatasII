// simulacon de temperatura
function generarTempMotor() {
    const r = Math.random();
    let temp;

    if (r < 0.70) {
        // temperatura normal de operación
        temp = Math.random() * (95 - 70) + 70;  // 70–95 °C
    } else if (r < 0.95) {
        // sobrecalentamiento moderado
        temp = Math.random() * (120 - 96) + 96; // 96–120 °C
    } else {
        // calor extremo
        temp = Math.random() * (140 - 121) + 121; // 121–140 °C
    }

    temp = parseFloat(temp.toFixed(2));
    const estado = temp > 100 ? "Muy caliente" : "Normal";
    return { temperatura: temp, estado };
}

const {temperatura, estado} = generarTempMotor();

        const objeto = {
            Sensor: "FLIR TERMICA",
            Zona: "caseta 1",
            Temperatura: temperatura,
            Estado: estado
        };