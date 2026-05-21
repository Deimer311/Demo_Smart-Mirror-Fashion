'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface ImageSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({ beforeImage, afterImage, className = '' }) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-zinc-950 aspect-[3/4] w-full max-w-[450px] ${className}`}
    >
      {/* Before Image (Left / Background) */}
      <img
        src={beforeImage}
        alt="Original"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      
      {/* Label: Before */}
      <div className="absolute top-4 left-4 z-30 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase text-white/70">
        Antes
      </div>

      {/* After Image (Right / Foreground, clipped by slider position) */}
      <div 
        className="absolute inset-y-0 right-0 left-0 z-10 overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
      >
        <img
          src={afterImage}
          alt="AI Generated Outfit"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Label: After */}
      <div className="absolute top-4 right-4 z-30 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[10px] font-bold tracking-widest uppercase text-white flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
        IA Outfit
      </div>

      {/* Slider Line & Handle */}
      <div 
        className="absolute inset-y-0 z-20 w-0.5 bg-white cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Glassmorphic Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border-2 border-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
          </svg>
        </div>
      </div>
    </div>
  );
};
