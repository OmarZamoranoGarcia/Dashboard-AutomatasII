import React from 'react';
import './Nav.css';
import LogoutButton from './LogoutButton'

const Nav = ({ 
    onSensorChange, 
    onTimeChange, 
    selectedSensor, 
    selectedTime,
    onPreviewClick 
}) => {
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

    const timeOptions = [
        { value: '1min', label: '1 minuto' },
        { value: '2min', label: '2 minutos' },
        { value: '3min', label: '3 minutos' },
        { value: '4min', label: '4 minutos' },
        { value: '5min', label: '5 minutos' }
    ];

    return (
        <nav className="nav_container">
            <div className="nav_controls">
                <div className="control_group">
                    <label htmlFor="sensor-select">Seleccionar Sensor:</label>
                    <select 
                        id="sensor-select"
                        value={selectedSensor} 
                        onChange={(e) => onSensorChange(e.target.value)}
                        className="nav_select"
                    >
                        {sensors.map(sensor => (
                            <option key={sensor.id} value={sensor.id}>
                                {sensor.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="control_group">
                    <label htmlFor="time-select">Visualizar últimos:</label>
                    <select 
                        id="time-select"
                        value={selectedTime} 
                        onChange={(e) => onTimeChange(e.target.value)}
                        className="nav_select"
                    >
                        {timeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button className="preview_button" onClick={onPreviewClick}>
                    <span>🔍</span> Vista Previa
                </button>
            </div>
            <LogoutButton></LogoutButton>
        </nav>
    );
};

export default Nav;