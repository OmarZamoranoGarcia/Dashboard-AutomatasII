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

const objeto = {
            Sensor: "RFID UHF Reader",
            Zona: "caseta 1",
            Tag: generarEPC(),
            Unidad: obtenerUnidad(),
            Estado: estadoPedimento()
        };