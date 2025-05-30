import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  barColor?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  barColor = "bg-primary",
  showPercentage = true,
  className,
  ...props
}: ProgressBarProps) {
  // Calculate percentage and ensure it's between 0-100
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div className={cn("flex flex-col w-full gap-1", className)} {...props}>
      <div className="flex justify-between items-center w-full">
        <div className="text-sm font-medium">Progress</div>
        {showPercentage && (
          <div className="text-sm text-muted-foreground">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            barColor
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
