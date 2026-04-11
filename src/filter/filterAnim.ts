import { textAnimations } from "../catalog/text/textAnimations.js";
import { colorAnimations } from "../catalog/color/colorAnimations.js";
import { transformAnimations } from "../catalog/transform/transform.js";
import { gapAnimations } from "../catalog/gap/gapAnimations.js";
import { radiusAnimations } from "../catalog/radius/radiusAnimations.js";
import { shadowAnimations } from "../catalog/shadow/shadowAnimations.js";
import { backgroundColor } from "../catalog/background/color/backgroundColor.js";
import { soundAnimations } from "../catalog/sound/soundAnimations.js";
import { getAnimationMetadata, AnimationMetadata } from "./animationMetadata.js";
import { brightness } from "../catalog/brightness/brightnessAnimations.js";

export interface AnimationResult {
  fn: (el: HTMLElement, args: string) => Promise<void>;
  metadata: AnimationMetadata | null;
}

// Retorna o objeto de animações que contém `animName`.
// Ordem de checagem: color -> text -> fallback (text)
function filterAnimObject(animName: string) {
  if (animName in textAnimations) return textAnimations as any;
  if (animName in colorAnimations) return colorAnimations as any;
  if (animName in transformAnimations) return transformAnimations as any;
  if (animName in gapAnimations) return gapAnimations as any;
  if (animName in radiusAnimations) return radiusAnimations as any;
  if (animName in brightness) return brightness as any;
  if (animName in shadowAnimations) return shadowAnimations as any;
  if (animName in backgroundColor) return backgroundColor as any;
  if (animName in soundAnimations) return soundAnimations as any;
  return textAnimations as any;
}

/**
 * Retorna a função de animação e seus metadados
 * @param animName Nome da animação
 * @returns Objeto com função de animação e metadados
 */
export function filterAnim(animName: string): AnimationResult {
  const animObject = filterAnimObject(animName);
  const animFn = animObject[animName];
  const metadata = getAnimationMetadata(animName);
  
  return {
    fn: animFn,
    metadata: metadata
  };
}