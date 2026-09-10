import { useEffect, useState } from 'react';

// Single bee component to keep animation state isolated
function Bee({ id }: { id: number }) {
  const [styles, setStyles] = useState({});

  useEffect(() => {
    let animationFrameId: number;
    // Randomize initial parameters for each bee
    let startTime = Date.now() + Math.random() * 5000; 
    let speed = 0.02 + Math.random() * 0.05; // Random speed
    let direction = Math.random() > 0.5 ? 1 : -1; // Random start direction
    let startY = Math.random() * window.innerHeight * 0.9;
    let amplitude = 20 + Math.random() * 50; // Random bobbing height

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      
      let xPos = (elapsed * speed) % (window.innerWidth + 300) - 150;
      
      if (xPos < -140 && elapsed > 1000) {
        direction *= -1;
        startTime = Date.now();
        startY = Math.random() * window.innerHeight * 0.8 + 50;
        speed = 0.02 + Math.random() * 0.04;
        amplitude = 20 + Math.random() * 50;
      }

      let currentX = direction === 1 ? xPos : window.innerWidth - xPos;

      const yOffset = Math.sin(elapsed * 0.002) * amplitude;
      const tilt = Math.cos(elapsed * 0.002) * 15 * direction;
      const zScale = (0.6 + Math.random() * 0.2) + Math.sin(elapsed * 0.001) * 0.3; // Varying sizes for depth

      setStyles({
        transform: `translate3d(${currentX}px, ${startY + yOffset}px, 0) scaleX(${direction === 1 ? -1 : 1}) scale(${zScale}) rotateZ(${tilt}deg)`,
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-[50] pointer-events-none text-4xl sm:text-5xl"
      style={{
        ...styles,
        willChange: 'transform',
        filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.15))'
      }}
    >
      🐝
    </div>
  );
}

export function FlyingBee() {
  // Generate 30 bees for a massive swarm effect!
  const bees = Array.from({ length: 30 }, (_, i) => i);
  
  return (
    <>
      {bees.map(id => <Bee key={id} id={id} />)}
    </>
  );
}
