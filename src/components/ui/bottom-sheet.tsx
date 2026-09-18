"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomSheet = DialogPrimitive.Root;
const BottomSheetTrigger = DialogPrimitive.Trigger;
const BottomSheetPortal = DialogPrimitive.Portal;
const BottomSheetClose = DialogPrimitive.Close;

const BottomSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
BottomSheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <BottomSheetPortal>
    <BottomSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // Mobile: Bottom sheet slide-up
        "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[20px] border-t border-[#E2E8F0] bg-white p-5 shadow-2xl duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        // Desktop / Tablet: Centered modal dialog
        "sm:bottom-auto sm:top-[50%] sm:left-[50%] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl sm:border sm:border-[#E2E8F0]",
        "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {/* Mobile drag handle */}
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#E2E8F0] sm:hidden" />
      
      {children}

      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </BottomSheetPortal>
));
BottomSheetContent.displayName = DialogPrimitive.Content.displayName;

const BottomSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1 pb-3 text-left border-b border-[#F1F5F9]",
      className
    )}
    {...props}
  />
);
BottomSheetHeader.displayName = "BottomSheetHeader";

const BottomSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-base font-semibold leading-tight tracking-tight text-[#0F172A]",
      className
    )}
    {...props}
  />
));
BottomSheetTitle.displayName = DialogPrimitive.Title.displayName;

const BottomSheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-xs text-[#64748B]", className)}
    {...props}
  />
));
BottomSheetDescription.displayName = DialogPrimitive.Description.displayName;

const BottomSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-[#F1F5F9] mt-4",
      className
    )}
    {...props}
  />
);
BottomSheetFooter.displayName = "BottomSheetFooter";

/**
 * Clean key-value item for row detail inspection
 */
export function DetailItem({
  label,
  value,
  isNumeric = false,
  highlight = false,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  isNumeric?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#F8FAFC] last:border-0 text-sm">
      <span className="text-[#64748B] text-xs font-medium">{label}</span>
      <span
        className={cn(
          "text-[#0F172A] font-medium text-right",
          isNumeric && "tabular-nums font-semibold",
          highlight && "text-[#059669] font-semibold"
        )}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

export {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetPortal,
  BottomSheetOverlay,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetFooter,
  BottomSheetTitle,
  BottomSheetDescription,
};
