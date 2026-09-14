import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664F] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#12664F] text-white hover:bg-[#0E513F] active:bg-[#0B4335]",
        destructive:
          "bg-[#DC2626] text-white hover:bg-[#B91C1C] active:bg-[#991B1B]",
        outline:
          "border border-[#E5E7EB] bg-white text-[#171717] hover:bg-[#FAFAF9] hover:border-[#D1D5DB] active:bg-[#F3F4F6]",
        secondary:
          "bg-[#F3F4F6] text-[#171717] hover:bg-[#E5E7EB] active:bg-[#D1D5DB]",
        ghost:
          "text-[#374151] hover:bg-[#F3F4F6] hover:text-[#171717]",
        link:
          "text-[#12664F] underline-offset-4 hover:underline",
        gradient:
          "bg-[#12664F] text-white hover:bg-[#0E513F] active:bg-[#0B4335]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
