import { motion } from 'framer-motion';

const HeroTitle = () => {
  return (
    <div className="relative text-center">
      {/* Paper tear background elements - smaller and centered */}
      <div className="paper-tear paper-tear-1 wiggle-slow opacity-20"></div>
      <div className="paper-tear paper-tear-2 wiggle-slow opacity-20"></div>
      
      {/* Floating musical notes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl font-black opacity-20"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${10 + Math.random() * 80}%`,
              color: ['#FF5484', '#7C82FF', '#FEEF5D'][i % 3]
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.8,
            }}
          >
            {['♪', '♫', '♬', '♩', '♭', '♯'][i]}
          </motion.div>
        ))}
      </div>
      
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-[clamp(1.8rem,4.5vw,3.5rem)] font-black leading-[1.1] text-black tracking-tight relative z-10 mb-3"
      >
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Conduct a Symphony of
        </motion.span>
        <br/>
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6F9C] to-[#7C82FF] inline-block"
        >
          AI Agents
        </motion.span>
      </motion.h1>
      
      <motion.p 
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-sm sm:text-base md:text-lg text-black font-medium leading-relaxed max-w-lg mx-auto relative z-10"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Be the maestro of AI orchestration.
        </motion.span>{' '}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          Direct specialized agents to work in perfect harmony.
        </motion.span>
      </motion.p>

      {/* Conductor's baton decoration - centered */}
      <motion.div
        initial={{ opacity: 0, rotate: -45 }}
        animate={{ opacity: 1, rotate: 15 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 translate-x-8 w-12 h-1.5 bg-gradient-to-r from-[#8B4513] to-[#D2691E] border border-black rotate-15 z-10"
      >
        <div className="absolute -right-0.5 -top-0.5 w-3 h-3 bg-white border border-black rounded-full"></div>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 2 }}
          className="absolute -left-0.5 -top-0.5 w-1 h-1 bg-[#FF5484] border border-black rounded-full"
        ></motion.div>
      </motion.div>
    </div>
  );
};

export default HeroTitle; 