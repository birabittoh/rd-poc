import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings, loadSettings, saveSettings } from '../settings';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: { audio?: Partial<AppSettings['audio']>; video?: Partial<AppSettings['video']> }) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((patch: { audio?: Partial<AppSettings['audio']>; video?: Partial<AppSettings['video']> }) => {
    setSettings(prev => ({
      audio: patch.audio ? { ...prev.audio, ...patch.audio } : prev.audio,
      video: patch.video ? { ...prev.video, ...patch.video } : prev.video,
    }));
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
