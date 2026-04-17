-- Base de datos principal del sistema de sensores aduaneros
DROP DATABASE IF EXISTS sensores_aduaneros;
CREATE DATABASE sensores_aduaneros;

\c sensores_aduaneros

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(64)  NOT NULL UNIQUE,
    email       VARCHAR(128) NOT NULL UNIQUE,
    password_hash TEXT       NOT NULL,
    rol         VARCHAR(32)  NOT NULL DEFAULT 'operador',
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_login  TIMESTAMPTZ
);

-- Roles permitidos: admin, supervisor, operador
ALTER TABLE usuarios ADD CONSTRAINT chk_rol
    CHECK (rol IN ('admin', 'supervisor', 'operador'));

-- Tabla de configuración de sensores registrados
CREATE TABLE sensores_config (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(64)  NOT NULL UNIQUE,
    tipo        VARCHAR(64)  NOT NULL,
    zona        VARCHAR(128),
    descripcion TEXT,
    activo      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tipos de sensor permitidos
ALTER TABLE sensores_config ADD CONSTRAINT chk_tipo
    CHECK (tipo IN (
        'bascula', 'dexa', 'dht22', 'flir', 'lpr',
        'mq135', 'radar', 'rfid', 'pir', 'sonometro'
    ));

-- Tabla principal de lecturas de sensores
CREATE TABLE lecturas (
    id           SERIAL PRIMARY KEY,
    sensor       VARCHAR(64)  NOT NULL,
    tipo_sensor  VARCHAR(64),
    zona         VARCHAR(128),
    datos        JSONB        NOT NULL,
    advertencias JSONB        NOT NULL DEFAULT '[]',
    valido       BOOLEAN      NOT NULL DEFAULT TRUE,
    fuente       VARCHAR(16)  NOT NULL DEFAULT 'api',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Fuente de la lectura: api (envío directo) o dext (archivo .dext procesado)
ALTER TABLE lecturas ADD CONSTRAINT chk_fuente
    CHECK (fuente IN ('api', 'dext'));

-- Tabla de archivos .dext procesados
CREATE TABLE archivos_dext (
    id           SERIAL PRIMARY KEY,
    nombre       VARCHAR(256) NOT NULL,
    contenido    TEXT         NOT NULL,
    total        INTEGER      NOT NULL DEFAULT 0,
    validos      INTEGER      NOT NULL DEFAULT 0,
    invalidos    INTEGER      NOT NULL DEFAULT 0,
    procesado_por INTEGER     REFERENCES usuarios(id),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Tabla de sesiones activas
CREATE TABLE sesiones (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash  TEXT         NOT NULL UNIQUE,
    expira_at   TIMESTAMPTZ  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes en lecturas
CREATE INDEX idx_lecturas_sensor      ON lecturas (sensor);
CREATE INDEX idx_lecturas_tipo        ON lecturas (tipo_sensor);
CREATE INDEX idx_lecturas_created_at  ON lecturas (created_at DESC);
CREATE INDEX idx_lecturas_datos       ON lecturas USING GIN (datos);
CREATE INDEX idx_lecturas_zona        ON lecturas (zona);
CREATE INDEX idx_lecturas_valido      ON lecturas (valido);
CREATE INDEX idx_lecturas_fuente      ON lecturas (fuente);

-- Índices para sesiones
CREATE INDEX idx_sesiones_token       ON sesiones (token_hash);
CREATE INDEX idx_sesiones_usuario     ON sesiones (usuario_id);
CREATE INDEX idx_sesiones_expira      ON sesiones (expira_at);

-- El usuario administrador se crea con: node crear-admin.js

-- Sensores de ejemplo
INSERT INTO sensores_config (nombre, tipo, zona, descripcion) VALUES
    ('_Bascula',        'bascula',   'Caseta 1',           'Báscula de pesaje vehicular'),
    ('DEXA_RX',         'dexa',      'Revisión peatonal 1','Escáner DEXA de rayos X'),
    ('DHT22',           'dht22',     'Revisión 1',         'Sensor de temperatura y humedad'),
    ('FLIR TERMICA',    'flir',      'Caseta 1',           'Cámara térmica FLIR'),
    ('LPR',             'lpr',       'Caseta 1',           'Lector de placas LPR'),
    ('MQ-135',          'mq135',     'Oficina 1',          'Sensor de calidad del aire'),
    ('Radar Doppler',   'radar',     'Carril 1',           'Radar de velocidad Doppler'),
    ('RFID UHF Reader', 'rfid',      'Caseta 1',           'Lector RFID UHF'),
    ('Sensor PIR',      'pir',       'Entrada principal',  'Sensor de presencia PIR'),
    ('SONOMETRO',       'sonometro', 'Revisión 1',         'Sonómetro de motor');
