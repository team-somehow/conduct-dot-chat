import React from 'react';
import { motion } from 'framer-motion';

const stickers = [
  { id: 1, emoji: '✨', color: '#FFE37B', x: 20, y: 30 },
  { id: 2, emoji: '⚡', color: '#FF5484', x: 80, y: 60 },
  { id: 3, emoji: '🧠', color: '#7C82FF', x: 140, y: 20 },
  { id: 4, emoji: '🎨', color: '#FFE37B', x: 60, y: 120 },
  { id: 5, emoji: '🚀', color: '#FF5484', x: 180, y: 100 },
];

const Sticker: React.FC<{ sticker: typeof stickers[0] }> = ({ sticker }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ') {
      e.preventDefault();
      // Trigger jiggle animation
      e.currentTarget.classList.add('jitter-hover');
      setTimeout(() => {
        e.currentTarget.classList.remove('jitter-hover');
      }, 500);
    }
  };

  return (
    <motion.div
      drag
      dragElastic={0.2}
      initial={{ x: sticker.x, y: sticker.y }}
      whileDrag={{ scale: 1.1, rotate: 5 }}
      whileHover={{ scale: 1.05 }}
      className="sticker absolute w-[120px] h-[120px] rounded-none border-4 border-black shadow-neo flex items-center justify-center text-4xl font-black select-none"
      style={{ backgroundColor: sticker.color }}
      tabIndex={0}
      role="button"
      aria-label={`Drag me - ${sticker.emoji}`}
      onKeyDown={handleKeyDown}
    >
      {sticker.emoji}
    </motion.div>
  );
};

const HeroCollage = () => {
  return (
    <section className="min-h-[90vh] border-b-4 border-black relative paper-ripple">
      <div className="grid md:grid-cols-[60%_40%] h-[90vh] gap-8 items-center px-[clamp(1.5rem,6vw,4rem)] py-20">
        {/* Left - Headline */}
        <div className="relative z-10">
          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-[clamp(2.5rem,8vw,6rem)] font-black leading-[0.9] text-black tracking-tight"
          >
            Orchestrate AI Models with{' '}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-pink block"
              style={{
                background: 'linear-gradient(135deg, #ff6f9c, #ff5484)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Precision
            </motion.span>
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl md:text-2xl text-black font-medium leading-relaxed mt-6 max-w-2xl"
          >
            Transform your ideas into powerful AI workflows. Connect, configure, and execute multiple AI models seamlessly.
          </motion.p>
        </div>

        {/* Right - Draggable Stickers */}
        <div className="relative h-full min-h-[400px] hidden md:block">
          <div className="absolute inset-0">
            {stickers.map((sticker) => (
              <Sticker key={sticker.id} sticker={sticker} />
            ))}
          </div>
        </div>

        {/* Mobile Stickers */}
        <div className="md:hidden flex flex-wrap gap-4 justify-center mt-8">
          {stickers.slice(0, 3).map((sticker) => (
            <div
              key={sticker.id}
              className="w-20 h-20 rounded-none border-4 border-black shadow-neo flex items-center justify-center text-2xl font-black"
              style={{ backgroundColor: sticker.color }}
            >
              {sticker.emoji}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCollage; 