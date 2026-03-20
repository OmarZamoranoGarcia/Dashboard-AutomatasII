import "./Dashboard.css"
import Card from "./components/Card"
import Nav from './components/Nav';
import Preview from "./components/Preview";
import { useState } from "react";

function Dashboard(){
    // Estado de los sensores para el ejemplo del preview
    const [selectedSensor, setSelectedSensor] = useState('sensor1');
    const [selectedTime, setSelectedTime] = useState('1min');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleSensorChange = (sensorId) => {
        setSelectedSensor(sensorId);
        console.log(`Sensor seleccionado: ${sensorId}`);
    };

    const handleTimeChange = (timeValue) => {
        setSelectedTime(timeValue);
        console.log(`Tiempo seleccionado: ${timeValue}`);
    };

    const handlePreviewClick = () => {
        setIsPreviewOpen(true);
        console.log('Abrir preview');
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        console.log('Cerrar preview');
    };

    const objeto={ //objeto de prueba
        Sensor: "DHT22",
        Zona: "Revision 1",
        Temperatura: 42,
        Humedad: 20,
        Estado: "Ok"
    }

    const RadarDoppler = {
        Sensor: "Radar Doppler",
        Zona: "Carril 1",
        velocidad_kmh: 23,
        direccion: "Sur",
        estado: "Ok"
    }

    return(
        <main>
            <header>
                <h1>Dashboard de Automatas II</h1>
            </header>
            <Nav 
                onSensorChange={handleSensorChange}
                onTimeChange={handleTimeChange}
                selectedSensor={selectedSensor}
                selectedTime={selectedTime}
                onPreviewClick={handlePreviewClick}
            />
            <section id="dashboard-main-section-panel">
                <Card id="sensor1" className="spanCol2" data={objeto}></Card>
                <Card id="sensor2" className="spanCol2" data={objeto}></Card>
                <Card id="sensor3" className="spanCol2" data={objeto}></Card>
                <Card id="sensor4" data={objeto}></Card>
                <Card id="sensor5" data={objeto}></Card>
                <Card id="sensor6" data={objeto}></Card>
                <Card id="sensor7" className="spanRow2" data={objeto}></Card>
                <Card id="sensor8" className="spanRow2" data={objeto}></Card>
                <Card id="sensor9" className="spanRow2" data={objeto}></Card>
                <Card id="sensor10" data={RadarDoppler}></Card>
            </section>
            <Preview 
                isOpen={isPreviewOpen}
                onClose={handleClosePreview}
                selectedSensor={selectedSensor}
                selectedTime={selectedTime}
            />
        </main>
    )
}

export default Dashboard