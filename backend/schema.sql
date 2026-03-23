CREATE DATABASE sensores_aduaneros;

\c sensores_aduaneros

CREATE TABLE lecturas (
    id          SERIAL PRIMARY KEY,
    sensor      VARCHAR(64)  NOT NULL,
    zona        VARCHAR(128),
    datos       JSONB        NOT NULL,
    advertencias JSONB       NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índices para las consultas más frecuentes
CREATE INDEX idx_lecturas_sensor     ON lecturas (sensor);
CREATE INDEX idx_lecturas_created_at ON lecturas (created_at DESC);
CREATE INDEX idx_lecturas_datos      ON lecturas USING GIN (datos);
