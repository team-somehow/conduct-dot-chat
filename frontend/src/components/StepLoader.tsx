// StepLoader component with Neo-Brutalist styling
// Features: Animated loader with spinning icon and bold text

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface StepLoaderProps {
  text: string;
}

const StepLoader: React.FC<StepLoaderProps> = ({ text }) => {
  return (
    <div className="h-screen flex items-center justify-center bg-[#FFFDEE] pb-24 overflow-hidden pt-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white border-4 border-black shadow-neo-lg p-12 max-w-md mx-4"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          {/* Spinning Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-6"
          >
            <Zap className="h-16 w-16 text-[#FF5484] stroke-2" />
          </motion.div>
          
          {/* Loading Text */}
          <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-4">
            {text}
          </h2>
          
          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.2, 1],
                  backgroundColor: ['#000', '#FF5484', '#000'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="w-3 h-3 bg-black border-2 border-black"
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StepLoader; 