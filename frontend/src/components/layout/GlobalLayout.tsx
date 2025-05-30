import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { SidebarNav } from "./SidebarNav";

export function GlobalLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  // Determine sidebar collapse based on screen size
  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update progress based on current step (1-5)
  useEffect(() => {
    // Calculate progress percentage (5 steps total)
    setProgress((currentStep / 5) * 100);
  }, [currentStep]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed left sidebar / slide-out panel */}
      <SidebarNav
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-0 md:ml-16" : "ml-0 md:ml-64"
        )}
      >
        <div className="container py-6 px-4 md:px-6 max-w-6xl mx-auto">
          {/* Progress bar for overall completion */}
          <Progress
            value={progress}
            className="mb-8 sticky top-4 z-10 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-sm"
          />

          {/* Page content */}
          <main className="space-y-8">
            <Outlet context={{ currentStep, setCurrentStep }} />
          </main>
        </div>
      </div>
    </div>
  );
}
