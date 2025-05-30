import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FinishConfettiProps {
  trigger: boolean;
}

interface ConfettiPiece {
  id: number;
  emoji: string;
  x: number;
  delay: number;
}

const FinishConfetti: React.FC<FinishConfettiProps> = ({ trigger }) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const emojis = ['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🎁', '🏆'];

  useEffect(() => {
    if (trigger) {
      const pieces: ConfettiPiece[] = [];
      for (let i = 0; i < 20; i++) {
        pieces.push({
          id: i,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          x: Math.random() * 100,
          delay: Math.random() * 2,
        });
      }
      setConfetti(pieces);

      // Clear confetti after animation
      const timer = setTimeout(() => {
        setConfetti([]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!trigger || confetti.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute text-2xl"
          style={{
            left: `${piece.x}%`,
            top: '-10%',
          }}
          initial={{
            y: -100,
            rotate: 0,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            y: window.innerHeight + 100,
            rotate: 360,
            opacity: 0,
            scale: 0.5,
          }}
          transition={{
            duration: 2,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        >
          {piece.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default FinishConfetti; 