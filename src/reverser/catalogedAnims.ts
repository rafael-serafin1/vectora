import { appendTransition, ensureInlineBlockIfNeeded, toMs } from "../extras/basics.js";
import { textAnimations } from "../catalog/text/textAnimations.js";
import { colorAnimations } from "../catalog/color/colorAnimations.js";
import { transformAnimations } from "../catalog/transform/transform.js";
import { handleUncataloged } from "./handleUncataloged.js";
import { ArrowFunction } from "typescript";

/// cadeia de funções com as animações
const fadeOut = textAnimations.fadeOut;
const fadeIn = textAnimations.fadeIn;
const slideIn = textAnimations.slideIn; 
const slideOut = textAnimations.slideOut;
const pop = textAnimations.pop;
const implode = textAnimations.implode;
const octopus = colorAnimations.octopusCamo;
const chameleon = colorAnimations.chameleonCamo;
const zoomIn = transformAnimations.zoomIn;
const zoomOut = transformAnimations.zoomOut;

/// função de reversão de animações catalogadas
export function reverseAnimation(anim: string): Function {
    // retira o operador '~'
    anim = anim.split('~')[1] ?? '';

    // tratamento em caso de falta de conteúdo
    if (!anim || anim === '') {
        console.error(`[Vectora] Sem valor próprio para parâmetro ---> ${anim}`);
        return () => {};
    }

    // cadeia de ifs para animações catalogadas
    if (anim == 'land') return reverseCatalog.fall;
    if (anim == 'rise') return reverseCatalog.hook;
    if (anim == 'fadeIn') return fadeOut;
    if (anim == 'fadeOut') return fadeIn;
    if (anim == 'slideIn') return slideOut;
    if (anim == 'slideOut') return slideIn;
    if (anim == 'pop') return implode;
    if (anim == 'implode') return pop;
    if (anim == 'octopusCamo') return chameleon;
    if (anim == 'chameleonCamo') return octopus;
    if (anim == 'zoomOut') return zoomIn;
    if (anim == 'zoomIn') return zoomOut;

    console.warn(`[Vectora] Inverso de animação não foi catalogado ---> ${anim}, usando fallback genérico.`);
    return handleUncataloged(`~${anim}`);
}


const reverseCatalog = {
    fall: (el: HTMLElement, args: any) => {
        return new Promise<void>(resolve => {
            const duration: number = toMs(args) || 600;

            ensureInlineBlockIfNeeded(el);

            el.style.transform = `translateY(0px)`;
            el.style.opacity = '1';
            void el.offsetWidth;

            appendTransition(el, `transform ${duration}ms ease, opacity ${duration}ms ease`);

            const onEnd = () => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            };
            el.addEventListener('transitionend', onEnd);

            requestAnimationFrame(() => {
                el.style.transform = 'translateY(30px)';
                el.style.opacity = '0';
            });
        });
    },
    hook: (el: HTMLElement, args: any) => {
        return new Promise<void>(resolve => {
            const duration = toMs(args) || 600;
            ensureInlineBlockIfNeeded(el);

            el.style.transform = `translateY(0px)`;
            el.style.opacity = `1`;
            void el.offsetWidth;

            appendTransition(el, `transform ${duration}ms ease, opacity ${duration}ms ease`);

            const onEnd = () => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            };
            el.addEventListener('transitionend', onEnd);

            requestAnimationFrame(() => {
                el.style.transform = `translateY(-30px)`;
                el.style.opacity = '0';
            });
        });
    },
}