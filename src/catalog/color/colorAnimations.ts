import { removeComments, toMs, ensureInlineBlockIfNeeded, parseAnimString,  mapEventName, parseProperties, appendTransition  } from "../../extras/basics.js";

type StyleRecord = Record<string, string>;

function saveStyle(el: HTMLElement, properties: string[]): StyleRecord {
  const saved: StyleRecord = {};
  for (const property of properties) {
    saved[property] = el.style.getPropertyValue(property) || '';
  }
  return saved;
}

function restoreStyle(el: HTMLElement, saved: StyleRecord): void {
  const background = saved['background'] || '';

  for (const property of Object.keys(saved)) {
    if (property === 'background') continue;
    const value = saved[property];
    if (value) {
      el.style.setProperty(property, value);
    } else {
      el.style.removeProperty(property);
    }
  }

  if (background) {
    el.style.setProperty('background', background);
  } else {
    el.style.removeProperty('background');
  }
}

export const colorAnimations = {
  fadeColor: (el: HTMLElement, arg: any) => {
  // Sintax: fadeColor(initialColor, finalColor, duration)
  // Exemplo: fadeColor(#ff0000, #00ff00, 1.5s)
  return new Promise<void>(resolve => {
    const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
    const initialColor = parts[0] || '#000000';
    const finalColor = parts[1] || '#ffffff';
    const duration = toMs(parts[2] || '1000ms');

    el.style.color = initialColor;

    void el.offsetWidth;

    appendTransition(el, `color ${duration}ms ease-in-out`);

    requestAnimationFrame(() => {
      el.style.color = finalColor;
    });

    let finished = false;
    let timeoutId: number | undefined;

    const finish = () => {
      if (finished) return;
      finished = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      el.removeEventListener('transitionend', onEnd as EventListener);
      resolve();
    };

    const onEnd = (e?: TransitionEvent) => {
      if (!e || e.propertyName === 'color') {
        finish();
      }
    };

    el.addEventListener('transitionend', onEnd as EventListener);
    timeoutId = window.setTimeout(finish, duration + 50);
  });
 },


  paint: (el: HTMLElement, arg: any) => {
    // Sintax: paint(direction, finalColor, duration)
    // Ex: paint(left, #ff0000, 1200ms)
    const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
    const direction = (parts[0] || 'left').toLowerCase();
    const finalColor = parts[1] || '#000000';
    const duration = toMs(parts[2] || '600ms');

    const computed = getComputedStyle(el).color || '#000000';
    const initialColor = computed;

    const prev = saveStyle(el, [
      'display',
      'color',
      'background',
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      'background-clip',
      '-webkit-background-clip',
      '-webkit-text-fill-color'
    ]);

    ensureInlineBlockIfNeeded(el);
    void el.offsetWidth;

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
    appendTransition(el, `background-position ${duration}ms ${easing}, background-size ${Math.round(duration * 0.9)}ms ${easing}`);

    return new Promise<void>(resolve => {
      let finished = false;
      let timeoutId: number | undefined;

      const finish = () => {
        if (finished) return;
        finished = true;
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        el.removeEventListener('transitionend', onEnd as EventListener);

        restoreStyle(el, prev);
        if (!prev.color) {
          el.style.setProperty('color', finalColor);
        }

        resolve();
      };

      const onEnd = (e?: TransitionEvent) => {
        if (!e || e.propertyName === 'background-position' || e.propertyName === 'background-size') {
          finish();
        }
      };

      el.addEventListener('transitionend', onEnd as EventListener);
      requestAnimationFrame(() => {
        el.style.backgroundPosition = endPos;
        el.style.backgroundSize = '350% 350%';
      });

      timeoutId = window.setTimeout(finish, duration + 80);
    });
  },


  chameleonCamo: (el: HTMLElement, arg: any) => {
    // Sintax: chameleonCamo(originalColor, finalColor, duration)
    // Ex: chameleonCamo(#fff, #00aaff, 1500)

    const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
    const originalColor = parts[0] || getComputedStyle(el).color || '#000';
    const finalColor = parts[1] || '#fff';
    const duration = toMs(parts[2] || '1200ms');

    const prev = saveStyle(el, [
      'display',
      'color',
      'background',
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      'background-clip',
      '-webkit-background-clip',
      '-webkit-text-fill-color'
    ]);

    ensureInlineBlockIfNeeded(el);
    void el.offsetWidth;

    el.style.background = `radial-gradient(circle at center, ${finalColor} 0%, ${originalColor} 100%)`;
    el.style.backgroundSize = '100% 100%';
    el.style.backgroundPosition = 'center center';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';
    appendTransition(el, `background-size ${duration}ms ease-in-out`);

    return new Promise<void>(resolve => {
      let finished = false;
      let timeoutId: number | undefined;

      const finish = () => {
        if (finished) return;
        finished = true;
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        el.removeEventListener('transitionend', onEnd as EventListener);

        restoreStyle(el, prev);
        el.style.setProperty('color', finalColor);
        resolve();
      };

      const onEnd = (e?: TransitionEvent) => {
        if (!e || e.propertyName === 'background-size') {
          finish();
        }
      };

      el.addEventListener('transitionend', onEnd as EventListener);
      requestAnimationFrame(() => {
        el.style.backgroundSize = '850% 850%';
      });
      timeoutId = window.setTimeout(finish, duration + 80);
    });
  },


  octopusCamo: (el: HTMLElement, arg: any) => {
    // Sintax: octopusCamo(originalColor, finalColor, duration)
    // Ex: octopusCamo(#fff, #00aaff, 1500)

    const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
    const originalColor = parts[0] || getComputedStyle(el).color || '#000';
    const finalColor = parts[1] || '#fff';
    const duration = toMs(parts[2] || '1200ms');

    const prev = saveStyle(el, [
      'display',
      'color',
      'background',
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      'background-clip',
      '-webkit-background-clip',
      '-webkit-text-fill-color'
    ]);

    ensureInlineBlockIfNeeded(el);
    void el.offsetWidth;

    el.style.background = `radial-gradient(circle at center, ${originalColor} 0%, ${finalColor} 40%)`;
    el.style.backgroundSize = '750% 750%';
    el.style.backgroundPosition = 'center center';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.webkitBackgroundClip = 'text';
    el.style.backgroundClip = 'text';
    el.style.webkitTextFillColor = 'transparent';
    appendTransition(el, `background-size ${duration}ms ease-in-out`);

    return new Promise<void>(resolve => {
      let finished = false;
      let timeoutId: number | undefined;

      const finish = () => {
        if (finished) return;
        finished = true;
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        el.removeEventListener('transitionend', onEnd as EventListener);

        restoreStyle(el, prev);
        el.style.setProperty('color', finalColor);
        resolve();
      };

      const onEnd = (e?: TransitionEvent) => {
        if (!e || e.propertyName === 'background-size') {
          finish();
        }
      };

      el.addEventListener('transitionend', onEnd as EventListener);
      requestAnimationFrame(() => {
        el.style.backgroundSize = '100% 100%';
      });
      timeoutId = window.setTimeout(finish, duration + 80);
    });
  },


  liquidFill: (el: HTMLElement, arg: any) => {
  // Sintax: liquidFill(fillColor, duration)
  // Ex: liquidFill(#00aaff, 1800)
    const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
    const fillColor = parts[0] || '#00aaff';
    const duration = toMs(parts[1] || '600ms');

    const prev = saveStyle(el, [
      'display',
      'color',
      'background',
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      'background-clip',
      '-webkit-background-clip',
      '-webkit-text-fill-color'
    ]);

    ensureInlineBlockIfNeeded(el);
    void el.offsetWidth;

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

    appendTransition(el, `background-position ${duration}ms ease-in-out`);

    void el.offsetWidth;

    return new Promise<void>(resolve => {
      let finished = false;
      let timeoutId: number | undefined;

      const finish = () => {
        if (finished) return;
        finished = true;
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        el.removeEventListener('transitionend', onEnd as EventListener);

        restoreStyle(el, prev);
        el.style.setProperty('color', fillColor);
        resolve();
      };

      const onEnd = (e?: TransitionEvent) => {
        if (!e || e.propertyName === 'background-position') {
          finish();
        }
      };

      el.addEventListener('transitionend', onEnd as EventListener);
      requestAnimationFrame(() => {
        el.style.backgroundPosition = '0% 0%';
      });
      timeoutId = window.setTimeout(finish, duration + 80);
    });
  },
  
}