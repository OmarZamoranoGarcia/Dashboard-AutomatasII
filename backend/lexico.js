import { createToken, Lexer, CstParser } from "chevrotain";

// Definición de Tokens

// Espacios
export const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED
});

// Símbolos
export const LCurly  = createToken({ name: "LCurly",  pattern: /\{/ });
export const RCurly  = createToken({ name: "RCurly",  pattern: /\}/ });
export const LParen  = createToken({ name: "LParen",  pattern: /\(/ });
export const RParen  = createToken({ name: "RParen",  pattern: /\)/ });
export const Colon   = createToken({ name: "Colon",   pattern: /:/ });
export const Comma   = createToken({ name: "Comma",   pattern: /,/ });
export const Equals  = createToken({ name: "Equals",  pattern: /=/ });
export const SemiColon = createToken({ name: "SemiColon", pattern: /;/ });

// Strings con comillas dobles
export const StringLiteral = createToken({
  name: "StringLiteral",
  pattern: /"[^"]*"/
});

// Número (entero o decimal)
export const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: /\d+(\.\d+)?/
});

// Identificadores
export const Identifier = createToken({
  name: "Identifier",
  pattern: /[a-zA-Z_][a-zA-Z0-9_]*/
});

// Orden de Tokens
export const allTokens = [
  WhiteSpace,
  LCurly,
  RCurly,
  LParen,
  RParen,
  Colon,
  Comma,
  Equals,
  SemiColon,
  StringLiteral,
  NumberLiteral,
  Identifier
];

// Crear el Lexer
export const SensorLexer = new Lexer(allTokens);
