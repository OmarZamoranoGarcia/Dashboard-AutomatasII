import "./Card.css"
import Grafico from "./Graph"

function Card ({id, className, data}){
    if (!data) {
    return (
      <article id={id} className={className}>
        <p>No hay data</p>
      </article>
    );
  }
    
    return (
    <article id={id} className={className}>
        <div className="div-data">
            {Object.entries(data).map(([key, value]) => (
                <div className="div-div-data" key={key}>
                    <span>{key}: </span>
                    <span className="noBold">{String(value)}</span>
                </div>
            ))}
        </div>
      <div className="graph">
        <Grafico data={data}/>
      </div>
    </article>
  );
}

export default Card