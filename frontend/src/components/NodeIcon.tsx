import React from 'react';
import { Bot, Image, Coins, Zap, MessageSquare, Palette } from 'lucide-react';

interface NodeIconProps {
  modelType: string;
  icon?: string;
  className?: string;
}

const NodeIcon: React.FC<NodeIconProps> = ({ modelType, icon, className = "h-6 w-6" }) => {
  // If custom icon is provided (emoji or icon key), use it
  if (icon) {
    // Check if it's an emoji (simple check for unicode characters)
    if (/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(icon)) {
      return <span className="text-sm leading-none flex-shrink-0">{icon}</span>;
    }
  }

  // Default icons based on model type
  const getIconByType = () => {
    // Add null check for modelType
    if (!modelType || typeof modelType !== 'string') {
      return <Zap className={className} />;
    }
    
    const type = modelType.toLowerCase();
    
    if (type.includes('orchestrator') || type.includes('coordinator')) {
      return <Bot className={className} />;
    }
    
    if (type.includes('image') || type.includes('dall') || type.includes('stable') || type.includes('midjourney')) {
      return <Image className={className} />;
    }
    
    if (type.includes('nft') || type.includes('deploy') || type.includes('mint') || type.includes('blockchain')) {
      return <Coins className={className} />;
    }
    
    if (type.includes('hello') || type.includes('greet') || type.includes('message') || type.includes('chat')) {
      return <MessageSquare className={className} />;
    }
    
    if (type.includes('art') || type.includes('creative') || type.includes('design')) {
      return <Palette className={className} />;
    }
    
    // Default fallback
    return <Zap className={className} />;
  };

  return getIconByType();
};

export default NodeIcon; 