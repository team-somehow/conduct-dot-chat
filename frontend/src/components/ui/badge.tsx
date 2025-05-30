// Cleaned by Mega-Prompt – 2024-12-19
// Purpose: Badge component with various styling variants
// TODO(fast-refresh): Move badgeVariants to separate constants file

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        success:
          "border-transparent bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        destructive:
          "border-transparent bg-destructive/20 text-destructive dark:text-destructive",
        outline: "text-foreground",
        running:
          "border-transparent bg-blue-500/20 text-blue-600 dark:text-blue-400",
        completed:
          "border-transparent bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        failed:
          "border-transparent bg-destructive/20 text-destructive dark:text-destructive",
        pending:
          "border-transparent bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge - Displays a small status or category indicator
 * @param variant - Visual style variant for different states
 * @param className - Additional CSS classes
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
