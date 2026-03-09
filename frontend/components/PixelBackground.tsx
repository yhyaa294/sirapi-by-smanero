'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    life: number;
    maxLife: number;
    scale: number;
}

const PixelBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Brand Colors: Royal Blue, Cyan, Slate, with Red accents
        const colors = [
            'rgba(59, 130, 246, 0.4)', // Blue-500 low opacity
            'rgba(6, 182, 212, 0.4)',  // Cyan-500 low opacity
            'rgba(203, 213, 225, 0.3)', // Slate-300 low opacity
            'rgba(239, 68, 68, 0.3)',   // Red-500 low opacity (Accent)
        ];

        let particles: Particle[] = [];
        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const createParticle = () => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Random angle
            const angle = Math.random() * Math.PI * 2;
            // Initial speed (slow start)
            const speed = Math.random() * 0.5 + 0.2;

            const particle: Particle = {
                x: centerX,
                y: centerY,
                size: Math.random() * 10 + 5, // Base size 5-15px
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 0,
                maxLife: Math.random() * 200 + 300,
                scale: 0.1, // Start tiny
            };

            particles.push(particle);
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

            // Spawn new particles occasionally
            if (Math.random() < 0.15) { // Adjust spawn rate
                createParticle();
            }

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Move outward
                p.x += p.speedX;
                p.y += p.speedY;

                // Accelerate slightly as they move out (tunnel effect)
                p.speedX *= 1.01;
                p.speedY *= 1.01;

                // Life cycle
                p.life++;

                // Scale up (Perspective: things get bigger as they get close)
                if (p.scale < 3.0) {
                    p.scale *= 1.015;
                }

                // Calculate visual size
                const currentSize = p.size * p.scale;

                // Render Square (Pixel)
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - currentSize / 2, p.y - currentSize / 2, currentSize, currentSize);

                // Remove dead or off-screen particles
                if (
                    p.life > p.maxLife ||
                    p.x < -100 ||
                    p.x > canvas.width + 100 ||
                    p.y < -100 ||
                    p.y > canvas.height + 100
                ) {
                    particles.splice(i, 1);
                    i--;
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
            {/* Radial Gradient Overlay to fade the center so text is readable */}
            <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,1)_0%,rgba(255,255,255,0.8)_30%,rgba(255,255,255,0)_100%)]"
            />
        </div>
    );
};

export default PixelBackground;
