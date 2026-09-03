import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-100 text-emerald-800 border border-emerald-200",
        secondary:
          "bg-slate-100 text-slate-800 border border-slate-200",
        destructive:
          "bg-rose-100 text-rose-800 border border-rose-200",
        warning:
          "bg-amber-100 text-amber-800 border border-amber-200",
        info:
          "bg-blue-100 text-blue-800 border border-blue-200",
        outline:
          "border border-slate-200 text-slate-700 bg-white",
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
