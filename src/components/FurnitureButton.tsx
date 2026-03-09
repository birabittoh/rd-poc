import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ItemType } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function FurnitureButton({
  type,
  icon,
  selected,
  onClick,
  isOrnament,
}: {
  type: ItemType;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  isOrnament?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-200",
        selected
          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105"
          : "bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600 hover:text-white",
      )}
    >
      {icon}
      <span className="text-xs font-medium capitalize">{type}</span>
      {isOrnament && (
        <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          Top
        </span>
      )}
    </button>
  );
}
