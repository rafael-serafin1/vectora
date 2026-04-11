import { Token, TokenType, lexer } from "./lexer.js";

// AST raiz
// nó principal
interface ProgramNode {
  type: "Program";
  rules: RuleNode[];
}

// nó de regra
interface RuleNode {
  type: "Rule";
  selector: string;
  triggers: TriggerNode[];
}

// nó de trigger
interface TriggerNode {
  type: "Trigger";
  name: string;
  statements: StatementNode[];
  imports?: string[];
}

// nó de declaração
interface StatementNode {
  type: "Statement";
  property: string;
  action: ActionExpr;
}

// nó de ação
type ActionNode = {
  type: "Action";
  name: string;
  args: (string | number)[];
};

// nó de grupo de expressões entre parênteses
 type ActionGroupNode = {
  type: "Group";
  expression: ActionExpr;
};

// nó de sequência de ações
 type ActionSequenceNode = {
  type: "ActionSequence";
  parts: ActionExpr[];
  operators: string[];
  finalActions?: ActionNode[] | undefined;  // ação final (depois de "=>")
  delays?: (number | null)[];               // delays entre ações (em ms), null significa sem delay
  finalDelayMs?: number;                    // delay antes de executar ações finais
  propertiesType?: string[] | string;               // tipos de propriedades (animation e transition)
  properties?: string[] | string;                        // propriedades de interpolação
};

type ActionExpr = ActionNode | ActionSequenceNode | ActionGroupNode;

export function parser(tokens: Token[]): ProgramNode {
  let i = 0;

  function current() {
    return tokens[i];
  }

  function consume(type: TokenType, errorMsg: string) {
    const token = tokens[i];

    if (!token || token.type !== type) {
      throw new Error(errorMsg);
    }

    i++;
    return token;
  } 
  function parseProgram(): ProgramNode {
    const rules: RuleNode[] = [];

    while (i < tokens.length) {
      rules.push(parseRule());
    }

    return {
      type: "Program",
      rules,
    };
  }
  function parseRule(): RuleNode {
    const selector = parseSelector();

    consume("LBRACE", "Esperado '{' após seletor");

    const triggers: TriggerNode[] = [];

    while (current() && current()!.type !== "RBRACE") {
      triggers.push(parseTrigger());
    }

    consume("RBRACE", "Esperado '}' no fim da regra");

    return {
      type: "Rule",
      selector,
      triggers,
    };
  }

  function parseSelector(): string {
    let selector = "";

    while (current() && current()!.type !== "LBRACE") {
      const token = current()!;
      if (token.type === "COMMA") {
        selector += ",";
        consume("COMMA", "Esperado ',' ou '{' após seletor");
      } else if (token.type === "IDENT") {
        if (selector && !selector.endsWith(",") && !selector.endsWith(" ")) {
          selector += " ";
        }
        selector += token.value?.trim() ?? "";
        consume("IDENT", "Esperado seletor (tag, .class, #id)");
      } else {
        throw new Error("Esperado seletor antes de '{'");
      }
    }

    return selector.trim().replace(/\s+/g, " ");
  }

  function parseTrigger(): TriggerNode {
    const nameToken = consume(
      "IDENT",
      "Esperado nome do trigger event."
    );

    consume("LBRACE", "Esperado '{' após trigger");

    const statements: StatementNode[] = [];
    const imports: string[] = [];
    const triggerName = nameToken.value!.trim();

    if (triggerName === "import") {
      while (current() && current()!.type !== "RBRACE") {
        if (current()!.type === "IDENT") {
          imports.push(consume("IDENT", "Esperado nome da biblioteca").value!.trim());
        } else if (current()!.type === "COMMA") {
          consume("COMMA", "Esperado ',' entre bibliotecas");
        } else {
          throw new Error("Esperado nome da biblioteca ou ',' no import");
        }
      }
    } else {
      while (current() && current()!.type !== "RBRACE") {
        statements.push(parseStatement());
      }
    }

    consume("RBRACE", "Esperado '}' no fim do trigger");
    consume("SEMICOLON", "Esperado ';' após bloco do trigger");

    return {
      type: "Trigger",
      name: triggerName,
      statements,
      ...(imports.length > 0 ? { imports } : {}),
    };
  }

  function parseStatement(): StatementNode {
    const propertyToken = consume(
      "IDENT",
      "Esperado nome de uma propriedade"
    );

    consume("COLON", "Esperado ':' após propriedade");

    const actionExpr = parseExpression();

    const finalActions: ActionNode[] = [];
    let finalDelay: number | null = null;
    let propertyNew: string = "";
    let typeNew: string = "";
    const arrowDelays: (number | null)[] = [];

    const parseDelayToken = (delayToken: string) => {
      const match = delayToken.match(/^(\d+(?:\.\d+)?)(ms|s)$/);
      if (match && match[1]) {
        const value = parseFloat(match[1]);
        return match[2] === "s" ? value * 1000 : value;
      }
      return null;
    };

    // Captura delay solto após a ação principal, quando não há '=>'
    if (current() && current()!.type === "DELAY") {
      const delayToken = consume("DELAY", "Esperado delay").value!;
      finalDelay = parseDelayToken(delayToken);
      arrowDelays.push(finalDelay);
    }

    // Verifica se há múltiplos "=>" (manipulação de interpolação)
    while (current() && current()!.type === "ARROW") {
      consume("ARROW", "Esperado '=>'");

      if (current() && current()!.type === "DELAY") {
        const delayToken = consume("DELAY", "Esperado delay").value!;
        finalDelay = parseDelayToken(delayToken);
        arrowDelays.push(finalDelay);
      }

      if (current() && current()!.type === "PROPERTY-TYPE") {
        typeNew = consume("PROPERTY-TYPE", "Esperado tipo de propriedade").value!;
      }
      if (current() && current()!.type === "PROPERTY") {
        propertyNew = consume("PROPERTY", "Esperado propriedade").value!;
      }
      else if (current() && current()!.type !== "SEMICOLON" && current()!.type !== "DELAY" && current()!.type !== "PROPERTY") {
        finalActions.push(parseAction());

        if (current() && current()!.type === "DELAY") {
          const delayToken = consume("DELAY", "Esperado delay").value!;
          const match = delayToken.match(/^(\d+(?:\.\d+)?)(ms|s)$/);
          if (match && match[1]) {
            let value = parseFloat(match[1]);
            const unit = match[2] || "ms";
            finalDelay = unit === "s" ? value * 1000 : value;
          }
          arrowDelays.push(finalDelay);
        }
      }
    }

    consume("SEMICOLON", "Esperado ';' no fim da declaração");

    let action: ActionExpr = actionExpr;

    const addArrowMetadata = (sequenceNode: ActionSequenceNode) => {
      if (finalActions.length > 0) {
        sequenceNode.finalActions = finalActions;
      }
      if (finalDelay !== null) {
        sequenceNode.finalDelayMs = finalDelay;
      }
      if (propertyNew !== "") {
        sequenceNode.properties = propertyNew;
      }
      if (typeNew !== "") {
        sequenceNode.propertiesType = typeNew;
      }

      if (arrowDelays.length > 0 && finalActions.length === 0) {
        const delayValue = arrowDelays[0];
        if (delayValue !== null && delayValue !== undefined) {
          if (sequenceNode.operators.length > 0) {
            const operatorCount = sequenceNode.operators.length;
            if (!sequenceNode.delays) {
              sequenceNode.delays = Array(operatorCount).fill(null);
            }

            if (sequenceNode.delays.length !== operatorCount) {
              sequenceNode.delays = sequenceNode.delays.slice(0, operatorCount);
              while (sequenceNode.delays.length < operatorCount) {
                sequenceNode.delays.push(null);
              }
            }

            sequenceNode.delays[operatorCount - 1] = delayValue;
          } else {
            sequenceNode.finalDelayMs = delayValue;
          }
        }
      }
    };

    if (actionExpr.type === "ActionSequence") {
      addArrowMetadata(actionExpr);
    } else if (finalActions.length > 0 || propertyNew !== "" || typeNew !== "" || finalDelay !== null || arrowDelays.length > 0) {
      const wrapperSequence: ActionSequenceNode = {
        type: "ActionSequence",
        parts: [actionExpr],
        operators: [],
      };
      addArrowMetadata(wrapperSequence);
      action = wrapperSequence;
    }

    return {
      type: "Statement",
      property: propertyToken.value!.trim(),
      action,
    };
  }

  function parseExpression(): ActionExpr {
    let expr = parsePrimary();

    while (current() && current()!.type === "OPERATOR") {
      const operator = consume("OPERATOR", "Esperado operador").value!;

      let delay: number | null = null;
      if (current() && current()!.type === "DELAY") {
        const delayToken = consume("DELAY", "Esperado delay").value!;
        const match = delayToken.match(/^(\d+(?:\.\d+)?)(ms|s)$/);
        if (match && match[1]) {
          let value = parseFloat(match[1]);
          const unit = match[2] || "ms";
          delay = unit === "s" ? value * 1000 : value;
        }
      }

      const rightExpr = parsePrimary();

      expr = {
        type: "ActionSequence",
        parts: [expr, rightExpr],
        operators: [operator],
        delays: [delay],
      };
    }

    return expr;
  }

  function parsePrimary(): ActionExpr {
    if (current() && current()!.type === "LPAREN") {
      consume("LPAREN", "Esperado '('.");
      const expression = parseExpression();
      consume("RPAREN", "Esperado ')'");
      return { type: "Group", expression };
    }

    return parseAction();
  }

  function parseAction(): ActionNode {
    // Verifica se há um operador unário (~, #) antes da ação
    let unaryOp = "";
    if (current() && current()!.type === "OPERATOR" && (current()!.value === "~" || current()!.value === "#")) {
      unaryOp = consume("OPERATOR", "Esperado operador").value!;
    }

    const actionToken = consume(
      "IDENT",
      "Esperado nome da ação"
    );

    const actionName = unaryOp + actionToken.value;

    consume("LPAREN", "Esperado '(' após ação");

    // aceita parênteses vazios: func()
    if (current() && current()!.type === "RPAREN") {
      consume("RPAREN", "Esperado ')' após argumentos");
      return {
        type: "Action",
        name: actionName,
        args: [],
      };
    }

    const args: (string | number)[] = [];

    // Lê o primeiro argumento (se houver)
    let argToken = current();
    if (argToken) {
      if (argToken.type === "NUMBER") {
        let value = Number(consume("NUMBER", "Esperado número").value);
        // Se o próximo token é uma unidade, concatena
        if (current() && current()!.type === "UNIT") {
          const unit = consume("UNIT", "Esperado unidade").value!;
          args.push(`${value}${unit}`);
        } else {
          args.push(value);
        }
      } else if (argToken.type === "STRING") {
        args.push(consume("STRING", "Esperado string").value!);
      } else if (argToken.type === "IDENT") {
        args.push(consume("IDENT", "Esperado identificador").value!);
      }
    }

    // Lê argumentos adicionais separados por vírgula
    while (current() && current()!.type === "COMMA") {
      consume("COMMA", "Esperado ','");
      argToken = current();
      
      if (argToken) {
        if (argToken.type === "NUMBER") {
          let value = Number(consume("NUMBER", "Esperado número").value);
          // Se o próximo token é uma unidade, concatena
          if (current() && current()!.type === "UNIT") {
            const unit = consume("UNIT", "Esperado unidade").value!;
            args.push(`${value}${unit}`);
          } else {
            args.push(value);
          }
        } else if (argToken.type === "STRING") {
          args.push(consume("STRING", "Esperado string").value!);
        } else if (argToken.type === "IDENT") {
          args.push(consume("IDENT", "Esperado identificador").value!);
        }
      }
    }

    consume("RPAREN", "Esperado ')' após argumentos");

    return {
      type: "Action",
      name: actionName,
      args,
    };
  }

  return parseProgram();
}
