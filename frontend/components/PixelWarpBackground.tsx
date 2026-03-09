'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    z: number; // Depth for perspective
    color: string;
}

const PixelWarpBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Brand Colors: Royal Blue, Cyan, Slate, White
        // Data Stream Colors: Royal Blue, Cyan, Light Blue
        const colors = [
            'rgba(37, 99, 235, 1.0)',  // Blue-600
            'rgba(59, 130, 246, 0.9)', // Blue-500
            'rgba(6, 182, 212, 0.9)',  // Cyan-500
            'rgba(147, 197, 253, 0.8)', // Blue-300 (Highlight)
            'rgba(239, 246, 255, 0.6)', // Blue-50 (Faint trail)
        ];

        let particles: Particle[] = [];
        let animationFrameId: number;
        let width = 0;
        let height = 0;
        let cx = 0;
        let cy = 0;

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            cx = width / 2;
            cy = height / 2;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const createParticle = (): Particle => {
            return {
                x: (Math.random() - 0.5) * width, // Random spread relative to center
                y: (Math.random() - 0.5) * height,
                z: Math.random() * 2 + 1, // Start slightly deep
                color: colors[Math.floor(Math.random() * colors.length)],
            };
        };

        // Initialize particles
        for (let i = 0; i < 150; i++) {
            particles.push(createParticle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Sort particles by Z so distant ones draw first (optional but good for depth)
            // particles.sort((a, b) => b.z - a.z); 

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // "Warp" movement: Decrease Z to move closer
                p.z -= 0.02;

                // Reset if it passes the viewer or goes off bounds too much
                if (p.z <= 0.1) {
                    Object.assign(p, {
                        x: (Math.random() - 0.5) * width,
                        y: (Math.random() - 0.5) * height,
                        z: 3, // Push back to depth
                        color: colors[Math.floor(Math.random() * colors.length)]
                    });
                    continue;
                }

                // Perspective mapping
                // x' = x / z + center
                const k = 200 / p.z; // Field of View scalar
                const px = p.x / p.z * 2 + cx; // Multiplier spreads them out
                const py = p.y / p.z * 2 + cy;

                // Size grows as Z decreases
                const size = (1 - p.z / 3) * 6; // range 0 to 6

                if (px >= 0 && px <= width && py >= 0 && py <= height && size > 0) {
                    ctx.fillStyle = p.color;
                    ctx.fillRect(px, py, size, size);

                    // Optional: Simple tail/motion blur by drawing a smaller rect behind (approximated)
                    // ctx.globalAlpha = 0.3;
                    // ctx.fillRect(px + (px - cx) * 0.05, py + (py - cy) * 0.05, size * 0.8, size * 0.8);
                    // ctx.globalAlpha = 1.0;
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none overflow-hidden bg-white">
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
            />
            {/* Radial Gradient Overlay: Transparent Center -> White Edges */}
            <div
                className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,rgba(255,255,255,0.8)_80%,rgba(255,255,255,1)_100%)]"
            />
        </div>
    );
};

export default PixelWarpBackground;
