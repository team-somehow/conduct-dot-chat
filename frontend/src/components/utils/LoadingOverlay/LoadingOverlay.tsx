import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  /** Whether to show the overlay */
  isLoading: boolean;
}

/**
 * Standalone LoadingOverlay displays a full-screen overlay with a spinner when isLoading is true.
 * Refactored to use Tailwind CSS and lucide-react.
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      aria-hidden="true"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
};

export default LoadingOverlay;
