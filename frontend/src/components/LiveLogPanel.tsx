import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowStore } from '../store/workflow';
import '../styles/execution.css';

const LiveLogPanel: React.FC = () => {
  const { logs } = useWorkflowStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'info':
      default:
        return 'text-[#13C27B]';
    }
  };

  return (
    <div className="w-full h-[200px] bg-black border-4 border-black shadow-neo-lg mt-4">
      <div className="h-full p-4 overflow-y-auto console-log" ref={scrollRef}>
        <motion.div layout>
          <AnimatePresence initial={false}>
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`mb-1 font-mono text-sm ${getLogColor(log.type)}`}
              >
                <span className="text-gray-500">
                  [{formatTimestamp(log.timestamp)}]
                </span>{' '}
                <span>{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveLogPanel; 