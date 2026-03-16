import React from 'react';
import { ItemType } from '../types';
import { cn } from '../utils/cn';

export function FurnitureButton({
  type,
  icon,
  selected,
  disabled,
  onClick,
  isOrnament: _isOrnament,
}: {
  type: ItemType;
  icon: React.ReactNode;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  isOrnament?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative p-2.5 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 min-w-[64px] shrink-0',
        selected
          ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105'
          : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600 hover:text-white',
        disabled && 'opacity-40 cursor-not-allowed grayscale-[0.5]'
      )}
    >
      <div className="[&>svg]:w-5 [&>svg]:h-5">{icon}</div>
      <span className="text-[10px] font-medium capitalize">{type.replace('_', ' ')}</span>
    </button>
  );
}
