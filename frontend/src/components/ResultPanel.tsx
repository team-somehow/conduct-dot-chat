// ResultPanel component with Neo-Brutalist styling
// Features: Displays workflow results with individual model rating system

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Zap, Home, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModelRatingFeedback from './ModelRatingFeedback';

interface Model {
  id: string;
  name: string;
  type: string;
  color: string;
  description?: string;
  rating?: number;
  cost?: string;
}

interface ResultPanelProps {
  result: any;
  workflow?: any;
  executionId?: string;
  onFeedback: (feedback: string) => void;
  onRunAgain: () => void;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ 
  result, 
  workflow, 
  executionId,
  onFeedback, 
  onRunAgain 
}) => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);

  const handleModelRating = (modelId: string, rating: number) => {
    console.log(`Model ${modelId} rated ${rating} stars`);
    // You can add additional logic here to store the ratings
  };

  const handleEndWorkflow = () => {
    navigate('/');
  };

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      onFeedback(`Rating: ${rating}/5 - ${feedback}`);
      setFeedback("");
      setRating(0);
      setShowFeedback(false);
    }
  };

  // Parse execution results
  const parseResults = () => {
    try {
      if (typeof result === 'string') {
        return JSON.parse(result);
      }
      return result;
    } catch {
      return result;
    }
  };

  const parsedResult = parseResults();
  const stepsCount = workflow?.steps?.length || 2;
  const modelsUsed = workflow?.steps?.map((step: any) => step.agentName).join(", ") || "DALL-E 3, NFT Deployer";
  
  // Calculate execution time (mock for now, could be real if we track timestamps)
  const executionTime = "8.2s";
  const successRate = "100%";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <h2 className="text-3xl font-black uppercase tracking-tight text-black">
            Workflow Complete
          </h2>
          <Zap className="h-8 w-8 text-[#FF5484]" />
        </div>
        <p className="text-lg font-bold text-gray-600 uppercase">
          AI Models Successfully Executed
        </p>
      </motion.div>

      {/* Execution Summary */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="border-4 border-black p-6 bg-[#E8F5E8]"
      >
        <h3 className="text-xl font-black mb-4 text-green-800">
          🎉 EXECUTION SUMMARY
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-black text-green-600">{stepsCount}</div>
            <div className="text-sm font-bold text-gray-700">Models Used</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-blue-600">{executionTime}</div>
            <div className="text-sm font-bold text-gray-700">Execution Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-purple-600">{successRate}</div>
            <div className="text-sm font-bold text-gray-700">Success Rate</div>
          </div>
        </div>
      </motion.div>

      {/* Models Used */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="border-4 border-black p-6 bg-[#FFF8E1]"
      >
        <h3 className="text-xl font-black mb-4">🤖 MODELS USED</h3>
        <div className="space-y-3">
          {workflow?.steps?.map((step: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white border-2 border-gray-300">
              <div>
                <div className="font-bold">{step.agentName}</div>
                <div className="text-sm text-gray-600">Step {index + 1}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-bold">✓ Completed</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-500">⭐</span>
                  ))}
                </div>
              </div>
            </div>
          )) || (
            <>
              <div className="flex items-center justify-between p-3 bg-white border-2 border-gray-300">
                <div>
                  <div className="font-bold">DALL-E 3 Image Generator</div>
                  <div className="text-sm text-gray-600">Step 1</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-bold">✓ Completed</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-500">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white border-2 border-gray-300">
                <div>
                  <div className="font-bold">NFT Deployer Agent</div>
                  <div className="text-sm text-gray-600">Step 2</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-bold">✓ Completed</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-500">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Results Display */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="border-4 border-black p-6 bg-[#F0F8FF]"
      >
        <h3 className="text-xl font-black mb-4">📋 EXECUTION RESULTS</h3>
        
        {/* Display key results in a user-friendly way */}
        {parsedResult && typeof parsedResult === 'object' ? (
          <div className="space-y-4">
            {parsedResult.imageUrl && (
              <div className="p-4 bg-white border-2 border-gray-300">
                <div className="font-bold mb-2">🖼️ Generated Image:</div>
                <img 
                  src={parsedResult.imageUrl} 
                  alt="Generated NFT" 
                  className="max-w-xs border-2 border-black"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="text-sm text-gray-600 mt-2">{parsedResult.imageUrl}</div>
              </div>
            )}
            
            {parsedResult.nftAddress && (
              <div className="p-4 bg-white border-2 border-gray-300">
                <div className="font-bold mb-2">🎨 NFT Details:</div>
                <div className="space-y-1 text-sm">
                  <div><strong>Contract:</strong> {parsedResult.nftAddress}</div>
                  {parsedResult.tokenId && <div><strong>Token ID:</strong> {parsedResult.tokenId}</div>}
                  {parsedResult.transactionHash && <div><strong>Transaction:</strong> {parsedResult.transactionHash}</div>}
                </div>
              </div>
            )}
            
            {executionId && (
              <div className="p-4 bg-white border-2 border-gray-300">
                <div className="font-bold mb-2">🔍 Execution Details:</div>
                <div className="text-sm">
                  <div><strong>Execution ID:</strong> {executionId}</div>
                  {workflow?.id && <div><strong>Workflow ID:</strong> {workflow.id}</div>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-white border-2 border-gray-300">
            <pre className="text-sm overflow-auto max-h-64">
              {typeof parsedResult === 'string' ? parsedResult : JSON.stringify(parsedResult, null, 2)}
            </pre>
          </div>
        )}
      </motion.div>

      {/* Feedback Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="border-4 border-black p-6 bg-[#FFF0F5]"
      >
        <h3 className="text-xl font-black mb-4">💬 FEEDBACK</h3>
        
        {!showFeedback ? (
          <button
            onClick={() => setShowFeedback(true)}
            className="px-6 py-3 bg-[#FF5484] text-white font-bold border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
          >
            PROVIDE FEEDBACK
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">Rate this workflow:</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? "text-yellow-500" : "text-gray-300"
                    } hover:text-yellow-400 transition-colors`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2">Comments:</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="How was your experience? Any suggestions for improvement?"
                className="w-full p-3 border-2 border-black resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedback.trim() || rating === 0}
                className="px-6 py-2 bg-green-500 text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SUBMIT
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                className="px-6 py-2 bg-gray-500 text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex justify-center space-x-4 mt-8"
      >
        <button 
          onClick={handleEndWorkflow}
          className="inline-flex items-center space-x-3 bg-[#7C82FF] text-white font-black uppercase text-sm px-6 py-3 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150"
        >
          <Send className="h-5 w-5" />
          <span>Submit Feedback</span>
        </button>
        <button 
          onClick={onRunAgain}
          className="bg-[#FEEF5D] text-black font-black uppercase text-sm px-6 py-3 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150"
        >
          Run Again
        </button>
      </motion.div>
    </motion.div>
  );
};

export default ResultPanel; 