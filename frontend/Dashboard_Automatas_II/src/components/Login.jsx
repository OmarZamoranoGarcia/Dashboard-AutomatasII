import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login({ onLoginExitoso }) {
    const { login } = useAuth();

    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!form.username.trim() || !form.password) {
            setError("Ingresa usuario y contraseña.");
            return;
        }

        setCargando(true);
        setError("");

        try {
            await login(form.username.trim(), form.password);
            onLoginExitoso?.();
        } catch (err) {
            setError(err.message || "Error al iniciar sesión.");
        } finally {
            setCargando(false);
        }
    }

    return (
        <main className="main_container">
            <div className="main_form-container">
                <h1>Login</h1>

                {error && (
                    <p className="login_error" role="alert">
                        {error}
                    </p>
                )}

                <div className="form_field">
                    <label className="label_userName" htmlFor="username">
                        User Name
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={form.username}
                        onChange={handleChange}
                        autoComplete="username"
                        disabled={cargando}
                    />
                </div>

                <div className="form_field">
                    <label className="label_password" htmlFor="password">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        disabled={cargando}
                    />
                </div>

                <button
                    className="form_button"
                    onClick={handleSubmit}
                    disabled={cargando}
                >
                    {cargando ? "Verificando..." : "Entrar"}
                </button>
            </div>
        </main>
    );
}
