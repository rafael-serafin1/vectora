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

export const especificTriggers: Record<string, TriggerFn> = {
  import: (cb) => {
    cb();
  },

  "when.Hover": (cb, elements) => {
    assertLibraryLoaded("whensevent");
    document.addEventListener("mouseover", (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      for (const element of elements) {
        if (matchesElement(target, element)) {
          cb([element]);
          break;
        }
      }
    });
  },

  "when.Target": (cb, elements) => {
    assertLibraryLoaded("whensevent");

    const checkHash = () => {
      for (const element of elements) {
        if (isElementTargetedByHash(element)) {
          cb([element]);
        }
      }
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

    document.addEventListener("change", (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      for (const element of elements) {
        if (matchesElement(target, element) && (target as HTMLInputElement).type === "checkbox" && (target as HTMLInputElement).checked) {
          if (checkedOnce.has(element)) {
            cb([element]);
          } else {
            checkedOnce.add(element);
          }
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
          cb([element]);
          break;
        }
      }
    });
  },
};
