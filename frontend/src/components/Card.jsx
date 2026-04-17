import React, { memo, useMemo } from "react";
import "./Card.css";
import Graph from "./Graph";

// Función que determina si hay al menos un dato numérico o mapeable para graficar
function tieneDatosGraficables(data) {
  if (!data) return false;
  const sensor = data.Sensor || data.sensor || "";
  // Verificar campos numéricos directos
  const tieneNumeros = Object.values(data).some(v => typeof v === "number");
  if (tieneNumeros) return true;
  // Verificar mapeos especiales
  if (sensor === "MQ-135" && data.Calidad_Aire) return true;
  if (sensor === "RFID UHF Reader" && data.Estado) return true;
  if (sensor === "LPR" && data.Matricula) return true;
  return false;
}

const Card = memo(({ id, className, data }) => {
  const mostrarGrafico = useMemo(() => tieneDatosGraficables(data), [data]);

  if (!data) {
    return (
      <article id={id} className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5em" }}>
        <p>No data</p>
      </article>
    );
  }

  return (
    <article id={id} className={`${className} ${!mostrarGrafico ? "card-sin-grafico" : ""}`}>
      <div className="div-data">
        {Object.entries(data).map(([key, value]) => (
          <div className="div-div-data" key={key}>
            <span>{key}: </span>
            <span className="noBold">{String(value)}</span>
          </div>
        ))}
      </div>
      {mostrarGrafico && (
        <div className="graph">
          <Graph data={data} />
        </div>
      )}
    </article>
  );
});

Card.displayName = "Card";
export default Card;
