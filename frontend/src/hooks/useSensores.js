import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// Convierte el valor del selector de tiempo a minutos para el filtro "desde"
function tiempoADesde(valor) {
    const minutos = parseInt(valor);
    if (isNaN(minutos)) return null;
    const desde = new Date(Date.now() - minutos * 60 * 1000);
    return desde.toISOString();
}

// Devuelve la lista de sensores registrados en la BD con sus estadísticas
export function useSensoresDisponibles() {
    const { apiFetch } = useAuth();
    const [sensores, setSensores] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        apiFetch("/api/sensores")
            .then((res) => res.json())
            .then((data) => Array.isArray(data) ? setSensores(data) : setSensores([]))
            .catch(() => setSensores([]))
            .finally(() => setCargando(false));
    }, [apiFetch]);

    return { sensores, cargando };
}

// Devuelve las lecturas más recientes para un sensor y ventana de tiempo dados
// sensorNombre: nombre exacto del sensor 
export function useLecturasSensor(sensorNombre, tiempoValor) {
    const { apiFetch } = useAuth();
    const [lecturas, setLecturas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    const cargar = useCallback(() => {
        if (!sensorNombre) return;

        setCargando(true);
        setError(null);

        const desde = tiempoADesde(tiempoValor);
        const params = new URLSearchParams({ sensor: sensorNombre, limit: 50 });
        if (desde) params.set("desde", desde);

        apiFetch(`/api/sensor?${params}`)
            .then((res) => res.json())
            .then((data) => Array.isArray(data) ? setLecturas(data) : setLecturas([]))
            .catch((err) => setError(err.message))
            .finally(() => setCargando(false));
    }, [apiFetch, sensorNombre, tiempoValor]);

    useEffect(() => {
        cargar();
        // Refresco automático cada 10 segundos
        const intervalo = setInterval(cargar, 10000);
        return () => clearInterval(intervalo);
    }, [cargar]);

    return { lecturas, cargando, error, recargar: cargar };
}

// Devuelve la lectura más reciente de cada sensor para poblar las cards del dashboard
export function useUltimasLecturas() {
    const { apiFetch } = useAuth();
    const [lecturas, setLecturas] = useState({});
    const [cargando, setCargando] = useState(true);

    const cargar = useCallback(() => {
        apiFetch("/api/sensor?limit=500")
            .then((res) => res.json())
            .then((data) => {
                if (!Array.isArray(data)) return;
                // Conservar solo la lectura más reciente por sensor
                const mapa = {};
                for (const lectura of data) {
                    if (!mapa[lectura.sensor]) {
                        mapa[lectura.sensor] = lectura.datos;
                    }
                }
                setLecturas(mapa);
            })
            .catch(() => {})
            .finally(() => setCargando(false));
    }, [apiFetch]);

    useEffect(() => {
        cargar();
        const intervalo = setInterval(cargar, 10000);
        return () => clearInterval(intervalo);
    }, [cargar]);

    return { lecturas, cargando, recargar: cargar };
}
