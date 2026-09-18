import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const EMPTY_VALUE = "—";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, ...props }, ref) => (
    <div
      className={cn(
        "table-container relative w-full overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white shadow-none",
        containerClassName
      )}
    >
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm data-table", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-[#FAFAF9] border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]",
      className
    )}
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
    className={cn("[&_tr:last-child]:border-0 divide-y divide-[#F1F5F9]", className)}
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
      "border-t border-[#E2E8F0] bg-[#FAFAF9] font-medium [&>tr]:last:border-b-0",
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
      "h-[46px] border-b border-[#F1F5F9] transition-colors hover:bg-[#F8FAFC] data-[state=selected]:bg-[#F1F5F9]",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = "left", ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-10 px-3.5 py-2 align-middle text-xs font-semibold text-[#64748B] whitespace-nowrap leading-tight",
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = "TableHead";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: "left" | "center" | "right";
  isNumeric?: boolean;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align, isNumeric, children, title, ...props }, ref) => {
    const autoTitle =
      title ||
      (typeof children === "string" || typeof children === "number"
        ? String(children)
        : undefined);

    const effectiveAlign = align || (isNumeric ? "right" : "left");

    return (
      <td
        ref={ref}
        title={autoTitle}
        className={cn(
          "px-3.5 py-2.5 sm:py-3 align-middle text-sm text-[#1E293B] leading-tight",
          effectiveAlign === "left" && "text-left",
          effectiveAlign === "center" && "text-center",
          effectiveAlign === "right" && "text-right tabular-nums",
          isNumeric && "tabular-nums font-medium",
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xs text-[#64748B]", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, c) => (
            <TableCell key={c} className="py-3">
              <Skeleton
                className={cn(
                  "h-4 rounded",
                  c === 0
                    ? "w-28 sm:w-36"
                    : c === columns - 1
                    ? "w-16 ml-auto"
                    : "w-20"
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

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
