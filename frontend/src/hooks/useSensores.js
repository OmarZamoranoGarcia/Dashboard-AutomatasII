import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";

function tiempoADesde(valor) {
  const minutos = parseInt(valor);
  if (isNaN(minutos)) return null;
  const desde = new Date(Date.now() - minutos * 60 * 1000);
  return desde.toISOString();
}

export function useSensoresDisponibles() {
  const { apiFetch } = useAuth();
  const [sensores, setSensores] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancel = false;
    apiFetch("/api/sensores")
      .then((res) => res.json())
      .then((data) => {
        if (!cancel) setSensores(Array.isArray(data) ? data : []);
      })
      .catch(() => { if (!cancel) setSensores([]); })
      .finally(() => { if (!cancel) setCargando(false); });

    return () => { cancel = true; };
  }, [apiFetch]);

  return { sensores, cargando };
}

export function useLecturasSensor(sensorNombre, tiempoValor) {
  const { apiFetch } = useAuth();
  const [lecturas, setLecturas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const cargar = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setCargando(true);
    setError(null);

    const desde = tiempoADesde(tiempoValor);
    const params = new URLSearchParams({ limit: 100 });
    if (sensorNombre) params.set("sensor", sensorNombre);
    if (desde) params.set("desde", desde);

    apiFetch(`/api/sensor?${params}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!controller.signal.aborted) {
          setLecturas(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      });
  }, [apiFetch, sensorNombre, tiempoValor]);

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 10000);
    return () => {
      clearInterval(intervalo);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cargar]);

  return { lecturas, cargando, error, recargar: cargar };
}

export function useUltimasLecturas() {
  const { apiFetch } = useAuth();
  const [lecturas, setLecturas] = useState({});
  const [cargando, setCargando] = useState(true);
  const abortControllerRef = useRef(null);

  const cargar = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    apiFetch("/api/sensor?limit=500", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (!controller.signal.aborted && Array.isArray(data)) {
          const mapa = {};
          for (const lectura of data) {
            if (!mapa[lectura.sensor]) {
              mapa[lectura.sensor] = lectura.datos;
            }
          }
          setLecturas(mapa);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setLecturas({});
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });
  }, [apiFetch]);

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 10000);
    return () => {
      clearInterval(intervalo);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cargar]);

  return { lecturas, cargando, recargar: cargar };
}
