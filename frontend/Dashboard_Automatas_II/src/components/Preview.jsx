import React from "react";
import Grafico from "./Graph"; 
import "./Preview.css";

const Preview = ({ isOpen, onClose, selectedSensor, selectedTime }) => {
  if (!isOpen) return null;

  // Datos de ejemplo para cada sensor
  const getSensorData = (sensorId) => {
    const exampleData = {
      sensor1: { Sensor: "Sensor 1", Zona: "Zona Norte", Temperatura: 23.5, Humedad: 65, Presion: 1013 },
      sensor2: { Sensor: "Sensor 2", Zona: "Zona Sur", Temperatura: 24.2, Humedad: 58, Presion: 1012 },
      sensor3: { Sensor: "Sensor 3", Zona: "Zona Este", Temperatura: 22.8, Humedad: 72, Presion: 1014 },
      sensor4: { Sensor: "Sensor 4", Zona: "Zona Oeste", Temperatura: 25.1, Humedad: 55, Presion: 1011 },
      sensor5: { Sensor: "Sensor 5", Zona: "Zona Centro", Temperatura: 23.9, Humedad: 68, Presion: 1013 },
      sensor6: { Sensor: "Sensor 6", Zona: "Zona Industrial", Voltaje: 220, Corriente: 15, Potencia: 3300 },
      sensor7: { Sensor: "Sensor 7", Zona: "Zona Residencial", Vibracion: 0.5, Ruido: 45, Temperatura: 24.0 },
      sensor8: { Sensor: "Sensor 8", Zona: "Zona Comercial", Ruido: 62, CalidadAire: 85, Humedad: 60 },
      sensor9: { Sensor: "Sensor 9", Zona: "Zona Parque", Luz: 850, Temperatura: 22.5, Humedad: 70 },
      sensor10: { Sensor: "Sensor 10", Zona: "Zona Estacionamiento", Movimiento: 12, Ocupacion: 45, Temperatura: 23.0 }
    };
    
    return exampleData[sensorId] || { Sensor: sensorId, Datos: "No disponibles" };
  };

  const sensors = [
    { id: 'sensor1', name: 'Sensor 1 - DHT22' },
    { id: 'sensor2', name: 'Sensor 2 - DHT22' },
    { id: 'sensor3', name: 'Sensor 3 - DHT22' },
    { id: 'sensor4', name: 'Sensor 4 - DHT22' },
    { id: 'sensor5', name: 'Sensor 5 - DHT22' },
    { id: 'sensor6', name: 'Sensor 6 - DHT22' },
    { id: 'sensor7', name: 'Sensor 7 - DHT22' },
    { id: 'sensor8', name: 'Sensor 8 - DHT22' },
    { id: 'sensor9', name: 'Sensor 9 - DHT22' },
    { id: 'sensor10', name: 'Sensor 10 - Radar Doppler' }
  ];

  const isCurrentSensor = (sensorId) => sensorId === selectedSensor;

  return (
    <div className="preview_overlay" onClick={onClose}>
      <div className="preview_modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview_header">
          <h2>Vista Previa de Todos los Sensores</h2>
          <div className="preview_info">
            <span>Sensor actual: {selectedSensor}</span>
            <span>Tiempo seleccionado: {selectedTime}</span>
          </div>
          <button className="preview_close" onClick={onClose}>×</button>
        </div>
        
        <div className="preview_content">
          {sensors.map(sensor => {
            const sensorData = getSensorData(sensor.id);
            const isSelected = isCurrentSensor(sensor.id);
            
            return (
              <div key={sensor.id} className={`preview_sensor-card ${isSelected ? 'selected' : ''}`}>
                <div className="preview_sensor-header">
                  <h3>{sensor.name}</h3>
                  {isSelected && <span className="preview_badge">Seleccionado</span>}
                </div>
                <div className="preview_chart-container">
                  <Grafico data={sensorData} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Preview;