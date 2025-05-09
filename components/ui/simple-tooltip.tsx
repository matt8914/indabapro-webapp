"use client"

import React, { useState } from 'react';
import { cn } from "@/utils/cn";

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  className?: string;
}

export function SimpleTooltip({ children, text, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-block" 
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className={cn(
            "absolute z-50 p-2 text-sm bg-black text-white rounded shadow-md max-w-xs",
            "top-full mt-1 left-1/2 transform -translate-x-1/2",
            className
          )}
        >
          {text}
        </div>
      )}
    </div>
  );
} 