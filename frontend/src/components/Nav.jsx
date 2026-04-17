import React from "react";
import "./Nav.css";

const Nav = ({
    sensores,
    onSensorChange,
    onTimeChange,
    selectedSensor,
    selectedTime,
    onPreviewClick,
}) => {
    const timeOptions = [
        { value: "1",   label: "1 minuto" },
        { value: "2",   label: "2 minutos" },
        { value: "3",   label: "3 minutos" },
        { value: "5",   label: "5 minutos" },
        { value: "10",  label: "10 minutos" },
        { value: "30",  label: "30 minutos" },
        { value: "60",  label: "1 hora" },
    ];

    return (
        <nav className="nav_container">
            <div className="nav_controls">
                <div className="control_group">
                    <label htmlFor="sensor-select">Sensor:</label>
                    <select
                        id="sensor-select"
                        value={selectedSensor}
                        onChange={(e) => onSensorChange(e.target.value)}
                        className="nav_select"
                    >
                        <option value="">Todos</option>
                        {sensores.map((s) => (
                            <option key={s.sensor} value={s.sensor}>
                                {s.sensor}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="control_group">
                    <label htmlFor="time-select">Últimos:</label>
                    <select
                        id="time-select"
                        value={selectedTime}
                        onChange={(e) => onTimeChange(e.target.value)}
                        className="nav_select"
                    >
                        {timeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button className="preview_button" onClick={onPreviewClick}>
                    <span>🔍</span> Vista Previa
                </button>
            </div>
        </nav>
    );
};

export default Nav;
