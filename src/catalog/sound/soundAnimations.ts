const audioMap = new WeakMap<HTMLElement, HTMLAudioElement[]>();

function getAudioList(el: HTMLElement) {
  let list = audioMap.get(el);
  if (!list) {
    list = [];
    audioMap.set(el, list);
  }
  return list;
}

function parseArgs(args: string) {
  return args
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeVolume(value: string | number): number {
  const volume = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(volume)) return 1;
  return Math.min(Math.max(volume, 0), 1);
}

function createAudio(el: HTMLElement, src: string, volume: number, loop = false) {
  const audio = new Audio(src);
  audio.volume = normalizeVolume(volume);
  audio.loop = loop;
  const list = getAudioList(el);
  list.push(audio);
  audio.addEventListener("ended", () => {
    const currentList = getAudioList(el);
    const index = currentList.indexOf(audio);
    if (index >= 0) currentList.splice(index, 1);
  });
  audio.play().catch((error) => {
    console.warn(`[Vectora] Falha ao tocar áudio: ${error}`);
  });
  return audio;
}

function controlAudio(el: HTMLElement, action: "pause" | "stop") {
  const list = getAudioList(el);
  for (const audio of list) {
    if (action === "pause") {
      audio.pause();
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  }
  if (action === "stop") {
    audioMap.set(el, []);
  }
}

export const soundAnimations = {
  play: async (el: HTMLElement, args: string): Promise<void> => {
    const [src, volume = "1"] = parseArgs(args);
    if (!src) {
      console.warn("[Vectora] play() requer o caminho do arquivo de áudio.");
      return;
    }
    createAudio(el, src, normalizeVolume(volume));
  },

  loop: async (el: HTMLElement, args: string): Promise<void> => {
    const [src, volume = "1"] = parseArgs(args);
    if (!src) {
      console.warn("[Vectora] loop() requer o caminho do arquivo de áudio.");
      return;
    }
    createAudio(el, src, normalizeVolume(volume), true);
  },

  pause: async (el: HTMLElement): Promise<void> => {
    controlAudio(el, "pause");
  },

  stop: async (el: HTMLElement): Promise<void> => {
    controlAudio(el, "stop");
  },
};
