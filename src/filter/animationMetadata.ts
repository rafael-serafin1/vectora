export type AnimationFamily = "vetorial" | "escalar" | "adimensional";
export type VectorSubfamily = "horizontal" | "vertical" | "diagonal" | null;
export type AnimationSingularity = "entrada" | "saída" | "indefinida";
export type AnimationProperty = "text" | "color" | "background.color" | "transform" | "radius" | "gap" | "weight" | "brightness" | "shadow" | "text.shadow";

/// 
/// Vetor de transformação de uma animação (componentes de movimento)
/// Define os componentes X, Y, Z de translação e rotação
/// 
export interface TransformVector {
  translateX?: number;  // pixels
  translateY?: number;  // pixels
  translateZ?: number;  // pixels
  rotateX?: number;    // degrees
  rotateY?: number;    // degrees
  rotateZ?: number;    // degrees
  scaleX?: number;     // multiplier (1 = sem mudança)
  scaleY?: number;     // multiplier
  scaleZ?: number;     // multiplier
  opacity?: number;    // 0-1
}

export interface AnimationMetadata {
  family: AnimationFamily;
  subfamily?: VectorSubfamily; // apenas para animações vetoriais
  singularity: AnimationSingularity; // entrada, saída ou indefinida
  vector: TransformVector; // efeito de transformação
  property: AnimationProperty; // qual propriedade pode usar esta animação
}

/// 
/// Mapa de metadados de animações
/// Classificação baseada em DEEPKNOWLAGE.md
/// 
/// Singularidades:
/// - "entrada": animações de entrada (fadeIn, slideIn, etc)
/// - "saída": animações de saída (fadeOut, slideOut, etc)
/// - "indefinida": animações que não são entrada nem saída (shake, spin, etc)
/// 
export const animationMetadata: Record<string, AnimationMetadata> = {
  // TEXT ANIMATIONS - Vetorial Vertical
  land: { 
    family: "vetorial", 
    subfamily: "vertical",
    singularity: "entrada",
    vector: { translateY: -30 },
    property: "text"
  },
  rise: { 
    family: "vetorial", 
    subfamily: "vertical",
    singularity: "entrada",
    vector: { translateY: 30 },
    property: "text"
  },

  // TEXT ANIMATIONS - Vetorial Horizontal
  slideIn: { 
    family: "vetorial", 
    subfamily: "horizontal",
    singularity: "entrada",
    vector: { translateX: -30 },
    property: "text"
  },
  slideOut: { 
    family: "vetorial", 
    subfamily: "horizontal",
    singularity: "saída",
    vector: { translateX: 30 },
    property: "text"
  },

  // TEXT ANIMATIONS - Escalar (opacidade)
  fadeIn: { 
    family: "escalar",
    singularity: "entrada",
    vector: { opacity: 0 },
    property: "text"
  },
  fadeOut: { 
    family: "escalar",
    singularity: "saída",
    vector: { opacity: 1 },
    property: "text"
  },
  pop: { 
    family: "escalar",
    singularity: "indefinida",
    vector: { scaleX: 0.5, scaleY: 0.5 },
    property: "text"
  },
  implode: { 
    family: "escalar",
    singularity: "indefinida",
    vector: { scaleX: 2, scaleY: 2 },
    property: "text"
  },

  // TEXT ANIMATIONS - Adimensional (tremulação/agitação)
  shiver: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "text"
  },
  shake: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "text"
  },

  // TEXT ANIMATIONS - Vetorial Diagonal
  spin: { 
    family: "escalar", 
    singularity: "indefinida",
    vector: { rotateZ: 360 },
    property: "text"
  },

  // COLOR ANIMATIONS - Adimensional
  fadeColor: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "color"
  },
  chameleonCamo: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "color"
  },
  octopusCamo: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "color"
  },
  paint: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "color"
  },
  liquidFill: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "color"
  },

  // TRANSFORM ANIMATIONS - Vetorial Diagonal / Escalar
  rotate: { 
    family: "escalar", 
    singularity: "indefinida",
    vector: { rotateZ: 180 },
    property: "transform"
  },
  zoomIn: { 
    family: "escalar",
    singularity: "indefinida",
    vector: { scaleX: 0.8, scaleY: 0.8 },
    property: "transform"
  },
  zoomOut: { 
    family: "escalar",
    singularity: "indefinida",
    vector: { scaleX: 1.2, scaleY: 1.2 },
    property: "transform"
  },
  mirror: { 
    family: "escalar",
    singularity: "indefinida",
    vector: { scaleX: -1 },
    property: "transform"
  },

  // RADIUS ANIMATIONS - Adimensional
  round: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "radius"
  },
  corner: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "radius"
  },

  // GAP ANIMATIONS - Vetorial Horizontal
  bloom: { 
    family: "vetorial", 
    subfamily: "horizontal",
    singularity: "indefinida",
    vector: {},
    property: "gap"
  },
  stagedBloom: { 
    family: "vetorial", 
    subfamily: "horizontal",
    singularity: "indefinida",
    vector: {},
    property: "gap"
  },

  // WEIGHT ANIMATIONS - Escalar
  skinny: { 
    family: "escalar",
    singularity: "indefinida",
    vector: {},
    property: "weight"
  },
  heavy: { 
    family: "escalar",
    singularity: "indefinida",
    vector: {},
    property: "weight"
  },

  // BRIGHTNESS ANIMATIONS - Adimensional
  halo: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "brightness"
  },
  fadeLight: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "brightness"
  },
  neon: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "brightness"
  },
  pillar: { 
    family: "adimensional",
    singularity: "indefinida",
    vector: {},
    property: "brightness"
  },

  // SHADOW ANIMATIONS
  surge: { 
    family: "vetorial", 
    subfamily: "horizontal",
    singularity: "indefinida",
    vector: {},
    property: "shadow"
  },
  fadeDusk: { 
    family: "escalar",
    singularity: "indefinida",
    vector: {},
    property: "shadow"
  },
  purge: { 
    family: "vetorial", 
    subfamily: "diagonal",
    singularity: "indefinida",
    vector: {},
    property: "shadow"
  },
};


/// obtém os metadados de uma animação
export function getAnimationMetadata(animName: string): AnimationMetadata | null {
  return animationMetadata[animName] || null;
}

/// Valida se uma animação é compatível com a propriedade CSS indicada
/// Retorna true se a animação pode ser usada com a propriedade, false caso contrário
export function isAnimationValidForProperty(animName: string, property: string): boolean {
  const metadata = getAnimationMetadata(animName);
  if (!metadata) {
    return false; // Animação desconhecida
  }
  return metadata.property === property;
}


/// Resultado: {translateX: 100, translateY: 50}
export function sumVectors(v1: TransformVector, v2: TransformVector): TransformVector {
  const result: TransformVector = {};
  
  if (v1.translateX !== undefined || v2.translateX !== undefined) {
    result.translateX = (v1.translateX || 0) + (v2.translateX || 0);
  }
  if (v1.translateY !== undefined || v2.translateY !== undefined) {
    result.translateY = (v1.translateY || 0) + (v2.translateY || 0);
  }
  if (v1.translateZ !== undefined || v2.translateZ !== undefined) {
    result.translateZ = (v1.translateZ || 0) + (v2.translateZ || 0);
  }
  if (v1.rotateX !== undefined || v2.rotateX !== undefined) {
    result.rotateX = (v1.rotateX || 0) + (v2.rotateX || 0);
  }
  if (v1.rotateY !== undefined || v2.rotateY !== undefined) {
    result.rotateY = (v1.rotateY || 0) + (v2.rotateY || 0);
  }
  if (v1.rotateZ !== undefined || v2.rotateZ !== undefined) {
    result.rotateZ = (v1.rotateZ || 0) + (v2.rotateZ || 0);
  }
  if (v1.scaleX !== undefined || v2.scaleX !== undefined) {
    result.scaleX = (v1.scaleX || 1) * (v2.scaleX || 1);
  }
  if (v1.scaleY !== undefined || v2.scaleY !== undefined) {
    result.scaleY = (v1.scaleY || 1) * (v2.scaleY || 1);
  }
  if (v1.scaleZ !== undefined || v2.scaleZ !== undefined) {
    result.scaleZ = (v1.scaleZ || 1) * (v2.scaleZ || 1);
  }
  if (v1.opacity !== undefined || v2.opacity !== undefined) {
    const op1 = v1.opacity !== undefined ? v1.opacity : undefined;
    const op2 = v2.opacity !== undefined ? v2.opacity : undefined;
    if (op1 !== undefined) {
      result.opacity = op1;
    } else if (op2 !== undefined) {
      result.opacity = op2;
    }
  }
  
  return result;
}

function normalizeAngle(angle: number): number {
  const full = Math.PI * 2;
  let normalized = angle % full;
  if (normalized < 0) normalized += full;
  return normalized;
}

function meanAngle(a: number, b: number): number {
  const x = Math.cos(a) + Math.cos(b);
  const y = Math.sin(a) + Math.sin(b);
  return Math.atan2(y, x);
}

export function combineVectorsWithAngle(v1: TransformVector, v2: TransformVector): TransformVector {
  const hasTranslation = (v: TransformVector) => v.translateX !== undefined || v.translateY !== undefined;

  if (!hasTranslation(v1) || !hasTranslation(v2)) {
    return sumVectors(v1, v2);
  }

  const x1 = v1.translateX ?? 0;
  const y1 = v1.translateY ?? 0;
  const x2 = v2.translateX ?? 0;
  const y2 = v2.translateY ?? 0;

  const angle1 = normalizeAngle(Math.atan2(y1, x1));
  const angle2 = normalizeAngle(Math.atan2(y2, x2));
  const averageAngle = meanAngle(angle1, angle2);

  const mag1 = Math.sqrt(x1 * x1 + y1 * y1);
  const mag2 = Math.sqrt(x2 * x2 + y2 * y2);
  const magnitude = Math.max(mag1, mag2);

  const combinedX = magnitude * Math.cos(averageAngle);
  const combinedY = magnitude * Math.sin(averageAngle);

  const result = sumVectors(v1, v2);
  result.translateX = Number(combinedX.toFixed(4));
  result.translateY = Number(combinedY.toFixed(4));

  return result;
}


/// Converte um vetor de transformação em string CSS transform
export function vectorToCssTransform(vector: TransformVector): string {
  const transforms: string[] = [];
  
  if (vector.translateX || vector.translateY || vector.translateZ) {
    const x = vector.translateX || 0;
    const y = vector.translateY || 0;
    const z = vector.translateZ || 0;
    if (z !== 0) {
      transforms.push(`translate3d(${x}px, ${y}px, ${z}px)`);
    } else {
      transforms.push(`translate(${x}px, ${y}px)`);
    }
  }
  
  if (vector.rotateX) transforms.push(`rotateX(${vector.rotateX}deg)`);
  if (vector.rotateY) transforms.push(`rotateY(${vector.rotateY}deg)`);
  if (vector.rotateZ) transforms.push(`rotateZ(${vector.rotateZ}deg)`);
  
  if (vector.scaleX || vector.scaleY || vector.scaleZ) {
    const sx = vector.scaleX || 1;
    const sy = vector.scaleY || 1;
    const sz = vector.scaleZ || 1;
    if (sz !== 1) {
      transforms.push(`scale3d(${sx}, ${sy}, ${sz})`);
    } else {
      transforms.push(`scale(${sx}, ${sy})`);
    }
  }
  
  return transforms.join(' ');
}

/// Converte um vetor de transformação em string CSS transform
export function CssTransformFinal(vector: TransformVector): string {
  const transforms: string[] = [];
  
  if (vector.translateX || vector.translateY || vector.translateZ) {
    const x = vector.translateX || 0;
    const y = vector.translateY || 0;
    const z = vector.translateZ || 0;
    if (z !== 0) {
      transforms.push(`translate3d(0px, 0px, 0px)`);
    } else {
      transforms.push(`translate(0px, 0px)`);
    }
  }
  
  if (vector.rotateX) transforms.push(`rotateX(0deg)`);
  if (vector.rotateY) transforms.push(`rotateY(0deg)`);
  if (vector.rotateZ) transforms.push(`rotateZ(0deg)`);
  
  if (vector.scaleX || vector.scaleY || vector.scaleZ) {
    const sx = vector.scaleX || 1;
    const sy = vector.scaleY || 1;
    const sz = vector.scaleZ || 1;
    if (sz !== 1) {
      transforms.push(`scale3d(0, 0, 0)`);
    } else {
      transforms.push(`scale(0, 0)`);
    }
  }
  
  return transforms.join(' ');
}


/// Determina se duas animações podem ser concatenadas
/// Regra: Não podem ser concatenadas duas animações de entrada ou duas de saída
/// (não se pode entrar duas vezes sem antes sair)
export function canConcatenate(singularity1: AnimationSingularity, singularity2: AnimationSingularity): boolean {
  // Não pode concatenar entrada + entrada
  if (singularity1 === "entrada" && singularity2 === "entrada") return false;
  
  // Não pode concatenar saída + saída
  if (singularity1 === "saída" && singularity2 === "saída") return false;
  
  // Indefinida com qualquer coisa é permitido
  return true;
}


/// Determina se duas animações devem ser somadas ou concatenadas
/// 
/// Regras (DEEPKNOWLAGE.md):
/// 1. Se singularidades não permitem concatenação (ex: entrada+entrada) → SOMA pode ser possível
/// 2. Se operador é '+-' → CONCATENAÇÃO forçada
/// 3. Se famílias são diferentes → SOMA
/// 4. Se ambas são Vetorial com subfamílias diferentes → SOMA
/// 5. Caso contrário → CONCATENAÇÃO
export function getOperationType(anim1: string, anim2: string, operator: string = "++"): "soma" | "concatenacao" {
  const meta1 = getAnimationMetadata(anim1);
  const meta2 = getAnimationMetadata(anim2);

  // Se não conseguir metadados, assume concatenação por segurança
  if (!meta1 || !meta2) {
    return "concatenacao";
  }

  // Se operador é '#', sempre SOMA induzida (soma forçada)
  // Nota: A soma induzida é não recomendada, pois os resultados podem ser imprevisíveis
  if (operator === "#") {
    console.warn(`[Vectora] Induzindo SOMA entre [${anim1}] e [${anim2}]`);
    return "soma";
  }

  // Se operador é '+-', sempre concatenação (força concatenação mesmo com diferentes famílias)
  if (operator === "+-") {
    return "concatenacao";
  }

  // Verifica singularidades: se não podem ser concatenadas, força SOMA
  if (!canConcatenate(meta1.singularity, meta2.singularity)) {
    console.log(`[Vectora] Singularidades (${meta1.singularity}, ${meta2.singularity}) impedem concatenação, forçando SOMA`);
    return "soma";
  }

  // Se famílias são diferentes → SOMA
  if (meta1.family !== meta2.family) {
    return "soma";
  }

  // Se ambas são vetoriais, compara subfamília
  if (meta1.family === "vetorial") {
    if (meta1.subfamily !== meta2.subfamily) {
      return "soma"; // subfamílias diferentes → soma
    }
    return "concatenacao"; // subfamílias iguais → concatenação
  }

  // mesma família (não vetorial) → CONCATENAÇÃO
  return "concatenacao";
}
