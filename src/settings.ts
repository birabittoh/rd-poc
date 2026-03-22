export interface AudioSettings {
  bgmVolume: number; // 0-100 slider position
  bgmMuted: boolean;
  sfxVolume: number; // 0-100 slider position
  sfxMuted: boolean;
}

export interface VideoSettings {
  particleEffects: boolean;
  shadows: boolean;
  highQualityShadows: boolean;
  highResolution: boolean;
  antialiasing: boolean;
  contactShadows: boolean;
  lightReflections: boolean;
}

export interface AppSettings {
  audio: AudioSettings;
  video: VideoSettings;
}

const SETTINGS_KEY = 'rd-poc:settings';
const LEGACY_BGM_MUTE_KEY = 'rd-poc:bgmMuted';
const LEGACY_SFX_MUTE_KEY = 'rd-poc:sfxMuted';

export const DEFAULT_SETTINGS: AppSettings = {
  audio: {
    bgmVolume: 30,
    bgmMuted: false,
    sfxVolume: 50,
    sfxMuted: false,
  },
  video: {
    particleEffects: true,
    shadows: true,
    highQualityShadows: false,
    highResolution: false,
    antialiasing: false,
    contactShadows: false,
    lightReflections: false,
  },
};

/** Convert a 0-100 slider position to a 0.0-1.0 volume using logarithmic scale */
export function sliderToVolume(slider: number): number {
  if (slider <= 0) return 0;
  return (Math.pow(10, slider / 100) - 1) / 9;
}

export function loadSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        audio: { ...DEFAULT_SETTINGS.audio, ...parsed.audio },
        video: { ...DEFAULT_SETTINGS.video, ...parsed.video },
      };
    } catch {
      // corrupted, fall through to defaults
    }
  }

  // Migrate legacy keys
  const settings = { ...DEFAULT_SETTINGS, audio: { ...DEFAULT_SETTINGS.audio }, video: { ...DEFAULT_SETTINGS.video } };
  const legacyBgm = localStorage.getItem(LEGACY_BGM_MUTE_KEY);
  if (legacyBgm !== null) {
    settings.audio.bgmMuted = legacyBgm === 'true';
    localStorage.removeItem(LEGACY_BGM_MUTE_KEY);
  }
  const legacySfx = localStorage.getItem(LEGACY_SFX_MUTE_KEY);
  if (legacySfx !== null) {
    settings.audio.sfxMuted = legacySfx === 'true';
    localStorage.removeItem(LEGACY_SFX_MUTE_KEY);
  }

  saveSettings(settings);
  return settings;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
