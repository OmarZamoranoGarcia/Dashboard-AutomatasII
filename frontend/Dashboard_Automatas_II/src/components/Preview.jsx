import React from "react";
import Grafico from "./Graph";
import "./Preview.css";

// Agrupa un array de lecturas por nombre de sensor
function agruparPorSensor(lecturas) {
    const grupos = {};
    for (const lectura of lecturas) {
        const nombre = lectura.sensor;
        if (!grupos[nombre]) grupos[nombre] = [];
        grupos[nombre].push(lectura.datos);
    }
    return grupos;
}

const Preview = ({ isOpen, onClose, selectedSensor, selectedTime, lecturas = [], cargando }) => {
    if (!isOpen) return null;

    const etiquetaTiempo = `${selectedTime} min`;

    // Si hay sensor seleccionado mostrar solo ese, si no mostrar todos agrupados
    const grupos = agruparPorSensor(lecturas);
    const entradas = Object.entries(grupos);

    return (
        <div className="preview_overlay" onClick={onClose}>
            <div className="preview_modal" onClick={(e) => e.stopPropagation()}>
                <div className="preview_header">
                    <h2>Vista Previa</h2>
                    <div className="preview_info">
                        {selectedSensor
                            ? <span>Sensor: {selectedSensor}</span>
                            : <span>Todos los sensores</span>
                        }
                        <span>Últimos: {etiquetaTiempo}</span>
                    </div>
                    <button className="preview_close" onClick={onClose}>×</button>
                </div>

                <div className="preview_content">
                    {cargando && (
                        <p className="preview_mensaje">Cargando lecturas...</p>
                    )}

                    {!cargando && entradas.length === 0 && (
                        <p className="preview_mensaje">
                            Sin lecturas para los filtros seleccionados.
                        </p>
                    )}

                    {entradas.map(([nombre, datosArray]) => (
                        <div key={nombre} className="preview_sensor-card">
                            <div className="preview_sensor-header">
                                <h3>{nombre}</h3>
                                <span className="preview_badge">{datosArray.length} lectura(s)</span>
                            </div>
                            <div className="preview_chart-container">
                                <Grafico data={datosArray[0]} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Preview;
