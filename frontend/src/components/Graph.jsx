// import React from "react";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// // Registrar los componentes de Chart.js
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// const objeto = {
//   Sensor: "DHT22",
//   Zona: "Revision 1",
//   Temperatura: 42,
//   Humedad: 20,
//   Estado: "Ok",
// };

// export default function Grafico() {
//   // Preparar los datos para Chart.js
//   const data = {
//     labels: ["Temperatura", "Humedad"], // etiquetas del eje X
//     datasets: [
//       {
//         label: `${objeto.Sensor} - ${objeto.Zona}`, // título del dataset
//         data: [objeto.Temperatura, objeto.Humedad], // valores del eje Y
//         backgroundColor: ["rgba(255, 99, 132, 0.5)", "rgba(54, 162, 235, 0.5)"], // colores
//         borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: "top",
//       },
//       title: {
//         display: true,
//         text: "Datos del Sensor",
//       },
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//       },
//     },
//   };

//   return (
//     <div style={{ width: "100%", height: "100%" }}>
//       <Bar data={data} options={options} />
//     </div>
//   );
// }

import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Convierte campos no numéricos en valores numéricos para graficar según el tipo de sensor
function extraerDatosNumericos(data) {
  if (!data) return [];

  const sensor = data.Sensor || data.sensor || "";
  const entries = [];

  // Campos numéricos directos
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "number") {
      entries.push([key, value]);
    }
  }

  // Mapeo de valores categóricos a números para sensores específicos
  if (sensor === "MQ-135" && data.Calidad_Aire) {
    const mapa = { "Buena": 1, "Regular": 2, "Mala": 3 };
    entries.push(["Calidad_Aire (num)", mapa[data.Calidad_Aire] || 0]);
  }

  if (sensor === "RFID UHF Reader" && data.Estado) {
    const valor = data.Estado === "Pagado" ? 1 : 0;
    entries.push(["Estado (num)", valor]);
  }

  if (sensor === "LPR") {
    // Para LPR usamos la longitud de la matrícula como valor numérico
    if (data.Matricula) {
      entries.push(["Longitud Matrícula", data.Matricula.length]);
    }
  }

  return entries;
}

const Graph = React.memo(({ data }) => {
  const chartData = useMemo(() => {
    if (!data) return null;

    const numericEntries = extraerDatosNumericos(data);
    if (numericEntries.length === 0) return null;

    const labels = numericEntries.map(([key, value]) => `${key} ${value}`);
    const values = numericEntries.map(([, value]) => value);

    return {
      labels,
      datasets: [
        {
          label: data.Sensor ? `${data.Sensor} - ${data.Zona || ""}` : "Sensor",
          data: values,
          backgroundColor: numericEntries.map((_, i) =>
            i % 2 === 0 ? "rgba(255, 99, 132, 0.5)" : "rgba(54, 162, 235, 0.5)"
          ),
          borderColor: numericEntries.map((_, i) =>
            i % 2 === 0 ? "rgba(255, 99, 132, 1)" : "rgba(54, 162, 235, 1)"
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#ffffff" },
      },
      title: {
        display: true,
        text: "Datos del Sensor",
        color: "#f4eeee",
        font: { size: 14, weight: "bold" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#ffffff" },
      },
      x: {
        ticks: { color: "#f4eeee" },
      },
    },
  }), []);

  if (!chartData) {
    return null; // No renderizar gráfico si no hay datos numéricos
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
});

Graph.displayName = "Graph";
export default Graph;
