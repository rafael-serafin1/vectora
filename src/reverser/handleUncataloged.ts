import { appendTransition, ensureInlineBlockIfNeeded, parseAnimString, toMs } from "../extras/basics.js";
import { getAnimationMetadata, TransformVector } from "../filter/animationMetadata.js";
import { filterAnim } from "../filter/filterAnim.js";

function buildReverseTransform(vector: TransformVector): string | null {
  const transforms: string[] = [];

  if (vector.translateX !== undefined || vector.translateY !== undefined || vector.translateZ !== undefined) {
    const x = vector.translateX ?? 0;
    const y = vector.translateY ?? 0;
    const z = vector.translateZ ?? 0;

    if (z !== 0) transforms.push(`translate3d(${-x}px, ${-y}px, ${-z}px)`);
    else transforms.push(`translate(${-x}px, ${-y}px)`);
    
  }

  if (vector.rotateX !== undefined) transforms.push(`rotateX(${-vector.rotateX}deg)`);
  if (vector.rotateY !== undefined) transforms.push(`rotateY(${-vector.rotateY}deg)`);
  if (vector.rotateZ !== undefined) transforms.push(`rotate(${-vector.rotateZ}deg)`);

  if (vector.scaleX !== undefined || vector.scaleY !== undefined || vector.scaleZ !== undefined) {
    const sx = vector.scaleX !== undefined && vector.scaleX !== 0 ? 1 / vector.scaleX : 1;
    const sy = vector.scaleY !== undefined && vector.scaleY !== 0 ? 1 / vector.scaleY : 1;
    const sz = vector.scaleZ !== undefined && vector.scaleZ !== 0 ? 1 / vector.scaleZ : 1;

    if (vector.scaleZ !== undefined) transforms.push(`scale3d(${sx}, ${sy}, ${sz})`);
    else transforms.push(`scale(${sx}, ${sy})`);
  }

  return transforms.length ? transforms.join(" ") : null;
}

function createReverseAnimation(animationName: string, property: string, args: string | null): Function {
  const { fn } = filterAnim(animationName);

  switch (property) {
    case "color":
    case "background.color":
      // Para color e background.color, inverter initial e final color
      if (animationName === "fadeColor") {
        const parts = args ? args.split(',').map(p => p.trim()) : [];
        const initialColor = parts[0] || '#000000';
        const finalColor = parts[1] || '#ffffff';
        const duration = parts[2] || '600ms';
        const reversedArgs = `${finalColor}, ${initialColor}, ${duration}`;
        return async (el: HTMLElement) => fn(el, reversedArgs);
      }
      // Outras color animations podem ser adicionadas
      return async (el: HTMLElement) => fn(el, args || ''); // Fallback

    case "radius":
      // Para radius, inverter o valor (de roundNumber para 0)
      if (animationName === "round") {
        const parts = args ? args.split(',').map(p => p.trim()) : [];
        const roundNumber = parseFloat(parts[0] || '10');
        const duration = parts[1] || '600ms';
        return async (el: HTMLElement) => {
          return new Promise<void>(resolve => {
            ensureInlineBlockIfNeeded(el);
            void el.offsetWidth;

            el.style.borderRadius = `${roundNumber}px`;

            appendTransition(el, `border-radius ${toMs(duration)}ms ease-in-out`);

            requestAnimationFrame(() => {
              el.style.borderRadius = '0px';
            });

            const onEnd = () => {
              el.removeEventListener('transitionend', onEnd);
              resolve();
            };
            el.addEventListener('transitionend', onEnd);

            setTimeout(() => {
              el.removeEventListener('transitionend', onEnd);
              resolve();
            }, toMs(duration) + 50);
          });
        };
      }
      return async (el: HTMLElement) => fn(el, args || ''); // Fallback

    case "gap":
      // Para gap, inverter o gap final para inicial
      if (animationName === "bloom") {
        const parts = args ? args.split(',').map(p => p.trim()) : [];
        const finalGap = parseFloat(parts[0] || '5');
        const duration = parts[1] || '600ms';
        return async (el: HTMLElement) => {
          return new Promise<void>(resolve => {
            ensureInlineBlockIfNeeded(el);
            void el.offsetWidth;

            el.style.gap = `${finalGap}px`;

            appendTransition(el, `gap ${toMs(duration)}ms ease`);

            requestAnimationFrame(() => {
              el.style.gap = '0px';
            });

            const onEnd = () => {
              el.removeEventListener('transitionend', onEnd);
              resolve();
            };
            el.addEventListener('transitionend', onEnd);

            setTimeout(() => {
              el.removeEventListener('transitionend', onEnd);
              resolve();
            }, toMs(duration) + 50);
          });
        };
      }
      return async (el: HTMLElement) => fn(el, args || ''); // Fallback

    case "weight":
      // Para weight, inverter skinny e heavy
      if (animationName === "skinny") {
        // skinny divide, então inverso multiplica
        const parts = args ? args.split(',').map(p => p.trim()) : [];
        const intensity = parseFloat(parts[0] || '2');
        const duration = parts[1] || '600ms';
        return async (el: HTMLElement) => {
          return new Promise<void>(resolve => {
            ensureInlineBlockIfNeeded(el);
            void el.offsetWidth;

            appendTransition(el, `font-weight ${toMs(duration)}ms ease`);
            
            requestAnimationFrame(() => {
              el.style.fontWeight = `${intensity * 10}`;
            });

            const onEnd = () => {
              el.removeEventListener('transitionend', onEnd);
              resolve();
            };
            el.addEventListener('transitionend', onEnd);

            setTimeout(() => {
              el.removeEventListener('transitionend', onEnd);
              resolve();
            }, toMs(duration) + 50);
          });
        };
      }
      if (animationName === "heavy") {
        // heavy multiplica, então inverso divide
        const parts = args ? args.split(',').map(p => p.trim()) : [];
        const intensity = parseFloat(parts[0] || '2');
        const duration = parts[1] || '600ms';
        return async (el: HTMLElement) => {
          return new Promise<void>(resolve => {
            ensureInlineBlockIfNeeded(el);
            void el.offsetWidth;

            appendTransition(el, `font-weight ${toMs(duration)}ms ease`);
            
            requestAnimationFrame(() => {
              el.style.fontWeight = `${intensity / 2}`;
            });

            const onEnd = () => {
              el.removeEventListener('transitionend', onEnd);
              resolve();
            };
            el.addEventListener('transitionend', onEnd);

            setTimeout(() => {
              el.removeEventListener('transitionend', onEnd);
              resolve();
            }, toMs(duration) + 50);
          });
        };
      }
      return async (el: HTMLElement) => fn(el, args || ''); // Fallback

    // Adicionar mais propriedades conforme necessário

    default:
      // Para vetoriais ou outros, usar lógica original
      return async (el: HTMLElement) => fn(el, args || '');
  }
}

export function handleUncataloged(anim: string): Function {
  const value = anim.split("~")[1] ?? "";

  if (!value) {
    console.error(`[Vectora] Sem valor próprio para parâmetro ---> ${anim}`);
    return async () => {};
  }

  const { name: animationName, arg } = parseAnimString(value);
  const metadata = getAnimationMetadata(animationName);

  if (!metadata) {
    console.error(`[Vectora] Inverso de animação não foi catalogado e não possui metadados ---> ${animationName}`);
    return async () => {};
  }

  // Se é vetorial, usar lógica de transformação
  if (metadata.family === "vetorial") {
    const duration = toMs(arg);
    return async (el: HTMLElement, args: any) => {
      return new Promise<void>(resolve => {
        ensureInlineBlockIfNeeded(el);

        const transitions: string[] = [];
        const reverseTransform = buildReverseTransform(metadata.vector);
        const reverseOpacity = metadata.vector.opacity !== undefined ? metadata.vector.opacity.toString() : null;

        if (reverseTransform) transitions.push(`transform ${duration}ms ease`);
        if (reverseOpacity !== null) transitions.push(`opacity ${duration}ms ease`);

        if (transitions.length > 0) {
          appendTransition(el, transitions.join(", "));
        }

        const finish = () => {
          el.removeEventListener("transitionend", onTransitionEnd);
          resolve();
        };

        const onTransitionEnd = () => {
          finish();
        };

        if (transitions.length > 0) el.addEventListener("transitionend", onTransitionEnd);

        requestAnimationFrame(() => {
          if (reverseTransform) el.style.transform = reverseTransform;
          if (reverseOpacity !== null) el.style.opacity = reverseOpacity;
          if (transitions.length === 0) resolve();
        });

        setTimeout(() => {
          if (transitions.length > 0) {
            finish();
          }
        }, duration + 100);
      });
    };
  } else {
    // Para não vetoriais, usar lógica específica por propriedade
    const metadataProperty = Array.isArray(metadata.property)
      ? metadata.property[0] ?? "color"
      : metadata.property;
    return createReverseAnimation(animationName, metadataProperty, arg);
  }
}
