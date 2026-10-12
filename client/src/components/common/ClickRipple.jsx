import React, { useState, useEffect, useCallback } from 'react';

/**
 * ClickRipple Component
 * Spawns organic, wellness-inspired soft expanding ripple bubbles on click/tap interactions.
 */
export default function ClickRipple() {
  const [ripples, setRipples] = useState([]);

  const addRipple = useCallback((e) => {
    // Avoid spawning for non-interactive elements if desired, or spawn for any interactive target
    const target = e.target;
    const isInteractive = target.closest('button, a, input, select, textarea, [role="button"], .clickable, .yoga-card');
    
    // Choose color from PranaVeda palette
    const colors = [
      'rgba(85, 117, 94, 0.28)',   // Sage
      'rgba(226, 184, 135, 0.35)', // Soft Gold
      'rgba(45, 74, 62, 0.22)',    // Forest Green
      'rgba(240, 235, 225, 0.45)'  // Cream Glow
    ];
    const color = isInteractive ? colors[1] : colors[0];

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newRipple = {
      id,
      x: e.clientX,
      y: e.clientY,
      color,
      size: isInteractive ? 48 : 36
    };

    setRipples((prev) => [...prev.slice(-8), newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
  }, []);

  useEffect(() => {
    window.addEventListener('click', addRipple, { passive: true });
    return () => window.removeEventListener('click', addRipple);
  }, [addRipple]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            left: `${r.x}px`,
            top: `${r.y}px`,
            width: `${r.size}px`,
            height: `${r.size}px`,
            background: `radial-gradient(circle, ${r.color} 0%, transparent 70%)`,
            boxShadow: `0 0 12px ${r.color}`
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-click-bubble"
        />
      ))}
    </div>
  );
}
