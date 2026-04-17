import pg from 'pg';
const { Client } = pg;

// Configuración de conexión - MODIFICA ESTOS VALORES
const config = {
  host: 'localhost',        // o la IP de tu servidor
  port: 5432,               // Puerto por defecto de PostgreSQL
  user: 'postgres',         // Cambia si tu usuario es diferente
  password: 'Zago0413', // Reemplaza con tu contraseña real
  database: 'sensores_aduaneros',     // Base de datos por defecto para prueba
  connectionTimeoutMillis: 5000,
};

async function testConnection() {
  const client = new Client(config);
  
  console.log('🔄 Intentando conectar a PostgreSQL...');
  console.log(`📡 Host: ${config.host}`);
  console.log(`🔌 Puerto: ${config.port}`);
  console.log(`👤 Usuario: ${config.user}`);
  
  try {
    await client.connect();
    console.log('✅ ¡Conexión exitosa a PostgreSQL!');
    
    const res = await client.query('SELECT version() as version, current_database() as db, inet_server_port() as port');
    console.log('\n📊 Información del servidor:');
    console.log(`   Versión: ${res.rows[0].version.split(',')[0]}`);
    console.log(`   Base de datos actual: ${res.rows[0].db}`);
    console.log(`   Puerto del servidor: ${res.rows[0].port || config.port}`);
    
    const dbs = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname');
    console.log('\n🗄️  Bases de datos disponibles:');
    dbs.rows.forEach(row => {
      console.log(`   - ${row.datname}`);
    });
    
    await client.end();
    console.log('\n🔒 Conexión cerrada correctamente.');
    
  } catch (err) {
    console.error('\n❌ ERROR de conexión:');
    console.error(`   Mensaje: ${err.message}`);
    
    if (err.code === 'ECONNREFUSED') {
      console.error('   ▶️  Diagnóstico: No se pudo conectar al puerto. Verifica:');
      console.error('      - ¿PostgreSQL está corriendo?');
      console.error('      - ¿El puerto es correcto?');
      console.error('      - ¿Hay firewall bloqueando?');
    } else if (err.code === '28P01') {
      console.error('   ▶️  Diagnóstico: Contraseña incorrecta.');
    } else if (err.code === '28000') {
      console.error('   ▶️  Diagnóstico: Usuario o autenticación inválida.');
    } else if (err.code === '3D000') {
      console.error('   ▶️  Diagnóstico: La base de datos no existe.');
    }
    
    console.error(`\n📝 Código de error: ${err.code || 'N/A'}`);
    process.exit(1);
  }
}

async function scanCommonPorts() {
  const commonPorts = [5432, 5433, 5434, 5435, 5436, 5437, 5438, 5439, 5440];
  console.log('🔍 Escaneando puertos comunes de PostgreSQL...\n');
  
  for (const port of commonPorts) {
    const testConfig = { ...config, port };
    const client = new Client(testConfig);
    
    try {
      await client.connect();
      console.log(`✅ Encontrado PostgreSQL en puerto ${port}`);
      await client.end();
      return port;
    } catch (err) {
      if (err.code !== 'ECONNREFUSED') {
        console.log(`⚠️  Puerto ${port}: Servidor responde pero requiere autenticación`);
      }
    }
  }
  
  console.log('❌ No se encontró PostgreSQL en los puertos comunes (5432-5440)');
  return null;
}

// Ejecutar la prueba
(async () => {
  // Para escanear puertos automáticamente, descomenta la siguiente línea:
  // const foundPort = await scanCommonPorts();
  // if (foundPort) config.port = foundPort;
  
  await testConnection();
})();