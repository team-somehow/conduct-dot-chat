import React from 'react';
import { motion } from 'framer-motion';

interface ExamplePromptsProps {
  onPromptSelect: (prompt: string) => void;
}

const examplePrompts = [
  {
    id: 1,
    title: "NFT Collection Deployment",
    prompt: 'Deploy a "Naruto"-themed NFT Collection on Flow Mainnet, and mint 2 tokens to 0xDe2480fe2ba5Af11fC44DBA0e8c11837C64D19D4',
    icon: "🎨",
    accent: "#FF5484",
    category: "Web3 & NFTs"
  },
  {
    id: 2,
    title: "DeFi Investment",
    prompt: "Invest my LINK tokens in AAVE",
    icon: "💰",
    accent: "#7C82FF",
    category: "DeFi & Trading"
  }
];

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onPromptSelect }) => {
  const [hoveredId, setHoveredId] = React.useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="mt-4"
    >
      {/* Header - Very Compact */}
      <div className="text-center mb-3">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
          className="text-sm font-black uppercase text-black mb-1 tracking-tight"
        >
          Try These Symphonies
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.4 }}
          className="text-xs font-medium text-black/70"
        >
          Click any example to start conducting immediately
        </motion.p>
      </div>

      {/* Example Prompts Grid - Very Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-3xl mx-auto">
        {examplePrompts.map((example, index) => (
          <motion.button
            key={example.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
            onClick={() => onPromptSelect(example.prompt)}
            onMouseEnter={() => setHoveredId(example.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`
              group relative bg-white border-2 border-black shadow-neo p-3 text-left transition-all duration-200 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-neo-lg
              ${hoveredId === example.id ? 'translate-x-[-1px] translate-y-[-1px] shadow-neo-lg' : ''}
            `}
          >
            {/* Background accent */}
            <div 
              className="absolute top-0 right-0 w-8 h-8 opacity-10 transform rotate-12 transition-all duration-300 group-hover:scale-110"
              style={{ backgroundColor: example.accent }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Header with icon and category */}
              <div className="flex items-center justify-between mb-2">
                <div 
                  className="w-6 h-6 border border-black flex items-center justify-center text-xs transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                  style={{ backgroundColor: example.accent }}
                >
                  {example.icon}
                </div>
                <span className="text-xs font-bold bg-black text-white px-1.5 py-0.5 uppercase tracking-wide">
                  {example.category}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-xs font-black uppercase tracking-tight text-black mb-1.5 leading-tight">
                {example.title}
              </h4>

              {/* Prompt preview */}
              <p className="text-xs font-medium text-black/80 leading-relaxed mb-2 line-clamp-2">
                {example.prompt}
              </p>

              {/* Action indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-500 border border-black animate-pulse"></div>
                  <span className="text-xs font-bold text-green-700 uppercase">Ready</span>
                </div>
                <motion.div
                  animate={{ x: hoveredId === example.id ? 2 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-black font-black text-xs"
                >
                  🎼
                </motion.div>
              </div>
            </div>

            {/* Hover effect overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredId === example.id ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 border-2 border-black bg-gradient-to-br from-transparent via-transparent to-black/5 pointer-events-none"
            />
          </motion.button>
        ))}
      </div>

      {/* Bottom hint - Very Compact */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.4 }}
        className="text-center mt-3"
      >
        <p className="text-xs font-medium text-black/50 italic">
          Or type your own prompt above to create a custom AI symphony
        </p>
      </motion.div>
    </motion.div>
  );
};

export default ExamplePrompts; 