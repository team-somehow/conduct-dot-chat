import React from 'react';
import { motion } from 'framer-motion';

interface AgentCardData {
  name: string;
  category: string;
  description: string;
  icon: string;
  specialty: string;
  accent: string;
  rating: number;
}

const agentData: AgentCardData[] = [
  { 
    name: 'DataMaestro', 
    category: 'Analytics', 
    description: 'Orchestrates complex data analysis workflows', 
    icon: '📊', 
    specialty: 'Business Intelligence',
    accent: '#FEEF5D',
    rating: 4.9
  },
  { 
    name: 'CodeConductor', 
    category: 'Development', 
    description: 'Directs code generation and debugging symphonies', 
    icon: '🎼', 
    specialty: 'Software Engineering',
    accent: '#7C82FF',
    rating: 4.8
  },
  { 
    name: 'ContentMaestro', 
    category: 'Creative', 
    description: 'Harmonizes creative writing and content creation', 
    icon: '🎭', 
    specialty: 'Content Strategy',
    accent: '#FF5484',
    rating: 4.7
  },
  { 
    name: 'VoiceVirtuoso', 
    category: 'Audio', 
    description: 'Conducts speech synthesis and audio processing', 
    icon: '🎵', 
    specialty: 'Audio Production',
    accent: '#A8E6CF',
    rating: 4.6
  },
  { 
    name: 'VisualDirector', 
    category: 'Visual', 
    description: 'Orchestrates image and video generation workflows', 
    icon: '🎬', 
    specialty: 'Visual Arts',
    accent: '#FFB3BA',
    rating: 4.5
  },
  { 
    name: 'SentimentSymphony', 
    category: 'Analysis', 
    description: 'Harmonizes emotion and sentiment understanding', 
    icon: '🎯', 
    specialty: 'Emotional Intelligence',
    accent: '#BFEFFF',
    rating: 4.4
  },
  { 
    name: 'BlockchainBaton', 
    category: 'Blockchain', 
    description: 'Conducts decentralized workflows and smart contracts', 
    icon: '⛓️', 
    specialty: 'Web3 Integration',
    accent: '#FFE37B',
    rating: 4.3
  },
  { 
    name: 'AutomationAce', 
    category: 'Workflow', 
    description: 'Orchestrates complex automation sequences', 
    icon: '🤖', 
    specialty: 'Process Automation',
    accent: '#C8A8E9',
    rating: 4.2
  },
];

const AgentCard: React.FC<{ agent: AgentCardData; index: number }> = ({ agent, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="min-w-[280px] bg-white border-4 border-black shadow-neo p-6 flex-shrink-0 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150 group"
  >
    <div className="flex flex-col space-y-4">
      {/* Header with icon and accent */}
      <div className="flex items-center justify-between">
        <div 
          className="w-14 h-14 border-4 border-black flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-150"
          style={{ backgroundColor: agent.accent }}
        >
          {agent.icon}
        </div>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <span 
              key={i} 
              className={`text-sm ${i < Math.floor(agent.rating) ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
          <span className="text-xs font-bold text-black ml-1">{agent.rating}</span>
        </div>
      </div>

      {/* Agent name and category */}
      <div className="space-y-2">
        <h4 className="font-black text-black uppercase text-lg tracking-tight leading-tight">
          {agent.name}
        </h4>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold bg-black text-white px-3 py-1 uppercase tracking-wide">
            {agent.category}
          </span>
          <span className="text-xs font-medium text-gray-600 uppercase">
            {agent.specialty}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-black font-medium leading-relaxed">
        {agent.description}
      </p>

      {/* Status indicator */}
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-green-500 border-2 border-black rounded-full animate-pulse"></div>
        <span className="text-xs font-bold text-green-700 uppercase">Active & Ready</span>
      </div>
    </div>
  </motion.div>
);

const AgentMarquee = () => {
  const [isPaused, setIsPaused] = React.useState(false);
  
  // Duplicate the array to create seamless loop
  const duplicatedAgents = [...agentData, ...agentData];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-[#FF5484] via-[#FF6F9C] to-[#7C82FF] border-b-4 border-black relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-4 border-black rotate-12"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-4 border-black -rotate-12"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 border-4 border-black rotate-45"></div>
        <div className="absolute bottom-32 right-1/3 w-24 h-24 border-4 border-black -rotate-45"></div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 mb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-4"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black uppercase tracking-tight">
            Meet Your AI Orchestra
          </h2>
          <p className="text-lg md:text-xl font-bold text-black/80 max-w-2xl mx-auto">
            Each agent is a virtuoso in their domain, ready to perform under your direction
          </p>
        </motion.div>
      </div>
      
      <div 
        className="marquee-container relative z-10"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        data-paused={isPaused}
      >
        <div 
          className={`marquee-content ${isPaused ? '' : 'marquee'}`}
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {duplicatedAgents.map((agent, index) => (
            <AgentCard key={`${agent.name}-${index}`} agent={agent} index={index % agentData.length} />
          ))}
        </div>
      </div>

      {/* Call to action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center mt-12 relative z-10"
      >
        <p className="text-lg font-bold text-black/90 mb-4">
          Ready to conduct your own AI symphony?
        </p>
        <button className="bg-white text-black font-black uppercase px-8 py-4 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150 text-lg tracking-tight">
          Start Conducting →
        </button>
      </motion.div>
    </section>
  );
};

export default AgentMarquee; 