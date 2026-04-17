import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setCargando(false);
            return;
        }

        const controller = new AbortController();
        fetch(`${API_BASE}/api/auth/verificar`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
        })
            .then((res) => (res.ok ? res.json() : Promise.reject()))
            .then((data) => setUsuario(data.usuario))
            .catch(() => localStorage.removeItem("token"))
            .finally(() => setCargando(false));

        return () => controller.abort();
    }, []);

    const login = useCallback(async (username, password) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Error al iniciar sesión.");
        }

        localStorage.setItem("token", data.token);
        setUsuario(data.usuario);
        return data;
    }, []);

    const logout = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                await fetch(`${API_BASE}/api/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch {
                // Silenciar errores de red en logout
            }
        }

        localStorage.removeItem("token");
        setUsuario(null);
    }, []);

    const apiFetch = useCallback(async (endpoint, opciones = {}) => {
        const token = localStorage.getItem("token");
        const { signal, _skipContentType, ...restoOpciones } = opciones;
        const headers = {
            ...(!_skipContentType && { "Content-Type": "application/json" }),
            ...(restoOpciones.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };

        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...restoOpciones,
            headers,
            signal,
        });

        if (res.status === 401) {
            localStorage.removeItem("token");
            setUsuario(null);
            throw new Error("Sesión expirada.");
        }

        return res;
    }, []);

    return (
        <AuthContext.Provider value={{ usuario, cargando, login, logout, apiFetch }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
    return ctx;
}
