import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../utils/cn';

interface ScrollContainerProps {
  children: React.ReactNode;
  title: string;
}

export function ScrollContainer({ children, title }: ScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftFade(scrollLeft > 0);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1); // -1 for subpixel rounding issues
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    // If the scroll is primarily horizontal already, let it pass through
    // Otherwise, redirect vertical wheel to horizontal scroll
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
      e.preventDefault();
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    dragStartX.current = e.pageX - scrollRef.current.offsetLeft;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - dragStartX.current;
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const stopDragging = () => {
    if (!scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = 'grab';
    scrollRef.current.style.userSelect = '';
  };

  return (
    <div className="relative bg-zinc-900/40 p-2 pt-7 rounded-xl">
      <div className="absolute top-2 left-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pointer-events-none z-10">
        {title}
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        className="overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab"
        style={{ cursor: 'grab' }}
      >
        <div className="flex gap-2 px-4 w-fit mx-auto">{children}</div>
      </div>

      {/* Left Fade */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-900/80 to-transparent pointer-events-none transition-opacity duration-300',
          showLeftFade ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Right Fade */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-900/80 to-transparent pointer-events-none transition-opacity duration-300',
          showRightFade ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
