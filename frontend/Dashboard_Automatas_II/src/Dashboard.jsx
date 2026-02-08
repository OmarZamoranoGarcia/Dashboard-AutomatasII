import "./Dashboard.css"
import Nav from "./components/Nav"
import Card from "./components/card"

function Dashboard(){
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
            <section id="dashboard-main-section-nav">
                <Nav></Nav>
                <Card id="sensor10" data={RadarDoppler}></Card>
            </section>
            <section id="dashboard-main-section-panel">
                <Card id="sensor1" className="span2" data={objeto}></Card>
                <Card id="sensor2" className="span2" data={objeto}></Card>
                <Card id="sensor3" className="span2" data={objeto}></Card>
                <Card id="sensor4" data={objeto}></Card>
                <Card id="sensor5" data={objeto}></Card>
                <Card id="sensor6" data={objeto}></Card>
                <Card id="sensor7" data={objeto}></Card>
                <Card id="sensor8" data={objeto}></Card>
                <Card id="sensor9" data={objeto}></Card>
            </section>
        </main>
    )
}

export default Dashboard