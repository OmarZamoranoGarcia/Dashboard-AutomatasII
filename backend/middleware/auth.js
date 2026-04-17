import crypto from "crypto";

// Middleware que verifica el token de sesión antes de continuar
// Adjunta el objeto usuario al request si la sesión es válida
export function requireAuth(pool) {
    return async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Autenticación requerida." });
        }

        const token = authHeader.slice(7);
        const hash = crypto.createHash("sha256").update(token).digest("hex");

        try {
            const result = await pool.query(
                `SELECT s.expira_at, u.id, u.username, u.email, u.rol, u.activo
                 FROM sesiones s
                 JOIN usuarios u ON u.id = s.usuario_id
                 WHERE s.token_hash = $1`,
                [hash]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: "Sesión inválida." });
            }

            const row = result.rows[0];

            if (!row.activo) {
                return res.status(403).json({ error: "Cuenta desactivada." });
            }

            if (new Date(row.expira_at) < new Date()) {
                // Eliminar sesión expirada
                await pool.query(`DELETE FROM sesiones WHERE token_hash = $1`, [hash]);
                return res.status(401).json({ error: "Sesión expirada." });
            }

            req.usuario = {
                id: row.id,
                username: row.username,
                email: row.email,
                rol: row.rol,
            };

            next();
        } catch (err) {
            console.error("Error en middleware de auth:", err.message);
            return res.status(500).json({ error: "Error interno del servidor." });
        }
    };
}

// Middleware que restringe acceso a roles específicos
// Se usa después de requireAuth
export function requireRol(...roles) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ error: "Autenticación requerida." });
        }

        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({ error: "Permisos insuficientes." });
        }

        next();
    };
}
