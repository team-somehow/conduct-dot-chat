// CostEstimation component with Neo-Brutalist styling
// Features: Shows selected models with cost breakdown and approval mechanism

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, DollarSign } from 'lucide-react';
import StarRating from './StarRating';

interface Model {
  id: string;
  name: string;
  type: string;
  color: string;
  description?: string;
  rating?: number;
  cost?: string;
}

interface CostEstimationProps {
  models: Model[];
  onApprove: () => void;
}

const CostEstimation: React.FC<CostEstimationProps> = ({ models, onApprove }) => {
  // Calculate total estimated cost (simplified calculation)
  const calculateTotalCost = () => {
    let total = 0;
    models.forEach(model => {
      if (model.cost) {
        const costMatch = model.cost.match(/\$(\d+\.?\d*)/);
        if (costMatch) {
          total += parseFloat(costMatch[1]);
        }
      }
    });
    return total.toFixed(2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black mb-4">
          Cost Estimation
        </h2>
        <p className="text-lg font-bold text-black/70 uppercase">
          Review selected AI models and approve workflow execution
        </p>
      </motion.div>

      {/* Selected Models */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-black uppercase tracking-tight text-black mb-4">
          Selected Models
        </h3>
        
        {models.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="bg-white border-4 border-black shadow-neo p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div 
                    className="w-4 h-4 border-2 border-black"
                    style={{ backgroundColor: model.color }}
                  />
                  <h4 className="text-lg font-black uppercase tracking-tight text-black">
                    {model.name}
                  </h4>
                  <span className="text-sm font-bold text-gray-600 uppercase">
                    {model.type}
                  </span>
                </div>
                
                {model.description && (
                  <p className="text-sm font-medium text-black/70 mb-3">
                    {model.description}
                  </p>
                )}
                
                {model.rating && (
                  <div className="mb-2">
                    <StarRating rating={model.rating} size={16} />
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="bg-[#FEEF5D] border-3 border-black shadow-neo px-4 py-2">
                  <p className="text-lg font-black text-black">
                    {model.cost || 'Custom Pricing'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Cost Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-[#FF5484] border-4 border-black shadow-neo-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-black" />
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight text-black">
                Estimated Total Cost
              </h3>
              <p className="text-sm font-bold text-black/70 uppercase">
                Per execution cycle
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-white border-3 border-black shadow-neo px-6 py-3">
              <p className="text-2xl font-black text-black">
                ${calculateTotalCost()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Approval Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="text-center"
      >
        <div className="bg-white border-4 border-black shadow-neo p-8">
          <h3 className="text-xl font-black uppercase tracking-tight text-black mb-4">
            Ready to Execute Workflow?
          </h3>
          <p className="text-sm font-medium text-black/70 mb-6">
            By approving, you authorize the execution of this AI workflow with the selected models.
          </p>
          
          <button
            onClick={onApprove}
            className="inline-flex items-center space-x-3 bg-[#7C82FF] text-white font-black uppercase text-lg px-8 py-4 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150"
          >
            <CheckCircle className="h-6 w-6" />
            <span>Approve & Execute</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CostEstimation; 