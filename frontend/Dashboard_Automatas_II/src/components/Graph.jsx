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

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Ticks,
} from "chart.js";

// Registrar los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Grafico({ data }) {
  if (!data) return <p>No hay datos para graficar</p>;

  // Filtrar solo los valores numéricos del objeto
  const numericData = Object.entries(data).filter(([_, value]) => typeof value === "number");

  // Preparar los datos para Chart.js
  const chartData = {
    labels: numericData.map(([key, value]) => `${key} ${value}`), // etiquetas dinámicas
    datasets: [
      {
        label: data.Sensor ? `${data.Sensor} - ${data.Zona || ""}` : "Sensor",
        data: numericData.map(([_, value]) => value), // valores dinámicos
        backgroundColor: numericData.map((_, i) =>
          i % 2 === 0 ? "rgba(255, 99, 132, 0.5)" : "rgba(54, 162, 235, 0.5)"
        ),
        borderColor: numericData.map((_, i) =>
          i % 2 === 0 ? "rgba(255, 99, 132, 1)" : "rgba(54, 162, 235, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
            color: "#ffffff",
        }
      },
      title: {
        display: true,
        text: "Datos del Sensor",
        color: "#f4eeee",         
        font: {
            size: 14,  
            weight: "bold"        
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
            color: "#ffffff",
        }
      },
      x: {
        beginAtZero: true,
        ticks: {
            color: "#f4eeee",
        }
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
