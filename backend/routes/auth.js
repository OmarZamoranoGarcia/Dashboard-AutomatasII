import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import pg from "pg";

const router = express.Router();

// Configuración del pool de PostgreSQL recibido desde server.js
let pool;

export function setPool(pgPool) {
    pool = pgPool;
}

// Rondas de salt para bcrypt
const SALT_ROUNDS = 12;

// Duración de sesión en milisegundos: 8 horas
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

// Genera un token aleatorio seguro y devuelve su hash SHA-256
function generarToken() {
    const token = crypto.randomBytes(48).toString("hex");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    return { token, hash };
}

// POST /api/auth/login
// Recibe username y password, valida contra la BD y crea sesión
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "username y password son requeridos." });
    }

    try {
        const result = await pool.query(
            `SELECT id, username, email, password_hash, rol, activo
             FROM usuarios WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            // Respuesta genérica para no revelar si el usuario existe
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        const usuario = result.rows[0];

        if (!usuario.activo) {
            return res.status(403).json({ error: "Cuenta desactivada." });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValido) {
            return res.status(401).json({ error: "Credenciales inválidas." });
        }

        // Actualizar last_login
        await pool.query(
            `UPDATE usuarios SET last_login = NOW() WHERE id = $1`,
            [usuario.id]
        );

        // Limpiar sesiones expiradas del usuario
        await pool.query(
            `DELETE FROM sesiones WHERE usuario_id = $1 AND expira_at < NOW()`,
            [usuario.id]
        );

        const { token, hash } = generarToken();
        const expiraAt = new Date(Date.now() + SESSION_DURATION_MS);

        await pool.query(
            `INSERT INTO sesiones (usuario_id, token_hash, expira_at)
             VALUES ($1, $2, $3)`,
            [usuario.id, hash, expiraAt]
        );

        return res.status(200).json({
            token,
            expira_at: expiraAt,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                email: usuario.email,
                rol: usuario.rol,
            },
        });
    } catch (err) {
        console.error("Error en login:", err.message);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
});

// POST /api/auth/logout
// Invalida el token de sesión actual
router.post("/logout", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(400).json({ error: "Token no proporcionado." });
    }

    const token = authHeader.slice(7);
    const hash = crypto.createHash("sha256").update(token).digest("hex");

    try {
        await pool.query(`DELETE FROM sesiones WHERE token_hash = $1`, [hash]);
        return res.status(200).json({ mensaje: "Sesión cerrada correctamente." });
    } catch (err) {
        console.error("Error en logout:", err.message);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
});

// POST /api/auth/registro
// Solo accesible por admins. Crea un nuevo usuario con password hasheado
router.post("/registro", async (req, res) => {
    const { username, email, password, rol = "operador" } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "username, email y password son requeridos." });
    }

    if (!["admin", "supervisor", "operador"].includes(rol)) {
        return res.status(400).json({ error: "Rol inválido." });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres." });
    }

    try {
        // bcrypt genera el salt internamente con SALT_ROUNDS rondas
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO usuarios (username, email, password_hash, rol)
             VALUES ($1, $2, $3, $4)
             RETURNING id, username, email, rol, created_at`,
            [username, email, passwordHash, rol]
        );

        return res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "El username o email ya existe." });
        }
        console.error("Error en registro:", err.message);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
});

// GET /api/auth/verificar
// Valida si el token de sesión sigue activo
router.get("/verificar", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Token no proporcionado." });
    }

    const token = authHeader.slice(7);
    const hash = crypto.createHash("sha256").update(token).digest("hex");

    try {
        const result = await pool.query(
            `SELECT s.id, s.expira_at, u.id AS usuario_id, u.username, u.email, u.rol
             FROM sesiones s
             JOIN usuarios u ON u.id = s.usuario_id
             WHERE s.token_hash = $1 AND s.expira_at > NOW() AND u.activo = TRUE`,
            [hash]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Sesión inválida o expirada." });
        }

        const sesion = result.rows[0];
        return res.status(200).json({
            usuario: {
                id: sesion.usuario_id,
                username: sesion.username,
                email: sesion.email,
                rol: sesion.rol,
            },
            expira_at: sesion.expira_at,
        });
    } catch (err) {
        console.error("Error verificando sesión:", err.message);
        return res.status(500).json({ error: "Error interno del servidor." });
    }
});

export default router;
