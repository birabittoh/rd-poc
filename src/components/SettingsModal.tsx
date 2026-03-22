import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Music, Music2, Volume2, VolumeX } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-indigo-500' : 'bg-zinc-600'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-4.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings();
  const { audio, video } = settings;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm mx-4 bg-zinc-800/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 className="text-lg font-semibold text-zinc-100">Settings</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audio Section */}
            <div className="px-5 py-3">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Audio</h3>

              {/* BGM Row */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => updateSettings({ audio: { bgmMuted: !audio.bgmMuted } })}
                  className="p-1.5 rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 transition-colors"
                  aria-label={audio.bgmMuted ? 'Unmute BGM' : 'Mute BGM'}
                >
                  {audio.bgmMuted ? <Music2 className="w-4 h-4 opacity-40" /> : <Music className="w-4 h-4" />}
                </button>
                <span className="text-sm text-zinc-300 w-10">BGM</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={audio.bgmVolume}
                  onChange={(e) => updateSettings({ audio: { bgmVolume: Number(e.target.value) } })}
                  className={`flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-500 ${
                    audio.bgmMuted ? 'opacity-40' : ''
                  }`}
                  style={{
                    background: `linear-gradient(to right, ${audio.bgmMuted ? '#52525b' : '#6366f1'} ${audio.bgmVolume}%, #3f3f46 ${audio.bgmVolume}%)`,
                  }}
                />
              </div>

              {/* SFX Row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateSettings({ audio: { sfxMuted: !audio.sfxMuted } })}
                  className="p-1.5 rounded-lg text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50 transition-colors"
                  aria-label={audio.sfxMuted ? 'Unmute SFX' : 'Mute SFX'}
                >
                  {audio.sfxMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-sm text-zinc-300 w-10">SFX</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={audio.sfxVolume}
                  onChange={(e) => updateSettings({ audio: { sfxVolume: Number(e.target.value) } })}
                  className={`flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-500 ${
                    audio.sfxMuted ? 'opacity-40' : ''
                  }`}
                  style={{
                    background: `linear-gradient(to right, ${audio.sfxMuted ? '#52525b' : '#6366f1'} ${audio.sfxVolume}%, #3f3f46 ${audio.sfxVolume}%)`,
                  }}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="mx-5 border-t border-white/10" />

            {/* Video Section */}
            <div className="px-5 py-3 pb-5">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Video</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">Shadows</span>
                  <Toggle checked={video.shadows} onChange={(v) => updateSettings({ video: { shadows: v } })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${video.shadows ? 'text-zinc-300' : 'text-zinc-500'}`}>High-Quality Shadows</span>
                  <Toggle
                    checked={video.highQualityShadows}
                    onChange={(v) => updateSettings({ video: { highQualityShadows: v } })}
                    disabled={!video.shadows}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${video.shadows ? 'text-zinc-300' : 'text-zinc-500'}`}>Contact Shadows</span>
                  <Toggle
                    checked={video.contactShadows}
                    onChange={(v) => updateSettings({ video: { contactShadows: v } })}
                    disabled={!video.shadows}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">High Resolution</span>
                  <Toggle checked={video.highResolution} onChange={(v) => updateSettings({ video: { highResolution: v } })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">Antialiasing</span>
                  <Toggle checked={video.antialiasing} onChange={(v) => updateSettings({ video: { antialiasing: v } })} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">Light Reflections</span>
                  <Toggle checked={video.lightReflections} onChange={(v) => updateSettings({ video: { lightReflections: v } })} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
