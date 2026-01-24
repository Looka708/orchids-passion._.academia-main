
"use client";

import { useEffect, useState } from 'react';

const Confetti = () => {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * -100 - 100}px`,
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
        transform: `rotate(${Math.random() * 360}deg)`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 3 + 4}s`,
      },
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="confetti-container absolute inset-0 overflow-hidden pointer-events-none z-50">
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={p.style}></div>
      ))}
    </div>
  );
};

export default Confetti;
