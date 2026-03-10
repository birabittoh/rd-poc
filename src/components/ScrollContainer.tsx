import React, { useRef, useState, useEffect } from "react";
import { cn } from "./FurnitureButton";

interface ScrollContainerProps {
  children: React.ReactNode;
  title: string;
}

export function ScrollContainer({ children, title }: ScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftFade(scrollLeft > 0);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1); // -1 for subpixel rounding issues
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [children]);

  return (
    <div className="relative bg-zinc-900/40 p-2 pt-7 rounded-xl overflow-hidden">
      <div className="absolute top-2 left-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pointer-events-none z-10">
        {title}
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="flex gap-2 px-4 min-w-full md:justify-center">
          {children}
        </div>
      </div>

      {/* Left Fade */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-900/80 to-transparent pointer-events-none transition-opacity duration-300",
          showLeftFade ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Right Fade */}
      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-900/80 to-transparent pointer-events-none transition-opacity duration-300",
          showRightFade ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
