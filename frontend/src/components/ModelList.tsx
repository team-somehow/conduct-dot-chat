// ModelList component with Neo-Brutalist styling
// Features: Displays selected AI models as animated cards

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Image } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  type: string;
  color: string;
}

interface ModelListProps {
  models: Model[];
}

const ModelList: React.FC<ModelListProps> = ({ models }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'Language Model':
        return <Brain className="h-6 w-6" />;
      case 'Image Generation':
        return <Image className="h-6 w-6" />;
      default:
        return <Brain className="h-6 w-6" />;
    }
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-80 p-6"
    >
      <h3 className="text-xl font-black uppercase tracking-tight text-black mb-6">
        Selected Models
      </h3>
      
      <motion.div 
        className="space-y-4"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
        initial="hidden"
        animate="visible"
      >
        {models.map((model, index) => (
          <motion.div
            key={model.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="bg-white border-4 border-black shadow-neo p-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150"
          >
            <div className="flex items-center space-x-3">
              {/* Model Icon */}
              <div 
                className="p-2 border-2 border-black text-white"
                style={{ backgroundColor: model.color }}
              >
                {getIcon(model.type)}
              </div>
              
              {/* Model Info */}
              <div className="flex-1">
                <h4 className="font-black uppercase text-sm text-black">
                  {model.name}
                </h4>
                <p className="text-xs font-bold text-gray-600 uppercase">
                  {model.type}
                </p>
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center space-x-1">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    backgroundColor: ['#00FF00', '#32CD32', '#00FF00'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                  className="w-3 h-3 bg-green-500 border-2 border-black"
                />
                <span className="text-xs font-bold uppercase text-green-600">
                  Active
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 p-4 bg-[#FEEF5D] border-4 border-black shadow-neo"
      >
        <p className="text-sm font-black uppercase text-black">
          {models.length} Models Selected
        </p>
        <p className="text-xs font-bold text-black/70 mt-1">
          Ready for workflow execution
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ModelList; 