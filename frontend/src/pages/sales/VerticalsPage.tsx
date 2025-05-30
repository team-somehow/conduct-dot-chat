import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock data for verticals
const mockVerticals = [
  {
    id: 1,
    name: "SaaS",
    description: "Software as a Service products and platforms",
    iconUrl: "💻",
  },
  {
    id: 2,
    name: "E-commerce",
    description: "Online retail and marketplace solutions",
    iconUrl: "🛒",
  },
  {
    id: 3,
    name: "Healthcare",
    description: "Medical and wellness technologies",
    iconUrl: "🏥",
  },
  {
    id: 4,
    name: "Education",
    description: "E-learning and educational technology",
    iconUrl: "📚",
  },
  {
    id: 5,
    name: "Finance",
    description: "Banking, investing, and financial services",
    iconUrl: "💰",
  },
  {
    id: 6,
    name: "Real Estate",
    description: "Property management and real estate tech",
    iconUrl: "🏠",
  },
  {
    id: 7,
    name: "Travel",
    description: "Booking, planning, and travel services",
    iconUrl: "✈️",
  },
  {
    id: 8,
    name: "Media",
    description: "Content creation and streaming services",
    iconUrl: "📱",
  },
];

type VerticalStatus = "pending" | "approved" | "rejected";

interface Vertical {
  id: number;
  name: string;
  description: string;
  iconUrl: string;
  status?: VerticalStatus;
}

export function VerticalsPage() {
  const navigate = useNavigate();
  const [verticals, setVerticals] = useState<Vertical[]>(
    mockVerticals.map((v) => ({ ...v, status: "pending" }))
  );

  // Count approved verticals
  const approvedCount = verticals.filter((v) => v.status === "approved").length;

  // Handle status change for a single vertical
  const handleStatusChange = (id: number, status: VerticalStatus) => {
    setVerticals(verticals.map((v) => (v.id === id ? { ...v, status } : v)));
  };

  // Handle bulk actions
  const approveAll = () => {
    setVerticals(verticals.map((v) => ({ ...v, status: "approved" })));
  };

  const rejectAll = () => {
    setVerticals(verticals.map((v) => ({ ...v, status: "rejected" })));
  };

  // Check if user can proceed (at least one vertical is approved)
  const canProceed = approvedCount > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Select Verticals
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Choose the relevant industry verticals for your product.
            </p>
          </div>

          <Badge
            variant="outline"
            className="flex items-center gap-1 px-3 py-1 text-base"
          >
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>
              <span className="font-medium">{approvedCount}</span> Approved
            </span>
          </Badge>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex justify-end gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={approveAll}
        >
          <ThumbsUp className="h-4 w-4" /> Approve All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={rejectAll}
        >
          <ThumbsDown className="h-4 w-4" /> Reject All
        </Button>
      </div>

      {/* Verticals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {verticals.map((vertical) => (
          <Card
            key={vertical.id}
            className={cn(
              "p-6 transition-all border-2",
              vertical.status === "approved" &&
                "border-green-500/30 bg-green-50/30 dark:bg-green-950/10",
              vertical.status === "rejected" &&
                "border-red-500/30 bg-red-50/30 dark:bg-red-950/10",
              vertical.status === "pending" && "border-transparent"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{vertical.iconUrl}</div>
                <div>
                  <h3 className="text-xl font-semibold">{vertical.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {vertical.description}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    vertical.status === "approved" &&
                      "text-green-600 bg-green-100 dark:bg-green-900/30"
                  )}
                  onClick={() => handleStatusChange(vertical.id, "approved")}
                >
                  <ThumbsUp className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    vertical.status === "rejected" &&
                      "text-red-600 bg-red-100 dark:bg-red-900/30"
                  )}
                  onClick={() => handleStatusChange(vertical.id, "rejected")}
                >
                  <ThumbsDown className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Next button (floating) */}
      <TooltipProvider>
        <div className="fixed bottom-6 right-6 z-20">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  size="lg"
                  className="rounded-full shadow-lg gap-2 h-14 w-14 p-0 flex items-center justify-center"
                  disabled={!canProceed}
                  onClick={() => navigate("/sales/leads")}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              {canProceed
                ? "Continue to next step"
                : "Select at least one vertical to continue"}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
