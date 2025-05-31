// ResultPanel component with Neo-Brutalist styling
// Features: Displays workflow results with individual model rating system

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Copy, Send, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import StarRatingInput from './StarRatingInput';
import MetricTile from './MetricTile';
import ModelsTimeline from './ModelsTimeline';
import SectionCard from './SectionCard';
import '../styles/result.css';

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
  const [rating, setRating] = useState(0);
  const [copied, setCopied] = useState(false);
  const [modelRatings, setModelRatings] = useState<Record<string, number>>({});

  const handleModelRating = (modelId: string, rating: number) => {
    console.log(`Model ${modelId} rated ${rating} stars`);
    setModelRatings(prev => ({ ...prev, [modelId]: rating }));
  };

  const handleFeedbackSubmit = () => {
    // Collect all model ratings and create feedback
    const ratingsText = Object.entries(modelRatings)
      .map(([modelId, rating]) => `${modelId}: ${rating}/5`)
      .join(', ');
    
    const feedbackText = ratingsText 
      ? `Model Ratings: ${ratingsText}` 
      : 'No ratings provided';
    
    onFeedback(feedbackText);
    setModelRatings({});
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
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

  // Prepare models for timeline
  const timelineModels = workflow?.steps?.map((step: any, index: number) => ({
    id: step.id || `step-${index}`,
    name: step.agentName || `Agent ${index + 1}`,
    type: step.type || 'AI Agent',
    status: 'completed' as const,
    rating: 5
  })) || [
    {
      id: 'dalle-3',
      name: 'DALL-E 3 Image Generator',
      type: 'Image Generation',
      status: 'completed' as const,
      rating: 5
    },
    {
      id: 'nft-deployer',
      name: 'NFT Deployer Agent',
      type: 'Blockchain Deployment',
      status: 'completed' as const,
      rating: 5
    }
  ];

  // Get summary from result if available
  const summary = parsedResult?.summary || result?.summary;
  
  // Format results for display
  const formatResultsForDisplay = () => {
    if (parsedResult && typeof parsedResult === 'object') {
      const displayData: any = {};
      
      if (parsedResult.imageUrl) displayData.imageUrl = parsedResult.imageUrl;
      if (parsedResult.nftAddress) displayData.nftAddress = parsedResult.nftAddress;
      if (parsedResult.tokenId) displayData.tokenId = parsedResult.tokenId;
      if (parsedResult.transactionHash) displayData.transactionHash = parsedResult.transactionHash;
      if (executionId) displayData.executionId = executionId;
      if (workflow?.id) displayData.workflowId = workflow.id;
      
      return JSON.stringify(displayData, null, 2);
    }
    
    return typeof parsedResult === 'string' ? parsedResult : JSON.stringify(parsedResult, null, 2);
  };

  return (
    <div className="max-w-screen-lg mx-auto px-6 md:px-10 py-16 space-y-8">
      {/* Headline */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-2 mb-4">
          <CheckCircle className="h-12 w-12 text-[#13C27B] animate-blink-success" />
          WORKFLOW COMPLETE
        </h1>
        <p className="text-lg font-bold text-black/70 uppercase tracking-wide">
          AI Models Successfully Executed
        </p>
      </motion.div>

      {/* Execution Summary - Metric Tiles */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        aria-labelledby="execution-summary"
      >
        <h2 id="execution-summary" className="text-2xl font-black mb-6 text-center uppercase tracking-wide">
          📊 Execution Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricTile value={stepsCount} label="Models Used" />
          <MetricTile value={executionTime} label="Execution Time" />
          <MetricTile value={successRate} label="Success Rate" />
        </div>
      </motion.section>

      {/* Models Used - Timeline */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        aria-labelledby="models-used"
      >
        <SectionCard>
          <h2 id="models-used" className="text-2xl font-black mb-6 uppercase tracking-wide">
            🤖 Models Used
          </h2>
          <ModelsTimeline models={timelineModels} onModelRating={handleModelRating} />
        </SectionCard>
      </motion.section>

      {/* AI Summary Section - Only show if summary exists */}
      {summary && (
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          aria-labelledby="ai-summary"
        >
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <h2 id="ai-summary" className="text-2xl font-black uppercase tracking-wide">
                🤖 AI Summary
              </h2>
              <button
                onClick={() => copyToClipboard(summary)}
                className="copy-btn p-2 bg-white border-4 border-black shadow-neo transition-all duration-150"
                aria-label="Copy summary to clipboard"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
            
            <div className="bg-white border-4 border-black p-6">
              <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:tracking-wide prose-h1:text-2xl prose-h1:mb-4 prose-h2:text-xl prose-h2:mb-3 prose-h2:mt-6 prose-h3:text-lg prose-h3:mb-2 prose-h3:mt-4 prose-p:text-gray-800 prose-p:mb-4 prose-p:leading-relaxed prose-strong:font-bold prose-ul:list-disc prose-ul:mb-4 prose-ol:list-decimal prose-ol:mb-4 prose-li:text-gray-800 prose-li:mb-1">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-black mb-4 mt-6 first:mt-0">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-black mb-3 mt-6 first:mt-0">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>,
                    p: ({children}) => <p className="text-gray-800 mb-4 leading-relaxed">{children}</p>,
                    strong: ({children}) => <strong className="font-bold text-black">{children}</strong>,
                    ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-gray-800">{children}</li>,
                    hr: () => <hr className="border-t-2 border-black my-6" />,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-black pl-4 italic my-4">{children}</blockquote>,
                    code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{children}</code>,
                    pre: ({children}) => <pre className="bg-gray-100 border-2 border-black p-4 rounded font-mono text-sm overflow-x-auto my-4">{children}</pre>
                  }}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          </SectionCard>
        </motion.section>
      )}

      {/* Execution Results - Raw Data */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: summary ? 1.0 : 0.8 }}
        aria-labelledby="execution-results"
      >
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h2 id="execution-results" className="text-2xl font-black uppercase tracking-wide">
              📋 {summary ? 'Raw Data' : 'Execution Results'}
            </h2>
            <button
              onClick={() => copyToClipboard(formatResultsForDisplay())}
              className="copy-btn p-2 bg-white border-4 border-black shadow-neo transition-all duration-150"
              aria-label="Copy results to clipboard"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
          
          <div className="bg-gray-50 border-4 border-black p-4 font-mono text-sm overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap">{formatResultsForDisplay()}</pre>
          </div>
          
          {copied && (
            <div className="text-center text-[#13C27B] font-bold animate-blink-success">
              ✓ Copied to clipboard!
            </div>
          )}
        </SectionCard>
      </motion.section>

      {/* Action Buttons - Only Submit Feedback */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: summary ? 1.4 : 1.2 }}
        className="flex justify-center"
      >
        <button 
          onClick={handleFeedbackSubmit}
          className="btn-brutalist inline-flex items-center justify-center gap-3 bg-[#7C82FF] text-white font-black uppercase text-sm px-8 py-4 border-4 border-black shadow-neo transition-all duration-150"
        >
          <Send className="h-5 w-5" />
          <span>Submit Feedback</span>
        </button>
      </motion.div>

      {/* Step Indicator (if needed) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: summary ? 1.6 : 1.4 }}
        className="flex justify-center"
      >
        <div className="bg-white border-4 border-black shadow-neo px-6 py-3 rounded-full">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#7C82FF] border-2 border-black"></div>
            <span className="font-black text-sm uppercase">Workflow Complete</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultPanel; 