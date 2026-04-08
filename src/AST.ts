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
    const selectorToken = consume(
      "IDENT",
      "Esperado seletor (tag, .class, #id)"
    );

    consume("LBRACE", "Esperado '{' após seletor");

    const triggers: TriggerNode[] = [];

    const selector = selectorToken.value!.trim().replace(/\s+/g, " ");

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

  function parseTrigger(): TriggerNode {
    const nameToken = consume(
      "IDENT",
      "Esperado nome do trigger event."
    );

    consume("LBRACE", "Esperado '{' após trigger");

    const statements: StatementNode[] = [];

    while (current() && current()!.type !== "RBRACE") {
      statements.push(parseStatement());
    }

    consume("RBRACE", "Esperado '}' no fim do trigger");
    consume("SEMICOLON", "Esperado ';' após bloco do trigger");

    return {
      type: "Trigger",
      name: nameToken.value!.trim(),
      statements,
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

    // Verifica se há múltiplos "=>" (manipulação de interpolação)
    while (current() && current()!.type === "ARROW") {
      consume("ARROW", "Esperado '=>'");

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
      if (arrowDelays.length > 0) {
        sequenceNode.delays = sequenceNode.delays
          ? [...sequenceNode.delays, ...arrowDelays]
          : arrowDelays;
      }
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
