type TriggerFn = (cb: (targets?: HTMLElement[]) => any, elements: NodeListOf<HTMLElement>) => void;

const loadedLibraries = new Set<string>();
const checkedOnce = new WeakSet<HTMLElement>();

export function isLibraryLoaded(lib: string) {
  return loadedLibraries.has(lib.trim().toLowerCase());
}

export function registerLibraries(libs: string[]) {
  for (const lib of libs) {
    registerLibrary(lib);
  }
}

function registerLibrary(lib: string) {
  const normalized = lib.trim().toLowerCase();
  if (loadedLibraries.has(normalized)) return;
  
  const info = (lib: string) => console.info(`[Vectora] Biblioteca importada: ${lib}`);

  switch (normalized) {
    case "whensevent":
      loadedLibraries.add(normalized);
      info(lib);
      break;
    case "playerlayer":
      loadedLibraries.add(normalized);
      info(lib);
      break;
    case "limits":
      loadedLibraries.add(normalized);
      info(lib);
      break;
    default:
      console.warn(`[Vectora] Biblioteca desconhecida: ${lib}`);
  }
}

function assertLibraryLoaded(lib: string) {
  if (!isLibraryLoaded(lib)) {
    throw new Error(`[Vectora] Biblioteca '${lib}' não foi importada. Use @vectora import { ${lib} };`);
  }
}

const isElementTargetedByHash = (el: HTMLElement) => {
  const hash = window.location.hash;
  if (!hash) return false;
  const id = hash.slice(1);
  return id === el.id;
};

const matchesElement = (target: EventTarget | null, element: HTMLElement) => {
  if (!(target instanceof HTMLElement)) return false;
  return target === element || element.contains(target);
};

const styleSnapshots = new WeakMap<HTMLElement, string>();

const captureStyleSnapshot = (element: HTMLElement) => {
  if (!styleSnapshots.has(element)) {
    styleSnapshots.set(element, element.getAttribute('style') ?? '');
  }
};

const restoreStyleSnapshot = (element: HTMLElement) => {
  if (!styleSnapshots.has(element)) return;
  const value = styleSnapshots.get(element)!;
  if (value) {
    element.setAttribute('style', value);
  } else {
    element.removeAttribute('style');
  }
  styleSnapshots.delete(element);
};

export const especificTriggers: Record<string, TriggerFn> = {
  import: (cb) => {
    cb();
  },

  "when.Hover": (cb, elements) => {
    assertLibraryLoaded("whensevent");

    for (const element of elements) {
      element.addEventListener("mouseenter", () => {
        captureStyleSnapshot(element);
        cb([element]);
      });

      element.addEventListener("mouseleave", () => {
        restoreStyleSnapshot(element);
      });
    }
  },

  "when.Target": (cb, elements) => {
    assertLibraryLoaded("whensevent");

    const currentTargets = new Set<HTMLElement>();

    const checkHash = () => {
      const nextTargets = new Set<HTMLElement>();

      for (const element of elements) {
        if (isElementTargetedByHash(element)) {
          nextTargets.add(element);
          if (!currentTargets.has(element)) {
            captureStyleSnapshot(element);
            cb([element]);
          }
        }
      }

      for (const previousElement of currentTargets) {
        if (!nextTargets.has(previousElement)) {
          restoreStyleSnapshot(previousElement);
        }
      }

      currentTargets.clear();
      for (const element of nextTargets) currentTargets.add(element);
    };

    window.addEventListener("hashchange", checkHash);
    checkHash();
  },

  "when.CheckBox": (cb, elements) => {
    assertLibraryLoaded("whensevent");

    document.addEventListener("change", (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      for (const element of elements) {
        if (matchesElement(target, element) && (target as HTMLInputElement).type === "checkbox" && (target as HTMLInputElement).checked) {
          cb([element]);
          break;
        }
      }
    });
  },

  "when.Checked": (cb, elements) => {
    assertLibraryLoaded("whensevent");

    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const link = target instanceof HTMLAnchorElement ? target : target.closest('a');
      if (!link) return;

      for (const element of elements) {
        if (matchesElement(link, element)) {
          cb([element]);
          break;
        }
      }
    });
  },

  "when.UncheckBox": (cb, elements) => {
    assertLibraryLoaded("whensevent");

    document.addEventListener("change", (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      for (const element of elements) {
        if (matchesElement(target, element) && (target as HTMLInputElement).type === "checkbox" && !(target as HTMLInputElement).checked) {
          cb([element]);
          break;
        }
      }
    });
  },

  "when.Focused": (cb, elements) => {
    assertLibraryLoaded("whensevent");

    document.addEventListener("focusin", (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      for (const element of elements) {
        if (matchesElement(target, element)) {
          captureStyleSnapshot(element);
          cb([element]);
          break;
        }
      }
    });

    document.addEventListener("focusout", (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      for (const element of elements) {
        if (matchesElement(target, element)) {
          const relatedTarget = event.relatedTarget as HTMLElement | null;
          if (relatedTarget && matchesElement(relatedTarget, element)) {
            return;
          }
          restoreStyleSnapshot(element);
          break;
        }
      }
    });
  },
};
