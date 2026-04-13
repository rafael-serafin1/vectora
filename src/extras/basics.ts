export function removeComments(s: any): any {
    // remove /* ... */ e // ... até EOL
    return s
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
}

export function toMs(value: any): number {
    if (!value) return 600;
    value = value.trim();
    if (value.endsWith('ms')) return parseFloat(value);
    if (value.endsWith('s')) return parseFloat(value) * 1000;
    // se só número, assume ms
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 600;
}

export function ensureInlineBlockIfNeeded(el: any): void {
    const style = window.getComputedStyle(el);
    if (style.display === 'inline') {
      el.style.display = 'inline-block';
    }
}

export function parseAnimString(s: any): { name: string; arg: string | null } {
    // exemplo: land(600ms) ou land
    const m = s.match(/^([a-zA-Z0-9_-]+)\s*(?:\(([^)]*)\))?$/);
    if (!m) return { name: s, arg: null };
    return { name: m[1], arg: m[2] ? m[2].trim() : null };
}

  /********** event mapping & binding **********/
export function mapEventName(jsEvent: any): any {
    // jsEvent já em lower-case sem "on" (ex: "load", "click", "hover")
    if (!jsEvent) return null;
    if (jsEvent === 'hover') return 'mouseenter';
    return jsEvent;
}

export function parseProperties(text: any): any {
    const props: any = {};
    const regex: RegExp = /([a-zA-Z0-9_-]+)\s*:\s*([^;]+);?/g;
    let match: any;
    while ((match = regex.exec(text)) !== null) {
      props[match[1].trim()] = match[2].trim();
    }
    return props;
}


export function appendTransition(el: HTMLElement, transition: string): boolean {
  const current = getComputedStyle(el).transition;

  if (!current || current === 'none') {
    el.style.transition = transition;
    return true;
  }

  const newProp = transition.split(' ')[0];

  const transitions = current
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const filtered = transitions.filter(t => {
    const prop = t.split(' ')[0];
    return prop !== newProp;
  });

  filtered.push(transition);

  el.style.transition = filtered.join(', ');

  return true;
}

/**
 *
 * @param string Token string
 * @param substrings String array to check if any is included in the string
 * @returns boolean value indicating if any of the substrings is included in the string
 */
export function findIncludes(string: string, substrings: string[]): boolean {
  for (const sub of substrings) 
    if (string.includes(sub)) return true;
  return false;  
}