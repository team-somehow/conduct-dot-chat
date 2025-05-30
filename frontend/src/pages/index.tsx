// Landing page with prompt entry interface
// Features: Large text input for AI task description, animated background, and clear CTA
import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-center mb-4 sm:mb-6 lg:mb-8 leading-tight">
            AI Orchestrator & Marketplace
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Transform your ideas into powerful AI workflows with our intelligent orchestration platform
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 sm:p-6 lg:p-8 shadow-xl">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="task-input" className="block text-sm font-medium text-gray-700 mb-2">
                Describe your AI task
              </label>
              <textarea
                id="task-input"
                className="w-full h-24 sm:h-32 lg:h-40 p-3 sm:p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="Describe your AI task here... For example: 'Analyze customer feedback and generate a summary report' or 'Create a content moderation workflow for social media posts'"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button className="flex-1 bg-blue-600 text-white py-3 sm:py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm sm:text-base">
                Generate Workflow
              </button>
              <button className="flex-1 sm:flex-initial bg-gray-100 text-gray-700 py-3 sm:py-4 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base">
                Browse Templates
              </button>
            </div>
          </div>
          
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">100+</div>
                <div className="text-xs sm:text-sm text-gray-600">AI Models</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">50k+</div>
                <div className="text-xs sm:text-sm text-gray-600">Workflows Created</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">99.9%</div>
                <div className="text-xs sm:text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-xs sm:text-sm text-gray-500 mb-4">
            Trusted by developers and businesses worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 opacity-60">
            <div className="text-sm sm:text-base font-semibold text-gray-400">TechCorp</div>
            <div className="text-sm sm:text-base font-semibold text-gray-400">StartupX</div>
            <div className="text-sm sm:text-base font-semibold text-gray-400">InnovateLab</div>
            <div className="text-sm sm:text-base font-semibold text-gray-400">DataFlow</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 