import React from 'react';
import { motion } from 'framer-motion';

const ConductorCTA = () => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#DDD8C0] via-[#D0CAB0] to-[#C3BCA0] border-b-4 border-black relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-9xl font-black text-black transform -rotate-12">🎼</div>
        <div className="absolute top-40 right-20 text-7xl font-black text-black transform rotate-12">🎯</div>
        <div className="absolute bottom-20 left-1/4 text-6xl font-black text-black transform -rotate-45">🎵</div>
        <div className="absolute bottom-40 right-1/3 text-8xl font-black text-black transform rotate-45">🏆</div>
      </div>

      {/* Floating musical notes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl font-black opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              color: ['#FF5484', '#7C82FF', '#FEEF5D', '#A8E6CF'][i % 4]
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            {['♪', '♫', '♬', '♩'][i % 4]}
          </motion.div>
        ))}
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className={`
            bg-white border-4 border-black shadow-neo-lg p-12 md:p-16 text-center transition-all duration-300 relative overflow-hidden
            ${isHovered ? 'translate-x-[-6px] translate-y-[-6px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]' : ''}
          `}>
            
            {/* Background gradient accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF5484]/5 via-transparent to-[#7C82FF]/5"></div>
            
            {/* Conductor's baton decoration */}
            <motion.div
              className="absolute top-8 right-8 w-16 h-2 bg-gradient-to-r from-[#8B4513] to-[#D2691E] border-2 border-black transform rotate-45"
              animate={{ rotate: isHovered ? 60 : 45 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute -right-2 -top-1 w-4 h-4 bg-white border-2 border-black rounded-full"></div>
            </motion.div>

            <div className="relative z-10 space-y-8">
              
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="space-y-4"
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-black leading-tight">
                  Ready to Conduct
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF5484] to-[#7C82FF]">
                    Your Masterpiece?
                  </span>
                </h2>
                <p className="text-lg md:text-xl font-bold text-black/70 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of AI conductors who are already creating symphonies that change the world. Your orchestra awaits your direction.
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12"
              >
                {[
                  { number: '50K+', label: 'Active Conductors', icon: '🎼' },
                  { number: '2M+', label: 'Symphonies Created', icon: '🎵' },
                  { number: '99.9%', label: 'Uptime Harmony', icon: '⚡' }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                    className="bg-[#FFFDEE] border-4 border-black shadow-neo p-6 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150"
                  >
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-black text-black">{stat.number}</div>
                    <div className="text-sm font-bold text-black/70 uppercase tracking-wide">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <button className="group bg-gradient-to-r from-[#FF5484] to-[#7C82FF] text-white font-black uppercase px-10 py-5 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150 text-xl tracking-tight flex items-center space-x-3">
                  <span>Start Conducting</span>
                  <motion.span
                    animate={{ x: isHovered ? 4 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    🎼
                  </motion.span>
                </button>
                
                <button className="bg-white text-black font-black uppercase px-8 py-5 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150 text-lg tracking-tight flex items-center space-x-3">
                  <span>Watch Demo</span>
                  <span>▶️</span>
                </button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="flex flex-wrap justify-center items-center gap-6 pt-8 border-t-2 border-black"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 border-2 border-black animate-pulse"></div>
                  <span className="text-sm font-bold text-green-700 uppercase">Free to Start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 border-2 border-black"></div>
                  <span className="text-sm font-bold text-blue-700 uppercase">No Credit Card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 border-2 border-black"></div>
                  <span className="text-sm font-bold text-purple-700 uppercase">Instant Setup</span>
                </div>
              </motion.div>

              {/* Social proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="text-center"
              >
                <p className="text-sm font-medium text-black/60 italic">
                  "conduct.chat transformed how we think about AI workflows. It's like having a world-class orchestra at your fingertips."
                </p>
                <p className="text-xs font-bold text-black/50 uppercase tracking-wide mt-2">
                  — Sarah Chen, AI Director at TechCorp
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Bottom decorative elements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="flex justify-center mt-12"
        >
          <div className="flex items-center space-x-4">
            {['🎼', '🎯', '🎵', '⚡', '🎭', '🏆'].map((icon, index) => (
              <motion.div
                key={index}
                className="w-12 h-12 bg-white border-4 border-black shadow-neo flex items-center justify-center text-xl"
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              >
                {icon}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ConductorCTA; 