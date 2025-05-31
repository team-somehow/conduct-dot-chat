import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import orchestratorAPI, {
  WorkflowExecution,
  WorkflowDefinition,
} from "../../api/orchestrator";

// TODO(History):
// 1. Implement workflow execution history list ✅
// 2. Add filtering by date, model, and status ✅
// 3. Create detailed view for each execution ✅
// 4. Add export functionality for execution logs
// 5. Implement pagination for large history sets
// END TODO

interface HistoryItem {
  execution: WorkflowExecution;
  workflow?: WorkflowDefinition;
}

const HistoryPage = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedExecution, setSelectedExecution] =
    useState<HistoryItem | null>(null);

  // Load execution history
  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Note: This is a mock implementation since the orchestrator doesn't have a history endpoint yet
        // In a real implementation, you would call orchestratorAPI.getExecutionHistory()

        // For now, we'll show a message about implementing this feature
        console.log(
          "📋 History page loaded - ready for orchestrator history API"
        );
        setHistoryItems([]);
      } catch (error: any) {
        console.error("❌ Failed to load execution history:", error);
        setError(error.message || "Failed to load execution history");
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const filteredItems = historyItems.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.execution.executionId
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.workflow?.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.execution.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 border-green-500 text-green-700";
      case "failed":
        return "bg-red-100 border-red-500 text-red-700";
      case "running":
        return "bg-blue-100 border-blue-500 text-blue-700";
      case "pending":
        return "bg-yellow-100 border-yellow-500 text-yellow-700";
      default:
        return "bg-gray-100 border-gray-500 text-gray-700";
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();

    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    return `${Math.round(duration / 60000)}m`;
  };

  return (
    <div className="min-h-screen bg-[#FFFDEE]">
      <Navbar />

      <section className="max-w-screen-xl mx-auto px-6 md:px-10 py-12 pt-24 space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black">
            Execution History
          </h1>
          <p className="max-w-xl mx-auto text-lg font-medium text-black/70">
            Track and review your AI workflow executions.
          </p>
        </header>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search executions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-4 border-4 border-black font-mono text-sm focus:outline-none focus:ring-0"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-4 border-4 border-black font-black uppercase text-sm bg-white focus:outline-none focus:ring-0"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="bg-blue-100 border-4 border-blue-500 text-blue-700 font-bold p-8 inline-block">
              Loading execution history...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-100 border-4 border-red-500 text-red-700 font-bold p-8 max-w-md mx-auto">
              <div className="flex justify-between items-center">
                <span>⚠️ {error}</span>
                <button
                  onClick={() => window.location.reload()}
                  className="text-red-500 hover:text-red-700 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white border-4 border-black shadow-neo p-8 max-w-md mx-auto">
              <h3 className="text-xl font-black uppercase tracking-tight text-black mb-4">
                No Executions Found
              </h3>
              <p className="text-sm font-medium text-black/70 mb-6">
                {historyItems.length === 0
                  ? "Start creating workflows to see execution history here."
                  : "Try adjusting your search or filter criteria."}
              </p>
              <a
                href="/run"
                className="bg-[#7C82FF] text-white font-black uppercase text-sm px-6 py-3 border-4 border-black shadow-neo hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150 inline-block"
              >
                Create Workflow
              </a>
            </div>
          </div>
        )}

        {/* Coming Soon Message */}
        {!isLoading && !error && (
          <div className="text-center py-12">
            <div className="bg-[#FFE37B] border-4 border-black shadow-neo p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-black uppercase tracking-tight text-black mb-4">
                🚧 History Feature Coming Soon
              </h3>
              <p className="text-sm font-medium text-black/70 mb-6">
                We're working on implementing execution history tracking in the
                orchestrator. This will show all your past workflow runs with
                detailed logs and results.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="bg-white border-2 border-black p-4">
                  <h4 className="font-black uppercase text-sm mb-2">
                    ✅ Planned Features
                  </h4>
                  <ul className="text-xs space-y-1">
                    <li>• Execution timeline</li>
                    <li>• Step-by-step logs</li>
                    <li>• Performance metrics</li>
                    <li>• Result downloads</li>
                  </ul>
                </div>
                <div className="bg-white border-2 border-black p-4">
                  <h4 className="font-black uppercase text-sm mb-2">
                    🔄 Current Status
                  </h4>
                  <ul className="text-xs space-y-1">
                    <li>• Orchestrator API ready</li>
                    <li>• Frontend components built</li>
                    <li>• History endpoint needed</li>
                    <li>• Data persistence setup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History List */}
        {filteredItems.length > 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-bold text-black/60 uppercase">
                {filteredItems.length}{" "}
                {filteredItems.length === 1 ? "Execution" : "Executions"} Found
              </p>
            </div>

            <div className="grid gap-4">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.execution.executionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border-4 border-black shadow-neo p-6 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo-lg transition-all duration-150 cursor-pointer"
                  onClick={() => setSelectedExecution(item)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black uppercase text-lg text-black">
                        {item.workflow?.description || "Workflow Execution"}
                      </h3>
                      <p className="text-sm font-mono text-black/60">
                        ID: {item.execution.executionId}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 border-2 font-black uppercase text-xs ${getStatusColor(
                        item.execution.status
                      )}`}
                    >
                      {item.execution.status}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-black uppercase text-black/60">
                        Started:
                      </span>
                      <p className="font-mono">
                        {new Date(item.execution.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-black uppercase text-black/60">
                        Duration:
                      </span>
                      <p className="font-mono">
                        {formatDuration(
                          item.execution.startTime,
                          item.execution.endTime
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="font-black uppercase text-black/60">
                        Steps:
                      </span>
                      <p className="font-mono">
                        {item.execution.stepResults.length} completed
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed View Modal */}
        {selectedExecution && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-4 border-black shadow-neo-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b-4 border-black flex justify-between items-center">
                <h2 className="text-xl font-black uppercase">
                  Execution Details
                </h2>
                <button
                  onClick={() => setSelectedExecution(null)}
                  className="text-black hover:text-red-500 font-black text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Execution Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-black uppercase text-sm mb-2">
                      Execution ID
                    </h3>
                    <p className="font-mono text-sm bg-gray-100 p-2 border-2 border-black">
                      {selectedExecution.execution.executionId}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-sm mb-2">
                      Status
                    </h3>
                    <div
                      className={`px-3 py-2 border-2 font-black uppercase text-sm inline-block ${getStatusColor(
                        selectedExecution.execution.status
                      )}`}
                    >
                      {selectedExecution.execution.status}
                    </div>
                  </div>
                </div>

                {/* Step Results */}
                <div>
                  <h3 className="font-black uppercase text-sm mb-4">
                    Step Results
                  </h3>
                  <div className="space-y-2">
                    {selectedExecution.execution.stepResults.map(
                      (step, index) => (
                        <div
                          key={step.stepId}
                          className="bg-gray-50 border-2 border-black p-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-black uppercase text-sm">
                              {step.stepId}
                            </span>
                            <div
                              className={`px-2 py-1 border font-black uppercase text-xs ${getStatusColor(
                                step.status
                              )}`}
                            >
                              {step.status}
                            </div>
                          </div>
                          {step.output && (
                            <pre className="text-xs font-mono bg-white p-2 border overflow-x-auto">
                              {JSON.stringify(step.output, null, 2)}
                            </pre>
                          )}
                          {step.error && (
                            <div className="text-xs text-red-600 font-mono bg-red-50 p-2 border border-red-200">
                              {step.error}
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Final Output */}
                {selectedExecution.execution.output && (
                  <div>
                    <h3 className="font-black uppercase text-sm mb-2">
                      Final Output
                    </h3>
                    <pre className="text-xs font-mono bg-gray-100 p-4 border-2 border-black overflow-x-auto">
                      {JSON.stringify(
                        selectedExecution.execution.output,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default HistoryPage;
