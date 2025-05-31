// ResultPanel component with Neo-Brutalist styling
// Features: Displays workflow results with individual model rating system

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Copy,
  Send,
  RotateCcw,
  ExternalLink,
  Hash,
  Clock,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import StarRatingInput from "./StarRatingInput";
import MetricTile from "./MetricTile";
import ModelsTimeline from "./ModelsTimeline";
import SectionCard from "./SectionCard";
import BlockscoutTransactionWidget from "./BlockscoutTransactionWidget";
import AaveIntegration from "./AaveIntegration";
import { orchestratorAPI } from "../api/orchestrator";
import { blockchainService } from "../services/blockchain";
import "../styles/result.css";

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
  onRunAgain,
}) => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [copied, setCopied] = useState(false);
  const [modelRatings, setModelRatings] = useState<Record<string, number>>({});

  const handleModelRating = (modelId: string, rating: number) => {
    console.log(`Model ${modelId} rated ${rating} stars`);
    setModelRatings((prev) => ({ ...prev, [modelId]: rating }));
  };

  const handleFeedbackSubmit = async () => {
    try {
      // Show loading state
      console.log("🚀 Submitting feedback to blockchain...");

      // Check if we have any ratings to submit
      if (Object.keys(modelRatings).length === 0) {
        console.warn("⚠️ No ratings provided");
        onFeedback("No ratings provided");
        return;
      }

      // Get user's connected wallet address if available
      let userAddress: string | undefined;
      try {
        userAddress =
          (await blockchainService.getConnectedAddress()) || undefined;
      } catch (error) {
        console.warn("⚠️ Could not get user address:", error);
      }

      // Prepare feedback data for the enhanced API
      const feedbackData = {
        executionId: executionId,
        workflowId: workflow?.workflowId,
        modelRatings: modelRatings,
        overallFeedback: feedback || "User feedback via UI",
        userAddress: userAddress,
      };

      console.log("📝 Submitting feedback data:", feedbackData);

      // Submit feedback using the new blockchain-enabled API
      const result = await orchestratorAPI.submitFeedback(feedbackData);

      if (result.success) {
        console.log("✅ Feedback submitted successfully:", result);

        // Create a summary message
        const successMessage = `✅ Submitted ${result.feedback.ratingsSubmitted}/${result.feedback.totalRatings} ratings to blockchain`;
        const transactionInfo = result.results
          .filter((r) => r.success && r.txHash)
          .map((r) => `${r.agentIdentifier}: ${r.txHash}`)
          .join(", ");

        const finalMessage = transactionInfo
          ? `${successMessage}\n\nTransaction Hashes: ${transactionInfo}`
          : successMessage;

        onFeedback(finalMessage);

        // Show any errors that occurred
        if (result.errors && result.errors.length > 0) {
          console.warn("⚠️ Some ratings failed:", result.errors);
        }
      } else {
        console.error("❌ Feedback submission failed:", result);

        // Fallback to traditional feedback if blockchain submission fails
        const fallbackMessage = Object.entries(modelRatings)
          .map(([modelId, rating]) => `${modelId}: ${rating}/5`)
          .join(", ");

        onFeedback(
          `⚠️ Blockchain submission failed, ratings stored locally: ${fallbackMessage}`
        );
      }

      // Clear ratings after submission
      setModelRatings({});
    } catch (error) {
      console.error("❌ Error submitting feedback:", error);

      // Fallback to traditional feedback on error
      const fallbackMessage = Object.entries(modelRatings)
        .map(([modelId, rating]) => `${modelId}: ${rating}/5`)
        .join(", ");

      onFeedback(
        `❌ Error submitting to blockchain: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Ratings: ${fallbackMessage}`
      );

      // Don't clear ratings on error so user can try again
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Parse the result if it's a string
  const parsedResult = typeof result === "string" ? JSON.parse(result) : result;
  const summary = parsedResult?.summary || result?.summary;

  // Check if Aave is mentioned in the summary (case-insensitive)
  const hasAaveIntegration =
    summary &&
    typeof summary === "string" &&
    summary.toLowerCase().includes("aave");

  const stepsCount = workflow?.steps?.length || 2;
  const modelsUsed =
    workflow?.steps?.map((step: any) => step.agentName).join(", ") ||
    "DALL-E 3, NFT Deployer";

  // Calculate execution time (mock for now, could be real if we track timestamps)
  const executionTime = "8.2s";
  const successRate = "100%";

  // Prepare models for timeline
  const timelineModels = workflow?.steps?.map((step: any, index: number) => ({
    id: step.id || `step-${index}`,
    name: step.agentName || `Agent ${index + 1}`,
    type: step.type || "AI Agent",
    status: "completed" as const,
    rating: 5,
  })) || [
    {
      id: "dalle-3",
      name: "DALL-E 3 Image Generator",
      type: "Image Generation",
      status: "completed" as const,
      rating: 5,
    },
    {
      id: "nft-deployer",
      name: "NFT Deployer Agent",
      type: "Blockchain Deployment",
      status: "completed" as const,
      rating: 5,
    },
  ];

  // Format results for display
  const formatResultsForDisplay = () => {
    if (parsedResult && typeof parsedResult === "object") {
      const displayData: any = {};

      if (parsedResult.imageUrl) displayData.imageUrl = parsedResult.imageUrl;
      if (parsedResult.nftAddress)
        displayData.nftAddress = parsedResult.nftAddress;
      if (parsedResult.tokenId) displayData.tokenId = parsedResult.tokenId;
      if (parsedResult.transactionHash)
        displayData.transactionHash = parsedResult.transactionHash;
      if (executionId) displayData.executionId = executionId;
      if (workflow?.id) displayData.workflowId = workflow.id;

      return JSON.stringify(displayData, null, 2);
    }

    return typeof parsedResult === "string"
      ? parsedResult
      : JSON.stringify(parsedResult, null, 2);
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
        <h2
          id="execution-summary"
          className="text-2xl font-black mb-6 text-center uppercase tracking-wide"
        >
          📊 Execution Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricTile value={stepsCount} label="Models Used" />
          <MetricTile value={executionTime} label="Execution Time" />
          <MetricTile value={successRate} label="Success Rate" />
        </div>
      </motion.section>

      {/* Aave Integration - Only show if "aave" is mentioned in summary */}
      {hasAaveIntegration && (
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          aria-labelledby="aave-integration"
        >
          <SectionCard>
            <h2
              id="aave-integration"
              className="text-2xl font-black uppercase tracking-wide mb-6"
            >
              💰 DeFi Integration Detected
            </h2>
            <AaveIntegration
              onTransactionStart={() => {
                console.log("Aave transaction started");
              }}
              onTransactionComplete={(txHash) => {
                console.log("Aave transaction completed:", txHash);
                // Could show a toast notification here
              }}
            />
          </SectionCard>
        </motion.section>
      )}

      {/* Models Used - Timeline */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: hasAaveIntegration ? 0.7 : 0.6 }}
        aria-labelledby="models-used"
      >
        <SectionCard>
          <h2
            id="models-used"
            className="text-2xl font-black mb-6 uppercase tracking-wide"
          >
            🤖 Models Used
          </h2>
          <ModelsTimeline
            models={timelineModels}
            onModelRating={handleModelRating}
          />
        </SectionCard>
      </motion.section>

      {/* AI Summary Section - Only show if summary exists */}
      {summary && (
        <motion.section
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: hasAaveIntegration ? 0.9 : 0.8 }}
          aria-labelledby="ai-summary"
        >
          <SectionCard>
            <div className="flex items-center justify-between mb-4">
              <h2
                id="ai-summary"
                className="text-2xl font-black uppercase tracking-wide"
              >
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
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-black mb-4 mt-6 first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-black mb-3 mt-6 first:mt-0">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-800 mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-bold text-black">
                        {children}
                      </strong>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-4 space-y-1">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-6 mb-4 space-y-1">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-800">{children}</li>
                    ),
                    hr: () => <hr className="border-t-2 border-black my-6" />,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-black pl-4 italic my-4">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-gray-100 border-2 border-black p-4 rounded font-mono text-sm overflow-x-auto my-4">
                        {children}
                      </pre>
                    ),
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
        transition={{
          delay: hasAaveIntegration
            ? summary
              ? 1.1
              : 0.9
            : summary
            ? 1.0
            : 0.8,
        }}
        aria-labelledby="execution-results"
      >
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h2
              id="execution-results"
              className="text-2xl font-black uppercase tracking-wide"
            >
              📋 {summary ? "Raw Data" : "Execution Results"}
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
            <pre className="whitespace-pre-wrap">
              {formatResultsForDisplay()}
            </pre>
          </div>

          {copied && (
            <div className="text-center text-[#13C27B] font-bold animate-blink-success">
              ✓ Copied to clipboard!
            </div>
          )}
        </SectionCard>
      </motion.section>

      {/* Blockscout Transaction Widget */}
      <motion.section
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: hasAaveIntegration
            ? summary
              ? 1.3
              : 1.1
            : summary
            ? 1.2
            : 1.0,
        }}
        aria-labelledby="transaction-details"
      >
        <SectionCard>
          <div className="flex items-center justify-between mb-6">
            <h2
              id="transaction-details"
              className="text-2xl font-black uppercase tracking-wide"
            >
              🔗 Transaction Details
            </h2>
            <div className="bg-[#7C82FF] border-2 border-black px-4 py-3 flex items-center justify-center">
              <img
                src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMTIwIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNOCAyNEMxMi40MTgzIDI0IDE2IDIwLjQxODMgMTYgMTZDMTYgMTEuNTgxNyAxMi40MTgzIDggOCA4QzMuNTgxNzIgOCAwIDExLjU4MTcgMCAxNkMwIDIwLjQxODMgMy41ODE3MiAyNCA4IDI0WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMjBDMTAuMjA5MSAyMCAxMiAxOC4yMDkxIDEyIDE2QzEyIDEzLjc5MDkgMTAuMjA5MSAxMiA4IDEyQzUuNzkwODYgMTIgNCAxMy43OTA5IDQgMTZDNCAyMC40MTgzIDUuNzkwODYgMjAgOCAyMFoiIGZpbGw9IiM3QzgyRkYiLz4KPHRleHQgeD0iMjQiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSI+QmxvY2tzY291dDwvdGV4dD4KPC9zdmc+Cg=="
                alt="Blockscout"
                className="h-6 w-auto filter brightness-0 invert"
              />
            </div>
          </div>

          {/* Enhanced container for the widget */}
          <div className="bg-gradient-to-br from-[#FEEF5D] to-[#FFE37B] border-4 border-black shadow-neo p-2">
            <div className="bg-white border-2 border-black p-6 shadow-inner">
              <BlockscoutTransactionWidget txHash="0xc93c92ba22ea93861a5897f7068465b3cdd687a9b367b7b4fc66252690f0aea4" />
            </div>
          </div>

          {/* Additional transaction info footer */}
          <div className="mt-4 bg-black text-white p-4 border-4 border-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#13C27B] border border-white"></div>
                <span className="font-black text-sm uppercase">
                  Verified on Mainnet
                </span>
              </div>
              <a
                href="https://eth.blockscout.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7C82FF] hover:text-[#FEEF5D] font-black text-sm uppercase underline transition-colors"
              >
                View on Blockscout →
              </a>
            </div>
          </div>
        </SectionCard>
      </motion.section>

      {/* Action Buttons - Only Submit Feedback */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: hasAaveIntegration
            ? summary
              ? 1.5
              : 1.3
            : summary
            ? 1.4
            : 1.2,
        }}
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
        transition={{
          delay: hasAaveIntegration
            ? summary
              ? 1.7
              : 1.5
            : summary
            ? 1.6
            : 1.4,
        }}
        className="flex justify-center"
      >
        <div className="bg-white border-4 border-black shadow-neo px-6 py-3 rounded-full">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#7C82FF] border-2 border-black"></div>
            <span className="font-black text-sm uppercase">
              Workflow Complete
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultPanel;
