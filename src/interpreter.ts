import { triggerEvents } from "./events/triggerEvents.js";
import { filterAnim } from "./filter/filterAnim.js";
import { getOperationType, getAnimationMetadata, canConcatenate, isAnimationValidForProperty, sumVectors, combineVectorsWithAngle, vectorToCssTransform, TransformVector, CssTransformFinal } from "./filter/animationMetadata.js";
import { reverseAnimation } from "./reverser/catalogedAnims.js";

// Tipagem mínima baseada no AST que você já tem
type ProgramNode = {
  type: "Program";
  rules: RuleNode[];
};

type RuleNode = {
  type: "Rule";
  selector: string;
  triggers: TriggerNode[];
};

type TriggerNode = {
  type: "Trigger";
  name: string;
  statements: StatementNode[];
};

type StatementNode = {
  type: "Statement";
  property: string;
  action: ActionExpr;
};

type ActionNode = {
  type: "Action";
  name: string;
  args: (string | number)[];
};

type ActionGroupNode = {
  type: "Group";
  expression: ActionExpr;
};

type ResultActionNode = {
  type: "ResultAction";
  vector: TransformVector;
};

type ActionSequenceNode = {
  type: "ActionSequence";
  parts: ActionExpr[];
  operators: string[];
  finalActions?: ActionNode[];
  delays?: (number | null)[];
  finalDelayMs?: number;
  properties?: string;
  propertiesType?: string;
};

type ActionExpr = ActionNode | ActionSequenceNode | ActionGroupNode | ResultActionNode;

// registra o trigger 
const triggerRegistry: Record<string, (cb: (targets?: HTMLElement[]) => any, elements: NodeListOf<HTMLElement>) => void> = triggerEvents;

function isActionNode(expr: ActionExpr): expr is ActionNode {
  return expr.type === "Action";
}

function isActionGroupNode(expr: ActionExpr): expr is ActionGroupNode {
  return expr.type === "Group";
}

function isActionSequenceNode(expr: ActionExpr): expr is ActionSequenceNode {
  return expr.type === "ActionSequence";
}

function isResultActionNode(expr: ActionExpr): expr is ResultActionNode {
  return expr.type === "ResultAction";
}

function getExpressionMetadata(expr: ActionExpr): ReturnType<typeof getAnimationMetadata> | null {
  if (isActionNode(expr)) {
    const name = expr.name.startsWith("~") ? expr.name.slice(1) : expr.name;
    return getAnimationMetadata(name);
  }

  if (isActionGroupNode(expr)) {
    return getExpressionMetadata(expr.expression);
  }

  if (isActionSequenceNode(expr)) {
    if (expr.parts.length === 0) return null;
    if (expr.operators.length === 0) {
      return getExpressionMetadata(expr.parts[0]!);
    }

    let currentMeta = getExpressionMetadata(expr.parts[0]!);
    for (let idx = 0; idx < expr.operators.length; idx++) {
      const operator = expr.operators[idx];
      const rightMeta = getExpressionMetadata(expr.parts[idx + 1]!);
      if (!currentMeta) {
        currentMeta = rightMeta;
        continue;
      }
      if (!rightMeta) continue;

      const operationType = operator === "#"
        ? "soma"
        : operator === "+-"
          ? "concatenacao"
          : getExpressionOperationType(currentMeta, rightMeta);

      if (operationType === "soma") {
        currentMeta = {
          family: currentMeta.family,
          singularity: "indefinida",
          vector: combineVectorsWithAngle(currentMeta.vector, rightMeta.vector),
          property: currentMeta.property || rightMeta.property,
          subfamily: "diagonal",
        } as any;
      } else {
        currentMeta = rightMeta;
      }
    }
    return currentMeta;
  }

  return null;
}

function getExpressionVector(expr: ActionExpr): TransformVector | null {
  if (isActionNode(expr)) {
    const name = expr.name.startsWith("~") ? expr.name.slice(1) : expr.name;
    const meta = getAnimationMetadata(name);
    return meta?.vector || null;
  }

  if (isActionGroupNode(expr)) {
    return getExpressionVector(expr.expression);
  }

  if (isResultActionNode(expr)) {
    return expr.vector;
  }

  if (isActionSequenceNode(expr)) {
    if (expr.parts.length === 0) return null;
    let currentVector = getExpressionVector(expr.parts[0]!);

    for (let idx = 0; idx < expr.operators.length; idx++) {
      const operator = expr.operators[idx];
      const nextVector = getExpressionVector(expr.parts[idx + 1]!);
      const leftMeta = currentVector ? { vector: currentVector } as any : null;
      const rightMeta = nextVector ? { vector: nextVector } as any : null;
      const operationType = operator === "#"
        ? "soma"
        : operator === "+-"
          ? "concatenacao"
          : getExpressionOperationType(leftMeta, rightMeta);

      if (operationType === "soma") {
        currentVector = combineVectorsWithAngle(currentVector ?? {}, nextVector ?? {});
      } else {
        currentVector = nextVector;
      }
    }

    return currentVector;
  }

  return null;
}

function getExpressionOperationType(leftMeta: ReturnType<typeof getAnimationMetadata> | null, rightMeta: ReturnType<typeof getAnimationMetadata> | null): "soma" | "concatenacao" {
  if (!leftMeta || !rightMeta) {
    return "concatenacao";
  }

  if (!canConcatenate(leftMeta.singularity, rightMeta.singularity)) {
    return "soma";
  }

  if (leftMeta.family !== rightMeta.family) {
    return "soma";
  }

  if (leftMeta.family === "vetorial") {
    return leftMeta.subfamily !== rightMeta.subfamily ? "soma" : "concatenacao";
  }

  return "concatenacao";
}

function createResultAction(left: ActionExpr, right: ActionExpr): ResultActionNode {
  const leftVector = getExpressionVector(left) || {};
  const rightVector = getExpressionVector(right) || {};
  return {
    type: "ResultAction",
    vector: combineVectorsWithAngle(leftVector, rightVector),
  };
}

function delay(ms: number | null): Promise<void> {
  if (ms === null || ms === undefined) return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function executeActionExpr(element: HTMLElement, expr: ActionExpr, property: string) {
  if (isActionNode(expr)) {
    if (expr.name.includes("~")) {
      const result = reverseAnimation(expr.name);
      const argsStr = expr.args.join(",");

      if (!result) {
        throw new Error(`[Vectora] Animação não encontrada: ${expr.name}`);
      }

      await Promise.resolve(result(element, argsStr));
      return;
    }

    const animResult = filterAnim(expr.name);
    const animationFn = animResult.fn;
    const argsStr = expr.args.join(",");

    if (!animationFn) {
      throw new Error(`[Vectora] Animação não encontrada: ${expr.name}`);
    }

    await Promise.resolve(animationFn(element, argsStr));
    return;
  }

  if (isResultActionNode(expr)) {
    const cssTransform = vectorToCssTransform(expr.vector);
    element.style.transition = "none";
    element.style.transform = cssTransform;
    void element.offsetWidth;
    element.style.transition = `transform 600ms ${property ?? "linear"}`;
    element.style.transform = "none";

    await new Promise<void>(resolve => {
      const onEnd = () => {
        element.removeEventListener("transitionend", onEnd);
        resolve();
      };

      element.addEventListener("transitionend", onEnd);
      setTimeout(() => {
        element.removeEventListener("transitionend", onEnd);
        resolve();
      }, 650);
    });
    return;
  }

  if (isActionGroupNode(expr)) {
    await executeActionExpr(element, expr.expression, property);
    return;
  }

  if (isActionSequenceNode(expr)) {
    await executeSequenceNode(element, expr, property);
    return;
  }
}

async function executeSequenceNode(element: HTMLElement, seq: ActionSequenceNode, property: string) {
  if (seq.parts.length === 0) return;
  if (seq.operators.length === 0) {
    await executeActionExpr(element, seq.parts[0]!, property);
    return;
  }

  let currentExpr = seq.parts[0]!;

  for (let idx = 0; idx < seq.operators.length; idx++) {
    const operator = seq.operators[idx];
    const nextExpr = seq.parts[idx + 1]!;
    const delayMs = seq.delays?.[idx] ?? null;

    if (delayMs !== null) {
      console.log(`[Vectora] Aguardando ${delayMs}ms antes do próximo segmento`);
      await delay(delayMs);
    }

    const leftMeta = getExpressionMetadata(currentExpr);
    const rightMeta = getExpressionMetadata(nextExpr);
    const opType = operator === "#"
      ? "soma"
      : operator === "+-"
        ? "concatenacao"
        : getExpressionOperationType(leftMeta, rightMeta);

    if (opType === "concatenacao") {
      await executeActionExpr(element, currentExpr, property);
      currentExpr = nextExpr;
    } else {
      currentExpr = createResultAction(currentExpr, nextExpr);
    }
  }

  await executeActionExpr(element, currentExpr, property);
}

async function executeStatementExpression(element: HTMLElement, actionExpr: ActionExpr, easing: string) {
  await executeActionExpr(element, actionExpr, easing);

  if (isActionSequenceNode(actionExpr) && actionExpr.finalDelayMs) {
    console.log(`[Vectora] Aguardando ${actionExpr.finalDelayMs}ms antes das ações finais`);
    await delay(actionExpr.finalDelayMs);
  }

  if (isActionSequenceNode(actionExpr) && actionExpr.finalActions) {
    for (const finalAction of actionExpr.finalActions) {
      console.log("[Vectora] Executando ação final (manipulação de interpolação):", finalAction.name);
      const animResult = filterAnim(finalAction.name as string);
      const animationFn = animResult.fn;
      const argsStr = finalAction.args.join(",");

      if (!animationFn) {
        throw new Error(`[Vectora] Animação final não encontrada: ${finalAction.name}`);
      }

      await Promise.resolve(animationFn(element, argsStr));
    }
  }
}

/// função principal de interpretação do AST
/// percorre o AST e registra os triggers, associonando-os aos elementos selecionados e executa as animações
export function interpret(ast: ProgramNode) {
  console.log("[Vectora] Iniciando interpretação de", ast.rules.length, "regra(s)");
  
  // percorre cada regra
  for (const rule of ast.rules) {
    console.log("[Vectora] Processando regra com seletor:", rule.selector);

    // resolução do seletor CSS (tags, classes e ids)
    const elements = document.querySelectorAll<HTMLElement>(rule.selector);

    if (elements.length === 0) {
      console.warn(`[Vectora] Nenhum elemento encontrado para: ${rule.selector}`);
      continue;
    }
    
    console.log(`[Vectora] ${elements.length} elemento(s) encontrado(s) para "${rule.selector}"`);

    // cada regra pode ter vários triggers
    for (const trigger of rule.triggers) {
      console.log("[Vectora] Registrando trigger:", trigger.name);

      // registro de gatilho usando a função correspondente do triggerRegistry
      const triggerFn = triggerRegistry[trigger.name];

      // caso o trigger digitado não exista no registro
      if (!triggerFn) {
        throw new Error(`[Vectora] Trigger não suportado: ${trigger.name}`);
      }

      // registra o trigger; o callback pode receber um array opcional de elementos-alvo
      triggerFn(async (targets?: HTMLElement[]) => {
        console.log("[Vectora] Trigger disparado:", trigger.name);

        // elementos do trigger 
        const runElements = targets && targets.length ? targets : Array.from(elements);

        // quando o trigger dispara, executa as statements apenas nos elementos alvo
        for (const element of runElements) {
          // executar cada statement em paralelo (cada statement pode conter uma sequência interna)
          const statementPromises: Promise<any>[] = [];

          for (const statement of trigger.statements) {
            const actionExpr = statement.action;
            const property = statement.property;

            const collectActionNodes = (expr: ActionExpr): ActionNode[] => {
              if (isActionNode(expr)) {
                return [expr];
              }
              if (isActionGroupNode(expr)) {
                return collectActionNodes(expr.expression);
              }
              if (isActionSequenceNode(expr)) {
                return expr.parts.flatMap(part => collectActionNodes(part));
              }
              return [];
            };

            const validateActionNode = (action: ActionNode) => {
              const animName = action.name.startsWith("~") ? action.name.slice(1) : action.name;
              if (!isAnimationValidForProperty(animName, property)) {
                throw new Error(`[Vectora] Erro: A propriedade '${property}' não pode receber a animação '${animName}'. Animações compatíveis com '${property}' devem ser específicas dessa propriedade.`);
              }
            };

            for (const actionNode of collectActionNodes(actionExpr)) {
              validateActionNode(actionNode);
            }

            if (isActionSequenceNode(actionExpr) && actionExpr.finalActions) {
              for (const finalAction of actionExpr.finalActions) {
                validateActionNode(finalAction);
              }
            }

            const easing = isActionSequenceNode(actionExpr) ? actionExpr.properties ?? "linear" : "linear";
            statementPromises.push(executeStatementExpression(element, actionExpr, easing));
          }

          // Aguarda todas as statements (cada uma já trata sequências internamente)
          await Promise.all(statementPromises);
        }
      }, elements);
    }
  }
}