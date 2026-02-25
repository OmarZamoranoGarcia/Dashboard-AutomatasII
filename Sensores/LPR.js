// funcion para generar placas aleatorias. Por ejemplo: "GTM-452B" o "MXA-92-4K"
function generarMatricula() {
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numeros = () => Math.floor(Math.random() * 900) + 100;

    // Estilo MX/CA aleatorio simple
    const formato1 = `${letras[rand()]}${letras[rand()]}${letras[rand()]}-${numeros()}`;
    const formato2 = `${letras[rand()]}${letras[rand()]}-${Math.floor(Math.random() * 90 + 10)}-${letras[rand()]}${letras[rand()]}`;

    return Math.random() > 0.5 ? formato1 : formato2;
}

function rand() {
    return Math.floor(Math.random() * 26);
}

const matricula = generarMatricula();
        const objeto = {
            Sensor: "LPR",
            Zona: "Caseta 1",
            Matricula: matricula
        };

setInterval(() => {
    console.log(objeto)
},3000);