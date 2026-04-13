import { removeComments, toMs, ensureInlineBlockIfNeeded, parseAnimString,  mapEventName, parseProperties, appendTransition  } from '../../../extras/basics.js';

export const backgroundColor = {
  fadeColor: (el: any, arg: any) => {
    const parts = arg ? arg.split(',').map((p: string) => p.trim()) : [];
    const initialColor = parts[0] || '#000000';
    const finalColor = parts[1] || '#ffffff';
    const duration: number = toMs(parts[2] || '1000ms');

    el.style.backgroundColor = initialColor;

    void el.offsetWidth;

    appendTransition(el, `background-color ${duration}ms ease-in-out`);

    requestAnimationFrame(() => {
      el.style.backgroundColor = finalColor;
    });
  },


  paint: (el: any, arg: any) => {
    // Sintax: paint(direction, finalColor, duration)
    // Ex: paint(left, #ff0000, 1200ms)
    const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
    const direction = (parts[0] || 'left').toLowerCase();
    const finalColor = parts[1] || '#000000';
    const duration: number = toMs(parts[2] || '600ms');

    const computed: string = getComputedStyle(el).backgroundColor || '#000000';
    const initialColor: string = computed;

    ensureInlineBlockIfNeeded(el);

    const prev = {
      color: el.style.backgroundColor || '',
      bg: el.style.backgroundImage || '',
      bgPos: el.style.backgroundPosition || '',
      bgSize: el.style.backgroundSize || '',
      bgClip: el.style.backgroundClip || el.style.webkitBackgroundClip || '',
      webkitTextFill: el.style.webkitTextFillColor || ''
    };

    let gradientDirection = 'to right';
    let startPos = '100% 0%';
    let endPos = '0% 0%';

    if (direction === 'right') {
      gradientDirection = 'to left';
      startPos = '0% 0%';
      endPos = '100% 0%';
    } else if (direction === 'top') {
      gradientDirection = 'to bottom';
      startPos = '0% 100%';
      endPos = '0% 0%';
    } else if (direction === 'bottom') {
      gradientDirection = 'to top';
      startPos = '0% 0%';
      endPos = '0% 100%';
    } 

    el.style.backgroundImage = `linear-gradient(${gradientDirection}, ${finalColor} 0%, ${finalColor} 50%, ${initialColor} 50%, ${initialColor} 100%)`;
    el.style.backgroundRepeat = 'no-repeat';
    el.style.backgroundSize = '200% 200%';
    el.style.backgroundPosition = startPos;
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';

    void el.offsetWidth;

    const easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
    appendTransition(el, `background-position ${duration}ms ${easing}, background-size ${Math.round(duration*0.9)}ms ${easing}`);

    requestAnimationFrame(() => {
      el.style.backgroundPosition = endPos;
      el.style.backgroundSize = '350% 350%';
    });

    setTimeout(() => {
      el.style.backgroundColor = finalColor;

      el.style.backgroundImage = prev.bg;
      el.style.backgroundPosition = prev.bgPos;
      el.style.backgroundSize = prev.bgSize;
      el.style.backgroundClip = prev.bgClip;
      el.style.webkitBackgroundClip = prev.bgClip;
      el.style.webkitTextFillColor = prev.webkitTextFill;

      if (prev.color) {el.style.backgroundColor = prev.color; console.warn('[Vectora] Comando de cor prévia executado');}
    }, duration + 40);
  },


  chameleonCamo: (el: any, arg: any) => {
    // Sintax: chameleonCamo(originalColor, finalColor, duration)
    // Ex: chameleonCamo(#fff, #00aaff, 1500)

    const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
    const originalColor = parts[0] || getComputedStyle(el).color || '#000';
    const finalColor = parts[1] || '#fff';
    const duration: number = toMs(parts[2] || '1200ms');

    ensureInlineBlockIfNeeded(el);

    el.style.background = `radial-gradient(circle at center, ${finalColor} 0%, ${originalColor} 100%)`;
    el.style.backgroundSize = '100% 100%';
    el.style.backgroundPosition = 'center center';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';
    appendTransition(el, `background-size ${duration}ms ease-in-out`);

    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.style.backgroundSize = '850% 850%'; 
    });

    setTimeout(() => {
      el.style.backgroundColor = finalColor;
      el.style.background = '';
      el.style.webkitTextFillColor = '';
    }, duration + 50);
  },


  octopusCamo: (el: any, arg: any) => {
    // Sintax: octopusCamo(originalColor, finalColor, duration)
    // Ex: octopusCamo(#fff, #00aaff, 1500)

    const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
    const originalColor = parts[0] || getComputedStyle(el).color || '#000';
    const finalColor = parts[1] || '#fff';
    const duration = toMs(parts[2] || '1200ms');

    ensureInlineBlockIfNeeded(el);

    // initial state
    el.style.background = `radial-gradient(circle at center, ${originalColor} 0%, ${finalColor} 40%)`;
    el.style.backgroundSize = '750% 750%'; 
    el.style.backgroundPosition = 'center center';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';
    appendTransition(el, `background-size ${duration}ms ease-in-out`);

    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.style.backgroundSize = '100% 100%'; 
    });

    setTimeout(() => {
      el.style.backgroundColor = finalColor;
      el.style.background = '';
      el.style.webkitTextFillColor = '';
    }, duration + 50);
  },


  liquidFill: (el: any, arg: any) => {
    // Sintax: liquidFill(fillColor, duration)
    // Ex: liquidFill(#00aaff, 1800)

    const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
    const fillColor = parts[0] || '#00aaff';
    const duration: number = toMs(parts[1] || '1500ms');

    ensureInlineBlockIfNeeded(el);

    el.style.background = `
        linear-gradient(
        to top,
        ${fillColor} 50%,
        transparent 50%
        )
    `;
    el.style.backgroundSize = '100% 200%';
    el.style.backgroundPosition = '0% 100%';
    el.style.backgroundRepeat = 'no-repeat';

    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';

    appendTransition(el, `
        background-position ${duration}ms ease-in-out
    `);

    // força reflow
    void el.offsetWidth;

    requestAnimationFrame(() => {
        // sobe o "líquido"
        el.style.backgroundPosition = '0% 0%';
    });

    setTimeout(() => {
        // finaliza preenchendo de vez
        el.style.background = '';
        el.style.backgroundColor = fillColor;
        el.style.webkitTextFillColor = '';
    }, duration + 50);
  },


}