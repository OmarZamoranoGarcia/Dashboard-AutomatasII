import { useState } from "react";
import "./App.css";
import Dashboard from "./Dashboard";
import Login from "./components/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppInterna() {
    const { usuario, cargando, logout } = useAuth();

    if (cargando) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "#090f1a",
                color: "#94a3b8",
                fontSize: "1rem",
            }}>
                Cargando sesión...
            </div>
        );
    }

    if (!usuario) {
        return <Login />;
    }

    return <Dashboard onLogout={logout} />;
}

function App() {
    return (
        <AuthProvider>
            <AppInterna />
        </AuthProvider>
    );
}

export default App;
