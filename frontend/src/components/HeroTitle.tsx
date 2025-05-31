import { motion } from 'framer-motion';

const HeroTitle = () => {
  return (
    <div className="relative">
      {/* Paper tear background elements */}
      <div className="paper-tear paper-tear-1 wiggle-slow"></div>
      <div className="paper-tear paper-tear-2 wiggle-slow"></div>
      
      <motion.h1
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-[clamp(2.5rem,6vw,5.5rem)] font-black leading-[1.05] text-black tracking-tight relative z-10"
      >
        Orchestrate AI Models with<br/>
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6F9C] to-[#FF5484]"
        >
          Precision
        </motion.span>
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-black font-medium leading-relaxed mt-6 max-w-lg sm:max-w-2xl lg:max-w-4xl"
      >
        Transform your ideas into powerful AI workflows. Connect, configure, and execute multiple AI models seamlessly.
      </motion.p>
    </div>
  );
};

export default HeroTitle; 