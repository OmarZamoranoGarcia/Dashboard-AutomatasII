import dotenv from "dotenv";
import bcrypt from "bcrypt";
import pg from "pg";
import readline from "readline";

dotenv.config({ path: "../.env" });

const SALT_ROUNDS = 12;

const pool = new pg.Pool({
    host:     process.env.DB_HOST     || "localhost",
    port:     Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || "sensores_aduaneros",
    user:     process.env.DB_USER     || "postgres",
    password: process.env.DB_PASSWORD || "123",
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function preguntar(texto) {
    return new Promise((resolve) => rl.question(texto, resolve));
}

// Oculta la entrada del password reemplazando caracteres con *
function preguntarPassword(texto) {
    return new Promise((resolve) => {
        process.stdout.write(texto);

        const stdin = process.stdin;
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");

        let password = "";

        stdin.on("data", function handler(char) {
            if (char === "\r" || char === "\n") {
                // Enter: finalizar entrada
                stdin.setRawMode(false);
                stdin.pause();
                stdin.removeListener("data", handler);
                process.stdout.write("\n");
                resolve(password);
            } else if (char === "\u0003") {
                // Ctrl+C
                process.stdout.write("\n");
                process.exit();
            } else if (char === "\u007f") {
                // Backspace: borrar último carácter
                if (password.length > 0) {
                    password = password.slice(0, -1);
                }
            } else {
                // Carácter normal: agregar a la contraseña
                password += char;
            }
        });
    });
}

async function main() {
    console.log("\n=== Crear usuario administrador ===\n");

    // Verificar conexión a la BD
    try {
        await pool.query("SELECT 1");
        console.log("Conexión a PostgreSQL establecida.\n");
    } catch (err) {
        console.error("No se pudo conectar a PostgreSQL:", err.message);
        console.error("Verifica las variables DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD.");
        process.exit(1);
    }

    // Verificar que la tabla usuarios existe
    try {
        await pool.query("SELECT 1 FROM usuarios LIMIT 1");
    } catch {
        console.error("La tabla 'usuarios' no existe. Ejecuta schema.sql primero.");
        process.exit(1);
    }

    const username = (await preguntar("Username: ")).trim();

    if (!username) {
        console.error("El username no puede estar vacío.");
        process.exit(1);
    }

    // Verificar si el usuario ya existe
    const existente = await pool.query(
        "SELECT id FROM usuarios WHERE username = $1",
        [username]
    );

    if (existente.rows.length > 0) {
        const sobrescribir = (await preguntar(`El usuario "${username}" ya existe. Actualizar contraseña? (s/N): `)).trim().toLowerCase();
        if (sobrescribir !== "s") {
            console.log("Operación cancelada.");
            process.exit(0);
        }

        const password = await preguntarPassword("Nueva contraseña: ");
        const confirmacion = await preguntarPassword("Confirmar contraseña: ");

        if (password !== confirmacion) {
            console.error("Las contraseñas no coinciden.");
            process.exit(1);
        }

        if (password.length < 8) {
            console.error("La contraseña debe tener al menos 8 caracteres.");
            process.exit(1);
        }

        console.log("\nGenerando hash...");
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        await pool.query(
            "UPDATE usuarios SET password_hash = $1 WHERE username = $2",
            [hash, username]
        );

        console.log(`Contraseña actualizada para "${username}".`);
    } else {
        const email = (await preguntar("Email: ")).trim();

        if (!email || !email.includes("@")) {
            console.error("Email inválido.");
            process.exit(1);
        }

        const password = await preguntarPassword("Contraseña: ");
        const confirmacion = await preguntarPassword("Confirmar contraseña: ");

        if (password !== confirmacion) {
            console.error("Las contraseñas no coinciden.");
            process.exit(1);
        }

        if (password.length < 8) {
            console.error("La contraseña debe tener al menos 8 caracteres.");
            process.exit(1);
        }

        console.log("\nGenerando hash...");
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            `INSERT INTO usuarios (username, email, password_hash, rol)
             VALUES ($1, $2, $3, 'admin')
             RETURNING id, username, email, rol`,
            [username, email, hash]
        );

        const nuevo = result.rows[0];
        console.log("\nAdministrador creado:");
        console.log(`  ID:       ${nuevo.id}`);
        console.log(`  Username: ${nuevo.username}`);
        console.log(`  Email:    ${nuevo.email}`);
        console.log(`  Rol:      ${nuevo.rol}`);
    }

    await pool.end();
    rl.close();
    process.exit(0);
}

main().catch((err) => {
    console.error("Error inesperado:", err.message);
    process.exit(1);
});
