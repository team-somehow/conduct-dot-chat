import React, { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../store/workflow';

const InteractionTerminal: React.FC = () => {
  const { logLines } = useWorkflowStore();
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logLines]);

  return (
    <div className="w-80 bg-black border-4 border-black shadow-neo">
      {/* Terminal Header */}
      <div className="bg-white border-b-4 border-black p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-black uppercase">AI TERMINAL</span>
        </div>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-red-500 border border-black"></div>
          <div className="w-3 h-3 bg-yellow-500 border border-black"></div>
          <div className="w-3 h-3 bg-green-500 border border-black"></div>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="h-96 p-4 overflow-y-auto bg-black text-green-400 font-mono text-sm"
      >
        <div className="mb-2 text-gray-400">
          AI Workflow Terminal v1.0
        </div>
        <div className="mb-2 text-gray-400">
          Waiting for interaction...
        </div>
        <div className="mb-4 text-green-400">
          $&gt; _
        </div>

        {/* Log entries */}
        {logLines.map((log) => (
          <div key={log.id} className="mb-1 flex">
            <span className="text-gray-400 mr-2">
              [{log.timestamp}]
            </span>
            <span className={
              log.type === 'success' ? 'text-green-400' :
              log.type === 'error' ? 'text-red-400' :
              'text-blue-400'
            }>
              {log.message}
            </span>
          </div>
        ))}

        {/* Cursor */}
        <div className="flex items-center mt-2">
          <span className="text-green-400">$&gt;</span>
          <span className="ml-1 w-2 h-4 bg-green-400 animate-pulse"></span>
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="bg-white border-t-4 border-black p-2 text-center">
        <span className="text-xs font-bold uppercase">
          {logLines.length} LOG ENTRIES
        </span>
      </div>
    </div>
  );
};

export default InteractionTerminal; 