import { removeComments, toMs, ensureInlineBlockIfNeeded, parseAnimString,  mapEventName, parseProperties, appendTransition  } from '../../extras/basics.js';

const e: number = 2.71828;

export const brightness = {
    halo: (el: any, args: any) => {
        return new Promise<void>(resolve => {
            const parts: any = args ? args.split(',').map((p: any) => p.trim()) : [];
            const intensity: any = parseFloat(parts[0] || '5');
            const color: any = parts[1] || '#fff';
            const duration: number = toMs(parts[2] || '600');

            ensureInlineBlockIfNeeded(el);
            void el.offsetWidth;

            appendTransition(el, `filter ${duration}ms ease, text-shadow ${duration}ms ease`);

            const onEnd = () => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            };
            el.addEventListener('transitionend', onEnd);

            requestAnimationFrame(() => {
                el.style.filter = `brightness(${intensity / e})`;
                el.style.textShadow = `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}`;
            });

            setTimeout(() => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            }, duration + 50);
        });
    },

    fadeLight: (el: any, args: any) => {
        return new Promise<void>(resolve => {
            const parts: any = args ? args.split(',').map((p: any) => p.trim()) : [];
            const originalIntensity: any = parseFloat(parts[0] || '1');
            const duration: number = toMs(parts[1] || '600');

            ensureInlineBlockIfNeeded(el);
            void el.offsetWidth;

            appendTransition(el, `filter ${duration}ms ease, text-shadow ${duration}ms ease`);

            const onEnd = () => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            };
            el.addEventListener('transitionend', onEnd);

            requestAnimationFrame(() => {
                el.style.filter = `brightness(${originalIntensity})`;
                el.style.textShadow = 'none';
            });

            setTimeout(() => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            }, duration + 50);
        });
    },

    neon: (el: any, args: any) => {
        return new Promise<void>(resolve => {
            const parts: any = args ? args.split(',').map((p: any) => p.trim()) : [];
            const color: any = parts[0] || '#00ff00';
            const direction: any = parts[1] || 'all';
            const intensity: any = parseFloat(parts[2] || '10');

            ensureInlineBlockIfNeeded(el);
            void el.offsetWidth;

            let shadowOffsets = '';
            switch (direction.toLowerCase()) {
                case 'top':
                    shadowOffsets = `0 -${intensity}px ${intensity}px ${color}`;
                    break;
                case 'bottom':
                    shadowOffsets = `0 ${intensity}px ${intensity}px ${color}`;
                    break;
                case 'left':
                    shadowOffsets = `-${intensity}px 0 ${intensity}px ${color}`;
                    break;
                case 'right':
                    shadowOffsets = `${intensity}px 0 ${intensity}px ${color}`;
                    break;
                case 'all':
                default:
                    shadowOffsets = `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}`;
                    break;
            }

            appendTransition(el, `text-shadow 600ms ease`);

            const onEnd = () => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            };
            el.addEventListener('transitionend', onEnd);

            requestAnimationFrame(() => {
                el.style.textShadow = shadowOffsets;
            });

            setTimeout(() => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            }, 650);
        });
    },

    pillar: (el: any, args: any) => {
        return new Promise<void>(resolve => {
            const parts: any = args ? args.split(',').map((p: any) => p.trim()) : [];
            const color: any = parts[0] || '#ffffff';
            const intensity: any = parseFloat(parts[1] || '20');

            ensureInlineBlockIfNeeded(el);
            void el.offsetWidth;

            appendTransition(el, `box-shadow 600ms ease`);

            const onEnd = () => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            };
            el.addEventListener('transitionend', onEnd);

            requestAnimationFrame(() => {
                el.style.boxShadow = `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}, 0 0 ${intensity * 3}px ${color}`;
            });

            setTimeout(() => {
                el.removeEventListener('transitionend', onEnd);
                resolve();
            }, 650);
        });
    }
}