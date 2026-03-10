import { createToken, Lexer, CstParser } from "chevrotain";
import {allTokens, SensorLexer } from "./lexico.js"
import {LCurly, RCurly, LParen, RParen, Colon, Comma, Equals, SemiColon, WhiteSpace, StringLiteral, NumberLiteral, Identifier} from "./lexico.js"

//*******************
// Sitactico
//*******************

class SensorParser extends CstParser {
  constructor(allTokens) {
    super(allTokens);
    const $ = this;

    // sensorObject → { propertyList }
    $.RULE("sensorObject", () => {
      $.CONSUME(LCurly);
      $.SUBRULE($.propertyList);
      $.CONSUME(RCurly);
    });

    // propertyList → property ( , property )*
    $.RULE("propertyList", () => {
      $.SUBRULE($.property);
      $.MANY(() => {
        $.CONSUME(Comma);
        $.SUBRULE2($.property);
      });
    });

    // property → Identifier : value
    $.RULE("property", () => {
      const key = $.CONSUME(Identifier);
      $.CONSUME(Colon);
      $.SUBRULE($.value);
    });

    // value → StringLiteral | NumberLiteral | Identifier
    $.RULE("value", () => {
      $.OR([
        { ALT: () => $.CONSUME(StringLiteral) },
        { ALT: () => $.CONSUME(NumberLiteral) },
        { ALT: () => $.CONSUME(Identifier) }
      ]);
    });

    this.performSelfAnalysis();
  }
}

//**************************
//Prueba del lexico y sintactio
//**************************
const input = `
{
  sensor: Bascula,
  zona: Bascula1,
  peso: 40,
  unidad: kg,
  estado: normal
}
`;
const parser = new SensorParser(allTokens);

const lexResult = SensorLexer.tokenize(input);

parser.input = lexResult.tokens;

const cst = parser.sensorObject();

if (parser.errors.length > 0) {
  console.error("Errores sintácticos:", parser.errors);
} else {
  console.log("✅ Sintaxis correcta");
}