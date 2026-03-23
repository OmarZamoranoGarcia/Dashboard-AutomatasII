import express from "express";
import cors from "cors";
import pg from "pg";
import { parseInput } from "./sintactico.js";
import { analyzeSemantics, cstToFields } from "./semantico.js";

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a PostgreSQL.
// Las variables de entorno se definen en un archivo .env en la raíz del backend.
const pool = new pg.Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || "sensores_aduaneros",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
});

// Verifica la conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error al conectar con PostgreSQL:", err.message);
    process.exit(1);
  }
  release();
  console.log("Conexión a PostgreSQL establecida.");
});

// POST /api/sensor
// Recibe el texto plano del mensaje del sensor, lo valida con el pipeline
// completo (léxico, sintáctico, semántico) y, si es válido, lo persiste en BD.
app.post("/api/sensor", async (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje || typeof mensaje !== "string") {
    return res.status(400).json({ error: "El campo 'mensaje' es requerido y debe ser un string." });
  }

  // Análisis léxico y sintáctico
  const parseResult = parseInput(mensaje);

  if (parseResult.lexErrors) {
    return res.status(422).json({ etapa: "lexico", errores: parseResult.lexErrors });
  }

  if (parseResult.parseErrors) {
    return res.status(422).json({ etapa: "sintactico", errores: parseResult.parseErrors });
  }

  // Extracción de campos y análisis semántico
  const fields = cstToFields(parseResult.cst);
  const semantic = analyzeSemantics(fields);

  if (!semantic.valid) {
    return res.status(422).json({
      etapa: "semantico",
      sensor: semantic.sensorName,
      errores: semantic.errors,
      advertencias: semantic.warnings,
    });
  }

  // Persistencia en PostgreSQL
  try {
    const result = await pool.query(
      `INSERT INTO lecturas (sensor, zona, datos, advertencias, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, created_at`,
      [
        semantic.sensorName,
        fields.zona || fields.Zona || null,
        JSON.stringify(fields),
        JSON.stringify(semantic.warnings),
      ]
    );

    return res.status(201).json({
      id: result.rows[0].id,
      sensor: semantic.sensorName,
      datos: fields,
      advertencias: semantic.warnings,
      timestamp: result.rows[0].created_at,
    });
  } catch (dbErr) {
    console.error("Error al insertar en BD:", dbErr.message);
    return res.status(500).json({ error: "Error interno al guardar la lectura." });
  }
});

// GET /api/sensor
// Devuelve las últimas lecturas. Acepta query params:
//   ?sensor=DHT22        filtra por nombre de sensor
//   ?limit=50            limita el número de resultados (default 100)
app.get("/api/sensor", async (req, res) => {
  const { sensor, limit = 100 } = req.query;
  const limitNum = Math.min(Math.max(parseInt(limit) || 100, 1), 500);

  try {
    let query;
    let params;

    if (sensor) {
      query = `SELECT id, sensor, zona, datos, advertencias, created_at
               FROM lecturas
               WHERE sensor = $1
               ORDER BY created_at DESC
               LIMIT $2`;
      params = [sensor, limitNum];
    } else {
      query = `SELECT id, sensor, zona, datos, advertencias, created_at
               FROM lecturas
               ORDER BY created_at DESC
               LIMIT $1`;
      params = [limitNum];
    }

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (dbErr) {
    console.error("Error al consultar BD:", dbErr.message);
    return res.status(500).json({ error: "Error interno al consultar lecturas." });
  }
});

// GET /api/sensor/:id
// Devuelve una lectura específica por su ID.
app.get("/api/sensor/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    const result = await pool.query(
      `SELECT id, sensor, zona, datos, advertencias, created_at
       FROM lecturas WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Lectura no encontrada." });
    }

    return res.json(result.rows[0]);
  } catch (dbErr) {
    console.error("Error al consultar BD:", dbErr.message);
    return res.status(500).json({ error: "Error interno al consultar la lectura." });
  }
});

// GET /api/sensores
// Devuelve la lista de sensores distintos que tienen lecturas registradas.
app.get("/api/sensores", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sensor, COUNT(*) AS total, MAX(created_at) AS ultima_lectura
       FROM lecturas
       GROUP BY sensor
       ORDER BY ultima_lectura DESC`
    );
    return res.json(result.rows);
  } catch (dbErr) {
    console.error("Error al consultar BD:", dbErr.message);
    return res.status(500).json({ error: "Error interno." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
