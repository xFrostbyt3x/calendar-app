import { useEffect, useRef } from 'react';

const COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#8A2BE2', '#34A853'];

export default function InteractiveBackground({ theme }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        let mouse = { x: -1000, y: -1000 };
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        // Adjust density based on screen size
        const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 9000);
        const particles = Array.from({ length: particleCount }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: 0,
            vy: 0,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            angle: Math.random() * Math.PI * 2,
            length: Math.random() * 4 + 3,
            baseSpeed: Math.random() * 0.15 + 0.05,
        }));

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const isDark = theme === 'dark';

            particles.forEach((p) => {
                // Constant drift
                p.x += Math.cos(p.angle) * p.baseSpeed;
                p.y += Math.sin(p.angle) * p.baseSpeed;

                // Mouse Repulsion
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 140;

                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    p.vx -= (dx / distance) * force * 0.6;
                    p.vy -= (dy / distance) * force * 0.6;
                }

                // Friction
                p.vx *= 0.94;
                p.vy *= 0.94;

                p.x += p.vx;
                p.y += p.vy;

                // Screen Wrap
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.y > canvas.height + 10) p.y = -10;

                // Draw Particle
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + Math.cos(p.angle) * p.length, p.y + Math.sin(p.angle) * p.length);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2.0;
                ctx.lineCap = 'round';
                // Increase opacity for dark mode and base opacity for light mode
                ctx.globalAlpha = isDark ? 0.9 : 0.6;
                ctx.stroke();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Edge Glow Overlay */}
            <div className="absolute inset-0 interactive-edge-glow pointer-events-none z-10 transition-opacity duration-700"></div>
            {/* Canvas */}
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}
