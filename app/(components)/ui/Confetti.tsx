"use client";
import React, { useEffect, useState } from 'react';

// Simple confetti particle system logic
export default function Confetti() {
    const [particles] = useState(() => [...Array(50)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][Math.floor(Math.random() * 5)],
        size: Math.random() * 8 + 4,
        speed: Math.random() * 5 + 3,
        wobble: Math.random() * 10,
    })));

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-sm animate-fall"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        backgroundColor: p.color,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDuration: `${p.speed}s`,
                        animationDelay: '0s',
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
                }
                .animate-fall {
                    animation-name: fall;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                }
            `}</style>
        </div>
    );
}
