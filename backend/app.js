import { createToken, Lexer } from "chevrotain";

// ---------------------
// Definición de Tokens
// ---------------------

const LCurly = createToken({ name: "LCurly", pattern: /{/ });
const RCurly = createToken({ name: "RCurly", pattern: /}/ });
const Colon = createToken({ name: "Colon", pattern: /:/ });
const Comma = createToken({ name: "Comma", pattern: /,/ });

// Número (enteros y decimales)
const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: /\d+(\.\d+)?/
});

// Identificadores (TEMP, valor, unidad, etc.)
const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z_]\w*/
});

// Espacios (se ignoran)
const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED
});

// ---------------------
// Orden de Tokens
// ---------------------

const allTokens = [
  WhiteSpace,
  LCurly,
  RCurly,
  Colon,
  Comma,
  NumberLiteral,
  Identifier
];

// Crear el Lexer
const SensorLexer = new Lexer(allTokens);

// ---------------------
// Prueba del Lexer
// ---------------------

const input = `{ sensor: TEMP, valor: 25.5, unidad: C }`;

const lexingResult = SensorLexer.tokenize(input);

const [{tokenType:{name,PATTERN}}] = lexingResult.tokens

if (lexingResult.errors.length > 0) {
  console.error("Errores léxicos:", lexingResult.errors);
} else {
  console.log("Tokens generados:");
  //console.log(lexingResult.tokens);
  console.log(name)
}