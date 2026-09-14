import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="table-container relative w-full overflow-x-auto rounded-lg border border-[#E5E7EB] bg-white max-md:border-0 max-md:bg-transparent max-md:shadow-none">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm responsive-table", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("bg-[#FAFAF9] border-b border-[#E5E7EB] text-[#6B7280] font-semibold", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
      className={cn("[&_tr:last-child]:border-0 divide-y divide-[#F3F4F6]", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-[#E5E7EB] bg-[#FAFAF9] font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-[#F3F4F6] transition-colors hover:bg-[#FAFAF9] data-[state=selected]:bg-[#F3F4F6]",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-3 py-3 text-left align-middle font-medium text-[#6B7280] [&:has([role=checkbox])]:pr-0 whitespace-normal break-words leading-tight text-xs tracking-wide",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, children, title, ...props }, ref) => {
  const autoTitle = title || (typeof children === 'string' || typeof children === 'number' ? String(children) : undefined);

  return (
    <td
      ref={ref}
      title={autoTitle}
      className={cn(
        "px-3 py-3.5 align-middle [&:has([role=checkbox])]:pr-0 text-sm text-[#374151]",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
});
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xs text-[#6B7280]", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
