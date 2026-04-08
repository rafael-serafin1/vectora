// Tipos de tokens possíveis na sua DSL
export type TokenType =
  | "IDENT"
  | "NUMBER"
  | "UNIT"
  | "LBRACE"
  | "RBRACE"
  | "LPAREN"
  | "RPAREN"
  | "COLON"
  | "SEMICOLON"
  | "COMMA"
  | "OPERATOR"
  | "ARROW"
  | "DELAY"
  | "PROPERTY"
  | "PROPERTY-TYPE";


// Estrutura básica de um token
export interface Token {
  type: TokenType;
  value?: string;
}

export function lexer(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  // Percorre o texto caractere por caractere
  while (i < input.length) {
    const char = input[i];

    // Ignora comentários de linha única "//"
    if (char === "/" && input[i + 1] === "/") {
      // Pula até o final da linha
      i += 2;
      while (i < input.length && input[i] !== "\n") {
        i++;
      }
      i++; // pula o '\n'
      continue;
    }

    // Ignora comentários de múltiplas linhas "/**/"
    if (char === "/" && input[i + 1] === "*") {
      i += 2;
      // Procura pelo fechamento "*/"
      while (i < input.length - 1) {
        if (input[i] === "*" && input[i + 1] === "/") {
          i += 2; // pula "*/"
          break;
        }
        i++;
      }
      continue;
    }

    // Ignora espaços, tabs e quebras de linha
    if (char && /\s/.test(char)) {
      i++;
      continue;
    }

     if (char === "{") {
      tokens.push({ type: "LBRACE" });
      i++;
      continue;
    }

    if (char === "}") {
      tokens.push({ type: "RBRACE" });
      i++;
      continue;
    }

    if (char === "(") {
      tokens.push({ type: "LPAREN" });
      i++;
      continue;
    }

    if (char === ")") {
      tokens.push({ type: "RPAREN" });
      i++;
      continue;
    }

    if (char === ":") {
      tokens.push({ type: "COLON" });
      i++;
      continue;
    }

    if (char === ";") {
      tokens.push({ type: "SEMICOLON" });
      i++;
      continue;
    }

    if (char === ",") {
      tokens.push({ type: "COMMA" });
      i++;
      continue;
    }


    // operador "=>" para manipulação de interpolação
    if (char === "=" && input[i + 1] === ">") {
      tokens.push({ type: "ARROW", value: "=>" });
      i += 2;
      continue;
    }


    // delay "--" seguido de número e unidade (ex: --1000ms)
    if (char === "-" && input[i + 1] === "-") {
      // Verifica se logo após "--" há um número e unidade
      const delayMatch = input.slice(i).match(/^--(\d+(?:\.\d+)?)(ms|s)(?=\s|;|}|=>|$)/);
      if (delayMatch) {
        const fullMatch = delayMatch[0];
        const value = delayMatch[1];
        const unit = delayMatch[2];
        tokens.push({ type: "DELAY", value: `${value}${unit}` });
        i += fullMatch.length;
        continue;
      }
    }


    // se for o símbolo de propriedade "&", retorna apenas o valor de propriedade (ex: ease-in-out)
    if (char === "&") {
      // Match apenas transition ou animation
      const match = input.slice(i).match(/^&(transition|animation):([a-zA-Z0-9_\-,\s()]+)/);

      if (match) {
        const [fullMatch, type, value] = match;
        tokens.push({ type: "PROPERTY-TYPE", value: type! });
        tokens.push({ type: "PROPERTY", value: value!.trim() });
        i += fullMatch.length;
        continue;
      }

      // Caso não seja transition/animation, assume easing simples
      const easingMatch = input.slice(i).match(/^&([a-zA-Z_][a-zA-Z0-9_-]*(\([^)]*\))?)/);
      if (easingMatch) {
        tokens.push({ type: "PROPERTY", value: easingMatch[1]! });
        i += easingMatch[0].length;
        continue;
      }
    }

    
    // operador de reversão '~'
    if (char === "~") {
      tokens.push({ type: "OPERATOR", value: "~"});
      i++;
      continue;
    }


    // Hex color ou operador de soma induzida '#'
    if (char === "#") {
      // Verifica se é uma cor hex (#fff, #ffffff, etc)
      const hexMatch = input.slice(i).match(/^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?/);
      if (hexMatch) {
        tokens.push({ type: "IDENT", value: hexMatch[0] });
        i += hexMatch[0].length;
        continue;
      }

      const idMatch = input.slice(i).match(/^#([a-zA-Z_-][a-zA-Z0-9_-]*)/);

      if (idMatch) {
        tokens.push({ type: "IDENT", value: idMatch[0] });
        i += idMatch[0].length;
        continue;
      }
      
      // Caso contrário, é um operador
      tokens.push({ type: "OPERATOR", value: "#"});
      i++;
      continue;
    } 


    // operador '±', é só o '+-' diferente
    if (char === "±") {
      tokens.push({ type: "OPERATOR", value: "+-" });
      i++;
      continue;
    }
    // operadores '++' e '+-'
    if (char === "+") {
      const next = input[i + 1];
      if (next === "+") {
        tokens.push({ type: "OPERATOR", value: "++" });
        i += 2;
        continue;
      } else if (next === "-") {
        tokens.push({ type: "OPERATOR", value: "+-"});
        i += 2;
        continue;
      }
    }


    if (char && /\d/.test(char)) {
      let value = "";

      // Continua lendo enquanto for número ou ponto (para decimais como 1.2)
      while (input[i] && /[\d.]/.test(input[i] as string)) {
        value += input[i];
        i++;
      }

      tokens.push({ type: "NUMBER", value });
      continue;
    }

    if (char && /[a-zA-Z_.#]/.test(char)) {
      let value = "";

      // permite letras, números, ponto, underscore, #, -, >, vírgulas e espaços para selectors CSS
      while (input[i] && /[a-zA-Z0-9_.#\->,\s]/.test(input[i] as string)) {
        value += input[i];
        i++;
      }

      // lista de unidades aceitadas pelo lexer (maior causa dos erros de "caractere inesperado")
      if (["ms", "s", "px", "%", "em", "rem", "vh", "vw", "pt", "cm", "mm", "in", "pc", "deg", "rad", "turn", "vh", "vw"].includes(value)) {
        tokens.push({ type: "UNIT", value });
      } else {
        tokens.push({ type: "IDENT", value });
      }

      continue;
    }

    throw new Error(`Caractere inesperado: '${char}'`);
  }

  return tokens;
}