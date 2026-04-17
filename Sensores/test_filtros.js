// Prueba todos los endpoints GET del backend.
// Uso: node test_filtros.js
// Requiere que el backend esté corriendo en localhost:3000

const BASE = "http://localhost:3000";

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  return { status: res.status, data };
}

function titulo(texto) {
  console.log("\n" + "─".repeat(60));
  console.log(`  ${texto}`);
  console.log("─".repeat(60));
}

function mostrar(label, resultado) {
  const { status, data } = resultado;
  const ok = status >= 200 && status < 300;
  console.log(`\n[${ok ? "y" : "x"} ${status}] ${label}`);

  if (Array.isArray(data)) {
    console.log(`  → ${data.length} registro(s)`);
    if (data.length > 0) {
      const muestra = data.slice(0, 2);
      muestra.forEach((r, i) => {
        console.log(`  [${i}] sensor="${r.sensor}"  zona="${r.zona}"  id=${r.id}  ${r.created_at}`);
        if (r.advertencias?.length) console.log(`${r.advertencias.join(", ")}`);
      });
      if (data.length > 2) console.log(`  ... y ${data.length - 2} más`);
    }
  } else if (data.sensor) {
    // Lectura individual
    console.log(`  id=${data.id}  sensor="${data.sensor}"  zona="${data.zona}"`);
    console.log(`  datos:`, JSON.stringify(data.datos));
  } else {
    console.log("  →", JSON.stringify(data));
  }
}

async function runTests() {
  console.log("\n Test de endpoints  —  backend:", BASE);

  titulo("GET /api/sensores — sensores distintos con totales");
  const sensores = await get("/api/sensores");
  mostrar("/api/sensores", sensores);

  if (!Array.isArray(sensores.data) || sensores.data.length === 0) {
    console.warn("\n No hay lecturas en la BD. Ejecuta al menos un sensor antes de correr este test.");
    return;
  }

  titulo("GET /api/sensor — últimas 100 lecturas");
  mostrar("/api/sensor", await get("/api/sensor"));

  titulo("GET /api/sensor?limit=5 — solo 5 lecturas");
  mostrar("/api/sensor?limit=5", await get("/api/sensor?limit=5"));

  titulo("GET /api/sensor?limit=500 — límite máximo");
  mostrar("/api/sensor?limit=500", await get("/api/sensor?limit=500"));

  titulo("GET /api/sensor?sensor=<nombre> — filtro por sensor");
  for (const row of sensores.data) {
    const encoded = encodeURIComponent(row.sensor);
    mostrar(`/api/sensor?sensor=${row.sensor}`, await get(`/api/sensor?sensor=${encoded}`));
  }

  titulo("GET /api/sensor?sensor=SensorFalso — debe devolver []");
  mostrar("/api/sensor?sensor=SensorFalso", await get("/api/sensor?sensor=SensorFalso"));

  const primeraLectura = (await get("/api/sensor?limit=1")).data[0];
  if (primeraLectura) {
    titulo(`GET /api/sensor/${primeraLectura.id} — lectura por ID`);
    mostrar(`/api/sensor/${primeraLectura.id}`, await get(`/api/sensor/${primeraLectura.id}`));
  }

  titulo("GET /api/sensor/999999 — ID que no existe (debe ser 404)");
  mostrar("/api/sensor/999999", await get("/api/sensor/999999"));

  titulo("GET /api/sensor/abc — ID inválido (debe ser 400)");
  mostrar("/api/sensor/abc", await get("/api/sensor/abc"));

  console.log("\n✔️  Tests completados\n");
}

runTests().catch((err) => {
  console.error("🔴 Error fatal:", err.message);
  console.error("   ¿Está el backend corriendo en", BASE, "?");
});
