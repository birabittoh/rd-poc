import { EMOJI_LIST } from './constants';

const cache = new Map<string, HTMLAudioElement>();

export async function preloadSfx(name: string): Promise<void> {
  if (cache.has(name)) return;
  try {
    const url = `${import.meta.env.BASE_URL}sfx/${name}.mp3`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    cache.set(name, audio);
  } catch (err) {
    console.warn(`SFX preload failed for "${name}":`, err);
  }
}

export async function preloadAllSfx(): Promise<void> {
  await Promise.allSettled(EMOJI_LIST.map((e) => preloadSfx(e.sfx)));
}

export function playSfx(name: string, volume: number): void {
  const audio = cache.get(name);
  if (!audio) return;
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.volume = volume;
  clone.play().catch(() => {});
}
