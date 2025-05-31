import React from 'react';

interface ModelCardData {
  name: string;
  category: string;
  description: string;
  icon: string;
}

const modelData: ModelCardData[] = [
  { name: 'GPT-4', category: 'Language', description: 'Advanced text generation', icon: '🧠' },
  { name: 'DALL-E 3', category: 'Image', description: 'Creative image synthesis', icon: '🎨' },
  { name: 'Whisper', category: 'Audio', description: 'Speech recognition', icon: '🎤' },
  { name: 'Claude', category: 'Analysis', description: 'Deep reasoning', icon: '🔍' },
  { name: 'Midjourney', category: 'Art', description: 'Artistic generation', icon: '🖼️' },
  { name: 'Stable Diffusion', category: 'Image', description: 'Open-source imaging', icon: '⚡' },
  { name: 'CodeT5', category: 'Code', description: 'Code generation', icon: '💻' },
  { name: 'BERT', category: 'NLP', description: 'Text understanding', icon: '📝' },
];

const ModelCard: React.FC<{ model: ModelCardData }> = ({ model }) => (
  <div className="inline-block min-w-[220px] bg-white border-4 border-black shadow-neo p-4 mx-2">
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="w-12 h-12 bg-[#7C82FF] border-3 border-black flex items-center justify-center text-xl">
        {model.icon}
      </div>
      <h4 className="font-black text-black uppercase text-sm tracking-tight">
        {model.name}
      </h4>
      <span className="text-xs font-bold bg-[#FFE37B] border-2 border-black px-2 py-1 uppercase">
        {model.category}
      </span>
      <p className="text-xs text-black font-medium leading-tight">
        {model.description}
      </p>
    </div>
  </div>
);

const TickerTape = () => {
  // Duplicate the array multiple times to create seamless loop
  const duplicatedModels = [...modelData, ...modelData, ...modelData];

  return (
    <section className="bg-[#FF5484] border-y-4 border-black overflow-hidden py-16">
      <div className="px-[clamp(1.5rem,6vw,4rem)] mb-8">
        <h2 className="text-center text-3xl md:text-4xl font-black text-black uppercase tracking-tight">
          Powered by Leading AI Models
        </h2>
      </div>
      
      <div className="whitespace-nowrap">
        <div className="marquee flex">
          {duplicatedModels.map((model, index) => (
            <ModelCard key={`${model.name}-${index}`} model={model} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TickerTape; 