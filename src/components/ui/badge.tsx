import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#12664F] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[#F3FAF5] text-[#166534] border border-[#D1FADE]",
        secondary:
          "bg-[#F8F9FA] text-[#4B5563] border border-[#E5E7EB]",
        destructive:
          "bg-[#FEF7F7] text-[#B91C1C] border border-[#FECACA]",
        warning:
          "bg-[#FFFCF2] text-[#92400E] border border-[#FDE7B2]",
        info:
          "bg-[#F5F9FF] text-[#1D4ED8] border border-[#C7DBFF]",
        outline:
          "border border-[#E5E7EB] text-[#6B7280] bg-white",
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
