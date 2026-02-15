import "./Dashboard.css"
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
            <header>
                <h1>Dashboard de Automatas II</h1>
            </header>
            <nav>
                <ul>
                    <a href="">Icon 1</a>
                    <a href="">Icon 2</a>
                </ul>
            </nav>
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
        </main>
    )
}

export default Dashboard