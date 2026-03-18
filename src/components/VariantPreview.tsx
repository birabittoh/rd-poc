import React from 'react';
import { ItemType } from '../types';

interface VariantPreviewProps {
  type: ItemType;
  variant: number;
  capture?: string;
}

export function VariantPreview({ type, variant, capture }: VariantPreviewProps) {
  if (capture) {
    return (
      <div className="w-16 h-16 bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center pointer-events-none">
        <img
          src={capture}
          alt={`${type} variant ${variant}`}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Fallback if capture is not yet available
  return (
    <div className="w-16 h-16 bg-zinc-900 rounded-lg overflow-hidden animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 rounded-full bg-zinc-800" />
    </div>
  );
}
