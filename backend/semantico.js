const SENSOR_RULES = {
  _Bascula: {
    requiredFields: ["sensor", "zona", "peso", "unidad"],
    fieldRules: {
      peso: {
        type: "number",
        min: 0,
        max: 35000,
        description: "Peso del vehículo (kg)",
        warning: { min: 8000, max: 25000 },
      },
      unidad: {
        type: "enum",
        values: ["kg"],
        description: "Unidad de peso",
      },
    },
  },

  DEXA_RX: {
    requiredFields: ["sensor", "zona", "estado", "nivel_densidad"],
    fieldRules: {
      estado: {
        type: "enum",
        values: ["Limpio", "Objeto detectado"],
        description: "Resultado del escaneo DEXA",
      },
      nivel_densidad: {
        type: "number",
        min: 0,
        max: 100,
        description: "Nivel de densidad detectado (%)",
      },
    },
    coherenceRules: [
      {
        condition: (f) => f.estado === "Objeto detectado",
        check: (f) => Number(f.nivel_densidad) >= 60,
        message: 'estado "Objeto detectado" requiere nivel_densidad >= 60',
      },
      {
        condition: (f) => f.estado === "Limpio",
        check: (f) => Number(f.nivel_densidad) <= 30,
        message: 'estado "Limpio" requiere nivel_densidad <= 30',
      },
    ],
  },

  DHT22: {
    requiredFields: ["Sensor", "Zona", "Temperatura", "Humedad", "Estado"],
    fieldRules: {
      Temperatura: {
        type: "number",
        min: -10,
        max: 50,
        description: "Temperatura del contenedor (°C)",
        warning: { min: 2, max: 8 },
      },
      Humedad: {
        type: "number",
        min: 0,
        max: 100,
        description: "Humedad relativa (%)",
      },
      Estado: {
        type: "enum",
        values: ["Normal", "Humedad alta"],
        description: "Estado de humedad",
      },
    },
    coherenceRules: [
      {
        condition: (f) => Number(f.Humedad) > 85,
        check: (f) => f.Estado === "Humedad alta",
        message: 'Humedad > 85 requiere Estado = "Humedad alta"',
      },
      {
        condition: (f) => Number(f.Humedad) <= 85,
        check: (f) => f.Estado === "Normal",
        message: 'Humedad <= 85 requiere Estado = "Normal"',
      },
    ],
  },

  "FLIR TERMICA": {
    requiredFields: ["Sensor", "Zona", "Temperatura", "Estado"],
    fieldRules: {
      Temperatura: {
        type: "number",
        min: 0,
        max: 200,
        description: "Temperatura del motor (°C)",
        warning: { min: 70, max: 120 },
      },
      Estado: {
        type: "enum",
        values: ["Normal", "Muy caliente"],
        description: "Estado térmico del motor",
      },
    },
    coherenceRules: [
      {
        condition: (f) => Number(f.Temperatura) > 100,
        check: (f) => f.Estado === "Muy caliente",
        message: 'Temperatura > 100 requiere Estado = "Muy caliente"',
      },
      {
        condition: (f) => Number(f.Temperatura) <= 100,
        check: (f) => f.Estado === "Normal",
        message: 'Temperatura <= 100 requiere Estado = "Normal"',
      },
    ],
  },

  LPR: {
    requiredFields: ["Sensor", "Zona", "Matricula"],
    fieldRules: {
      Matricula: {
        type: "string",
        pattern: /^[A-Z]{2,3}-\d{2,3}(-[A-Z]{0,2})?$/,
        description: "Matrícula del vehículo (formato MX/CA)",
      },
    },
  },

  "MQ-135": {
    requiredFields: ["Sensor", "Zona", "Calidad_Aire"],
    fieldRules: {
      Calidad_Aire: {
        type: "enum",
        values: ["Buena", "Regular", "Mala"],
        description: "Nivel de calidad del aire",
      },
    },
  },

  "Radar Doppler": {
    requiredFields: ["Sensor", "Zona", "Velocidad_kmh", "Direccion", "Estado"],
    fieldRules: {
      Velocidad_kmh: {
        type: "number",
        min: 0,
        max: 200,
        description: "Velocidad del vehículo (km/h)",
        warning: { min: 5, max: 40 },
      },
      Direccion: {
        type: "enum",
        values: ["Norte", "Sur", "Este", "Oeste"],
        description: "Dirección de desplazamiento",
      },
      Estado: {
        type: "enum",
        values: ["Normal", "Exceso de velocidad"],
        description: "Estado de velocidad",
      },
    },
    coherenceRules: [
      {
        condition: (f) => Number(f.Velocidad_kmh) > 40,
        check: (f) => f.Estado === "Exceso de velocidad",
        message: 'Velocidad > 40 requiere Estado = "Exceso de velocidad"',
      },
      {
        condition: (f) => Number(f.Velocidad_kmh) <= 40,
        check: (f) => f.Estado === "Normal",
        message: 'Velocidad <= 40 requiere Estado = "Normal"',
      },
    ],
  },

  "RFID UHF Reader": {
    requiredFields: ["Sensor", "Zona", "Tag", "Unidad", "Estado"],
    fieldRules: {
      Tag: {
        type: "string",
        pattern: /^[0-9A-F]{24}$/,
        description: "EPC hexadecimal de 24 caracteres",
      },
      Estado: {
        type: "enum",
        values: ["Pagado", "Sin pagar"],
        description: "Estado del pedimento aduanal",
      },
    },
  },

  "Sensor PIR": {
    requiredFields: ["Sensor", "Zona", "Temperatura", "Presencia"],
    fieldRules: {
      Temperatura: {
        type: "number",
        min: 15,
        max: 45,
        description: "Temperatura ambiente detectada (°C)",
      },
      Presencia: {
        type: "enum",
        values: ["Sin movimiento", "Movimiento detectado"],
        description: "Estado de detección de presencia",
      },
    },
    coherenceRules: [
      {
        condition: (f) => Number(f.Temperatura) >= 36,
        check: (f) => f.Presencia === "Movimiento detectado",
        message: 'Temperatura >= 36 requiere Presencia = "Movimiento detectado"',
      },
      {
        condition: (f) => Number(f.Temperatura) < 36,
        check: (f) => f.Presencia === "Sin movimiento",
        message: 'Temperatura < 36 requiere Presencia = "Sin movimiento"',
      },
    ],
  },

  SONOMETRO: {
    requiredFields: ["Sensor", "Zona", "Nivel_dB", "Estado"],
    fieldRules: {
      Nivel_dB: {
        type: "number",
        min: 30,
        max: 140,
        description: "Nivel de ruido del motor (dB)",
        warning: { min: 70, max: 85 },
      },
      Estado: {
        type: "enum",
        values: ["Normal", "Posible fallo en motor"],
        description: "Estado acústico del motor",
      },
    },
  },
};

function getSensorName(fields) {
  return fields.sensor || fields.Sensor || null;
}

function getRules(sensorName) {
  if (!sensorName) return null;
  return SENSOR_RULES[sensorName] || null;
}

function validateRequiredFields(fields, requiredFields) {
  const errors = [];
  for (const field of requiredFields) {
    if (!(field in fields)) {
      errors.push(`Campo requerido ausente: "${field}"`);
    }
  }
  return errors;
}

function validateFieldRules(fields, fieldRules) {
  const errors = [];
  const warnings = [];

  for (const [fieldName, rule] of Object.entries(fieldRules)) {
    if (!(fieldName in fields)) continue;

    const rawValue = fields[fieldName];

    if (rule.type === "number") {
      const numValue = Number(rawValue);
      if (isNaN(numValue)) {
        errors.push(`"${fieldName}" debe ser numérico, se recibió: "${rawValue}"`);
        continue;
      }
      if (rule.min !== undefined && numValue < rule.min) {
        errors.push(`"${fieldName}" = ${numValue} está por debajo del mínimo (${rule.min})`);
      }
      if (rule.max !== undefined && numValue > rule.max) {
        errors.push(`"${fieldName}" = ${numValue} excede el máximo (${rule.max})`);
      }
      if (rule.warning) {
        if (numValue < rule.warning.min || numValue > rule.warning.max) {
          warnings.push(
            `"${fieldName}" = ${numValue} fuera del rango operacional [${rule.warning.min} - ${rule.warning.max}]`
          );
        }
      }
    } else if (rule.type === "enum") {
      if (!rule.values.includes(rawValue)) {
        errors.push(
          `"${fieldName}" valor inválido: "${rawValue}". Permitidos: [${rule.values.map((v) => `"${v}"`).join(", ")}]`
        );
      }
    } else if (rule.type === "string" && rule.pattern) {
      if (!rule.pattern.test(String(rawValue))) {
        errors.push(`"${fieldName}" = "${rawValue}" no cumple el formato. ${rule.description}`);
      }
    }
  }

  return { errors, warnings };
}

function validateCoherence(fields, coherenceRules) {
  if (!coherenceRules) return [];
  const errors = [];
  for (const rule of coherenceRules) {
    if (rule.condition(fields) && !rule.check(fields)) {
      errors.push(rule.message);
    }
  }
  return errors;
}

// Recibe un objeto plano { campo: valor } y devuelve el resultado de la validación semántica.
export function analyzeSemantics(fields) {
  const result = { valid: false, sensorName: null, errors: [], warnings: [] };

  const sensorName = getSensorName(fields);
  result.sensorName = sensorName;

  if (!sensorName) {
    result.errors.push('El objeto no contiene un campo "sensor" o "Sensor" identificable.');
    return result;
  }

  const rules = getRules(sensorName);
  if (!rules) {
    result.errors.push(`Sensor desconocido: "${sensorName}".`);
    return result;
  }

  result.errors.push(...validateRequiredFields(fields, rules.requiredFields));

  const { errors: fieldErrors, warnings: fieldWarnings } = validateFieldRules(fields, rules.fieldRules);
  result.errors.push(...fieldErrors);
  result.warnings.push(...fieldWarnings);

  if (result.errors.length === 0 && rules.coherenceRules) {
    result.errors.push(...validateCoherence(fields, rules.coherenceRules));
  }

  result.valid = result.errors.length === 0;
  return result;
}

// Convierte el CST producido por sintactico.js en un objeto plano { campo: valor }.
export function cstToFields(cst) {
  const fields = {};

  try {
    const propertyList = cst.children.propertyList[0];
    const properties = propertyList.children.property;

    for (const prop of properties) {
      const key = prop.children.Identifier[0].image;
      const valueNode = prop.children.value[0];

      let value;
      if (valueNode.children.StringLiteral) {
        const raw = valueNode.children.StringLiteral[0].image;
        value = raw.slice(1, -1);
      } else if (valueNode.children.NumberLiteral) {
        value = Number(valueNode.children.NumberLiteral[0].image);
      } else if (valueNode.children.Identifier) {
        value = valueNode.children.Identifier[0].image;
      } else {
        value = null;
      }

      fields[key] = value;
    }
  } catch (e) {
    // CST con estructura inesperada, devuelve objeto vacío
  }

  return fields;
}
