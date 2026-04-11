import { removeComments, toMs, ensureInlineBlockIfNeeded, parseAnimString,  mapEventName, parseProperties, appendTransition  } from '../../extras/basics.js';

export const textAnimations = {
  land: (el: any, arg: any) => {
    return new Promise<void>(resolve => {
      const duration: number = toMs(arg) || 600;
  
      ensureInlineBlockIfNeeded(el);
      
      el.style.transform = 'translateY(-30px)';
      el.style.opacity = '0';
      
      appendTransition(el, `transform ${duration}ms ease`);
  
      void el.offsetWidth;
  
      appendTransition(el,`transform ${duration}ms ease, opacity ${duration}ms ease`);

      const onEnd = () => {
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      el.addEventListener('transitionend', onEnd);
  
      requestAnimationFrame(() => {
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      });
    })
  },


  rise: (el: any, arg: any) => {
    return new Promise<void>(resolve => {
      const duration = toMs(arg) || 600;

      ensureInlineBlockIfNeeded(el);

      el.style.transform = 'translateY(30px)';
      el.style.opacity = '0';

      void el.offsetWidth;

      appendTransition(el, `transform ${duration}ms ease, opacity ${duration}ms ease`);

      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };

      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName === 'opacity') {
          finish();
        }
      };

      el.addEventListener('transitionend', onEnd);

      // Fallback de segurança
      setTimeout(finish, duration + 50);

      requestAnimationFrame(() => {
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      });
    });
  },

  fadeIn: (el: any, arg: any) => {
    return new Promise<void>(resolve => {  
      const duration = toMs(arg) || 600;
    // simple fade
      el.style.opacity = '0';
      void el.offsetWidth;
      appendTransition(el, `opacity ${duration}ms ease`);

      const onEnd = () => {
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      el.addEventListener('transitionend', onEnd);

      requestAnimationFrame(() => (el.style.opacity = '1'));
    })
  },


  fadeOut: (el: any, arg: any) => {
    return new Promise<void>(resolve => {
      const duration: number = toMs(arg) || 600;
    // simple fade
      el.style.opacity = '1';
      void el.offsetWidth;
      appendTransition(el, `opacity ${duration}ms ease`);

      const onEnd = () => {
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };
      el.addEventListener('transitionend', onEnd);

      requestAnimationFrame(() => (el.style.opacity = '0'));
    })
  },


  slideIn: (el: any, arg: any) => {
    return new Promise<void>(resolve => {
      const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
      const direction = parts[0] || 'left';
      const distance = parts[1] || '30px';
      const duration = toMs(parts[2] || '600ms');

      ensureInlineBlockIfNeeded(el);

      const startTransform = direction === 'right' ? `translateX(${distance})` : `translateX(-${distance})`;

      el.style.opacity = '0';
      el.style.transform = startTransform;

      void el.offsetWidth;

      appendTransition(el, `transform ${duration}ms ease, opacity ${duration}ms ease`);

      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };

      const onEnd = (e: TransitionEvent) => {
        if (e.propertyName === 'opacity') finish();
      };

      el.addEventListener('transitionend', onEnd);

      // Fallback de segurança
      setTimeout(finish, duration + 50);

      requestAnimationFrame(() => {
        el.style.transform = 'translateX(0)';
        el.style.opacity = '1';
      });
    });
  },


  slideOut: (el: any, arg: any) => {
    return new Promise<void>(resolve => {
      const parts = arg ? arg.split(',').map((p: any) => p.trim()) : [];
      const direction = parts[0] || 'left';
      const distance = parts[1] || '30px';
      const duration = toMs(parts[2] || '600ms');

      ensureInlineBlockIfNeeded(el);

      let endTransform = direction === 'left' ? `translateX(${distance})` : `translateX(-${distance})`;

      appendTransition(el, `transform ${duration}ms ease, opacity ${duration}ms ease`);

      const onEnd = () => {
        el.removeEventListener('transitionend', onEnd);
        resolve();
      };

      el.addEventListener('transitionend', onEnd);

      requestAnimationFrame(() => {
        el.style.transform = endTransform;
        el.style.opacity = '0';
      });
    });
  },


  pop: (el: any, arg: any) => {
    return new Promise<void>(resolve => {
    // Sintax: pop(scale, duration)
    // Exemplo: pop(1.2, 300)
      const parts: any = arg ? arg.split(',').map((p: any) => p.trim()) : [];
      const scale: number = parseFloat(parts[0]) || 1.2;
      const duration: number = toMs(parts[1] || '300ms');

      ensureInlineBlockIfNeeded(el);

      
      el.style.transform = `scale(${scale / 0.7691})`;
      el.style.opacity = '0';

      void el.offsetWidth;

      appendTransition(el,`transform ${duration}ms cubic-bezier(0.25, 1.25, 0.5, 1), opacity ${duration}ms ease`);

      const onEnd = () => {
          el.removeEventListener('transitionend', onEnd);
          resolve();
        };
      el.addEventListener('transitionend', onEnd);

      requestAnimationFrame(() => {
        el.style.transform = `scale(${scale})`;
        el.style.opacity = '1';
      });

      setTimeout(() => {
        appendTransition(el,`transform ${duration * 0.8}ms ease-out`);
        el.style.transform = 'scale(1)';
      }, duration);
    })
  },


  implode: (el: any, arg: any) => {
    return new Promise<void>(resolve => {
      // Sintax: implode(scale, duration)
      // Exemplo: implode(1.2, 300)
      const parts: any = arg ? arg.split(',').map((p: any) => p.trim()) : [];
      const scale: number = parseFloat(parts[0]) || 1.2;
      const duration: number = toMs(parts[1] || '300ms');

      ensureInlineBlockIfNeeded(el);

      
      el.style.transform = `scale(${scale / 7})`;
      el.style.opacity = '0';

      void el.offsetWidth;

      appendTransition(el,`transform ${duration}ms cubic-bezier(0.25, 1.25, 0.5, 1), opacity ${duration}ms ease`);

      const onEnd = () => {
          el.removeEventListener('transitionend', onEnd);
          resolve();
        };
      el.addEventListener('transitionend', onEnd);

      requestAnimationFrame(() => {
        el.style.transform = `scale(${scale % 0.65})`;
        el.style.opacity = '1';
      });

      setTimeout(() => {
        appendTransition(el,`transform ${duration * 0.8}ms ease-out`);
        el.style.transform = 'scale(1)';
      }, duration);
    })
  },


  shake: (el: any, arg: any) => {
    return new Promise<void>(resolve => {
      // Sintaxe: shake(direction, intensity, duration)
      // Exemplo: shake('sideways', 10px, 600ms)

      const parts: any = arg ? arg.split(',').map((p: any) => p.trim()) : [];
      const direction: any = (parts[0] || 'seesaw').toLowerCase();
      const intensity: any = parts[1] || '10px';
      const duration: number = toMs(parts[2] || '600ms');
      
      ensureInlineBlockIfNeeded(el);
      el.style.transformOrigin = "center center";
      
      void el.offsetWidth;

      // Define o eixo e o padrão de movimento
      let keyframes: string[];
      switch (direction) {
        case 'seesaw':
          keyframes = [
            'rotate(0deg)',
            'rotate(3deg)',
            'rotate(-3deg)',
            'rotate(2deg)',
            'rotate(-2deg)',
            'rotate(1deg)',
            'rotate(0deg)'
          ];
          break;

        case 'cocktail-shaker':
          keyframes = [
            'translateY(0)',
            `translateY(-${intensity})`,
            `translateY(-${intensity*0.75})`,
            `translateY(-${intensity*0.5})`,
            `translateY(-${intensity*0.25})`,
            `translateY(-${intensity*0.125})`,
            `translateY(-${intensity*0.65})`,
            `translateY(${intensity*1.20})`,
            `translateY(${intensity})`,
            `translateY(${intensity*0.75})`,
            `translateY(${intensity*0.5})`,
            `translateY(${intensity*0.25})`,
            `translateY(${intensity*0.125})`,
            `translateY(${intensity*0.45})`,
            `translateY(-${intensity*1.15})`,
            `translateY(-${intensity})`,
            `translateY(-${intensity*0.75})`,
            `translateY(-${intensity*0.5})`,
            `translateY(-${intensity*0.25})`,
            `translateY(-${intensity*0.125})`,
            `translateY(${intensity*1.10})`,
            `translateY(${intensity})`,
            `translateY(${intensity*0.75})`,
            `translateY(${intensity*0.5})`,
            `translateY(${intensity*0.25})`,
            `translateY(${intensity*0.125})`,
            'translateY(0)'
          ];
          break;

        case 'sideways':
        default:
          keyframes = [
            'translateX(0)',
            `translateX(-${intensity})`,
            `translateX(-${intensity*0.95})`,
            `translateX(-${intensity*0.75})`,
            `translateX(-${intensity*0.5})`,
            `translateX(-${intensity*0.25})`,
            `translateX(-${intensity*0.125})`,
            `translateX(${intensity})`,
            `translateX(${intensity*0.95})`,
            `translateX(${intensity*0.75})`,
            `translateX(${intensity*0.5})`,
            `translateX(${intensity*0.25})`,
            `translateX(${intensity*0.125})`,
            `translateX(-${intensity})`,
            `translateX(-${intensity*0.95})`,
            `translateX(-${intensity*0.75})`,
            `translateX(-${intensity*0.5})`,
            `translateX(-${intensity*0.25})`,
            `translateX(-${intensity*0.125})`,
            `translateX(${intensity})`,
            `translateX(${intensity*0.95})`,
            `translateX(${intensity*0.75})`,
            `translateX(${intensity*0.5})`,
            `translateX(${intensity*0.25})`,
            `translateX(${intensity*0.125})`,
            'translateX(0)'
          ];
      }

      // Divide o tempo total pelos frames
      const frameCount: number = keyframes.length - 1;
      const frameDuration: number = duration / frameCount;

      const onEnd = () => {
            el.removeEventListener('transitionend', onEnd);
            resolve();
        };
      el.addEventListener('transitionend', onEnd);

      // Executa a sequência com requestAnimationFrame
      let frame: number = 0;
      const applyFrame = () => {
        el.style.transform = keyframes[frame];
        frame++;
        if (frame < keyframes.length) {
          setTimeout(() => requestAnimationFrame(applyFrame), frameDuration);
        } else {
          resolve();
        }
      };

      applyFrame();
    })
  },


  shiver: (el: any, arg: any) => {
    return new Promise<void>(resolve => {
      // Sintax: shiver(intensity, duration)
      // Example: shiver(2px, 600)

      const parts: any = arg ? arg.split(',').map((p: any) => p.trim()) : [];
      const intensity: any = parts[0] || '2px';
      const duration: number = toMs(parts[1] || '600ms');

      ensureInlineBlockIfNeeded(el);

      const keyframes: string = `
        @keyframes shiverEffect {
          0% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(${intensity}, -${intensity}) rotate(-1deg); }
          20% { transform: translate(-${intensity}, ${intensity}) rotate(1deg); }
          30% { transform: translate(${intensity}, ${intensity}) rotate(1deg); }
          40% { transform: translate(-${intensity}, -${intensity}) rotate(-1deg); }
          50% { transform: translate(${intensity}, -${intensity}); }
          60% { transform: translate(-${intensity}, ${intensity}); }
          70% { transform: translate(${intensity}, ${intensity}); }
          80% { transform: translate(-${intensity}, -${intensity}); }
          90% { transform: translate(${intensity}, -${intensity}); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
      `;

      const styleTag: HTMLStyleElement = document.createElement('style');
      styleTag.textContent = keyframes;
      document.head.appendChild(styleTag);

      el.style.animation = `shiverEffect ${duration}ms ease-in-out`;

      const onEnd = () => {
            el.removeEventListener('transitionend', onEnd);
            resolve();
          };
        el.addEventListener('transitionend', onEnd);

      setTimeout(() => {
        el.style.animation = '';
        styleTag.remove();
      }, duration + 50);
    })
  },


  spin: (el: any, arg: any) => {
    return new Promise<void>(resolve => {
      const parts: any = arg ? arg.split(',').map((p: any) => p.trim()) : [];
      const way: any = parts[0] || 'clockwise';
      const degrees: number = parseFloat(parts[1]) || 360;
      let duration: any = parts[2] || '600ms';

      duration = toMs(duration);

      ensureInlineBlockIfNeeded(el);

      const animationName = `rotateAnimation_${Date.now()}`;
      const finalRotation = way === 'counter-clock' ? -degrees : degrees;
      
      const keyframesCSS = `
        @keyframes ${animationName} {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(${finalRotation}deg); }
        }
      `;

      const styleTag: HTMLStyleElement = document.createElement('style');
      styleTag.textContent = keyframesCSS;
      document.head.appendChild(styleTag);

      el.style.animation = `${animationName} ${duration}ms ease-in-out forwards`;

      const onEnd = () => {
            el.removeEventListener('transitionend', onEnd);
            resolve();
          };
      el.addEventListener('transitionend', onEnd);

      // Fallback: if animationend doesn't fire for some reason, cleanup after a bit
      setTimeout(() => {
        if (document.body.contains(styleTag)) {
          el.style.transform = `rotate(${finalRotation}deg)`;
          el.style.animation = '';
          styleTag.remove();
        }
      }, duration + 250);
    })
  }

}

export type AnimationName = keyof typeof textAnimations;