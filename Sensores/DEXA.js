// simulacion de resultados DEXA
// 70% Limpio
// 30% Objeto detectado
function resultadoDexa() {
    const random = Math.random();
    return random < 0.30 ? "Objeto detectado" : "Limpio";
}

const estado = resultadoDexa();

const objeto = {
    sensor: "DEXA_RX",
    zona: "Revision peatonal 1",
    estado: estado,
    nivel_densidad: estado === "Objeto detectado"
    ? Math.floor(Math.random() * 40 + 60)  // 60–100%
    : Math.floor(Math.random() * 20 + 5),   // 5–25%
};

setInterval(() => {
    console.log(objeto)
},3000);