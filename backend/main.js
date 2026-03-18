import { parseInput } from "./sintactico.js";

const input = `
{
  sensor: Bascula,
  zona: Bascula1,
  peso: 40,
  unidad: kg,
  estado: normal
}
`;

const result = parseInput(input);

if (result.lexErrors) {
  console.error("Errores léxicos:", result.lexErrors);
} else if (result.parseErrors) {
  console.error("Errores sintácticos:", result.parseErrors);
} else {
  console.log("Todo correcto");
}