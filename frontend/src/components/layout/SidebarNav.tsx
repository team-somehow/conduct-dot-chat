import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronRight,
  ChevronLeft,
  Info,
  FileText,
  Briefcase,
  Mail,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

// Define step routes and labels
const steps = [
  { id: 1, label: "Info Gathering", icon: Info, path: "/sales/gather" },
  { id: 2, label: "Verticals", icon: FileText, path: "/sales/verticals" },
  { id: 3, label: "Leads", icon: Briefcase, path: "/sales/leads" },
  { id: 4, label: "Email", icon: Mail, path: "/sales/email" },
  { id: 5, label: "Schedule", icon: Calendar, path: "/sales/schedule" },
];

export function SidebarNav({
  collapsed,
  setCollapsed,
  currentStep,
  setCurrentStep,
}: SidebarNavProps) {
  const location = useLocation();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Update current step based on route
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedStep = steps.find((step) => currentPath.includes(step.path));
    if (matchedStep) {
      setCurrentStep(matchedStep.id);
    }
  }, [location.pathname, setCurrentStep]);

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full bg-card shadow-lg transition-all duration-300 ease-in-out z-30 border-r",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-10 top-4 hidden md:flex"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight /> : <ChevronLeft />}
      </Button>

      {/* Mobile overlay to close sidebar */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div className="flex flex-col h-full py-6">
        <TooltipProvider delayDuration={200}>
          <nav className="space-y-2 px-3 flex-1">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const Icon = step.icon;

              return (
                <Tooltip key={step.id}>
                  <TooltipTrigger asChild>
                    <Link
                      to={step.path}
                      className={cn(
                        "flex items-center py-3 px-4 rounded-lg transition-colors duration-200 group relative",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted text-foreground/70 hover:text-foreground",
                        hoveredStep === step.id && "hover:bg-muted"
                      )}
                      onMouseEnter={() => setHoveredStep(step.id)}
                      onMouseLeave={() => setHoveredStep(null)}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center min-w-10 h-10 rounded-full mr-3",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {step.id}
                      </div>

                      {!collapsed && (
                        <span className="text-base truncate">{step.label}</span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className={cn(!collapsed && "hidden")}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{step.label}</span>
                      <span className="text-xs text-muted-foreground">
                        Step {step.id} of 5
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>

        {/* Bottom actions */}
        <div
          className={cn(
            "mt-auto pt-4 border-t px-3",
            collapsed ? "items-center" : "items-start"
          )}
        >
          <Button
            variant="outline"
            size={collapsed ? "icon" : "default"}
            className="w-full"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
}
