import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import "./DextUploader.css";

export default function DextUploader({ onProcesado }) {
    const { apiFetch } = useAuth();

    const [arrastrando, setArrastrando] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [error, setError] = useState("");
    const inputRef = useRef(null);

    function validarArchivo(file) {
        if (!file) return "No se seleccionó ningún archivo.";
        if (!file.name.endsWith(".dext")) return "Solo se permiten archivos con extensión .dext";
        if (file.size > 5 * 1024 * 1024) return "El archivo supera el límite de 5 MB.";
        return null;
    }

    async function procesarArchivo(file) {
        const errorValidacion = validarArchivo(file);
        if (errorValidacion) {
            setError(errorValidacion);
            return;
        }

        setError("");
        setResultado(null);
        setCargando(true);

        const formData = new FormData();
        formData.append("archivo", file);

        try {
            const res = await apiFetch("/api/dext/procesar", {
                method: "POST",
                headers: {},
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Error al procesar el archivo.");
                return;
            }

            setResultado(data);
            onProcesado?.(data);
        } catch (err) {
            setError(err.message || "Error de conexión.");
        } finally {
            setCargando(false);
        }
    }

    function handleFileInput(e) {
        const file = e.target.files?.[0];
        if (file) procesarArchivo(file);
        e.target.value = "";
    }

    function handleDrop(e) {
        e.preventDefault();
        setArrastrando(false);
        const file = e.dataTransfer.files?.[0];
        if (file) procesarArchivo(file);
    }

    function handleDragOver(e) {
        e.preventDefault();
        setArrastrando(true);
    }

    function handleDragLeave() {
        setArrastrando(false);
    }

    return (
        <div className="dext_container">
            <h2 className="dext_titulo">Cargar archivo .dext</h2>
            <p className="dext_descripcion">
                Los archivos .dext contienen lecturas de sensores en formato de bloques.
                Cada bloque se valida con el compilador antes de guardarse.
            </p>

            <div
                className={`dext_zona ${arrastrando ? "dext_zona--activa" : ""} ${cargando ? "dext_zona--cargando" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !cargando && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".dext"
                    onChange={handleFileInput}
                    style={{ display: "none" }}
                />
                <div className="dext_zona_icono">📂</div>
                <p className="dext_zona_texto">
                    {cargando
                        ? "Procesando archivo..."
                        : "Arrastra un archivo .dext aquí o haz clic para seleccionar"}
                </p>
                <p className="dext_zona_limite">Máximo 5 MB</p>
            </div>

            {error && (
                <p className="dext_error" role="alert">
                    {error}
                </p>
            )}

            {resultado && (
                <div className="dext_resultado">
                    <div className="dext_resultado_encabezado">
                        <h3>{resultado.archivo}</h3>
                        <div className="dext_resultado_stats">
                            <span className="dext_stat dext_stat--total">
                                Total: {resultado.total}
                            </span>
                            <span className="dext_stat dext_stat--validos">
                                Válidos: {resultado.validos}
                            </span>
                            <span className="dext_stat dext_stat--invalidos">
                                Inválidos: {resultado.invalidos}
                            </span>
                        </div>
                    </div>

                    <div className="dext_bloques">
                        {resultado.resultados.map((r) => (
                            <div
                                key={r.indice}
                                className={`dext_bloque ${r.valido ? "dext_bloque--valido" : "dext_bloque--invalido"}`}
                            >
                                <div className="dext_bloque_header">
                                    <span className="dext_bloque_num">Bloque {r.indice}</span>
                                    {r.sensor && (
                                        <span className="dext_bloque_sensor">{r.sensor}</span>
                                    )}
                                    <span className={`dext_bloque_estado ${r.valido ? "estado--ok" : "estado--error"}`}>
                                        {r.valido ? "Guardado" : `Error en ${r.etapa}`}
                                    </span>
                                </div>

                                {r.advertencias?.length > 0 && (
                                    <ul className="dext_lista dext_lista--advertencias">
                                        {r.advertencias.map((a, i) => (
                                            <li key={i}>{a}</li>
                                        ))}
                                    </ul>
                                )}

                                {r.errores?.length > 0 && (
                                    <ul className="dext_lista dext_lista--errores">
                                        {r.errores.map((e, i) => (
                                            <li key={i}>{typeof e === "string" ? e : e.message}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
