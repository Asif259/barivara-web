import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[#E5E7EB] mb-6">
      <div>
        <h1 className="text-[30px] leading-tight font-semibold tracking-tight text-[#171717]">{title}</h1>
        {description && (
          <p className="text-[13px] text-[#6B7280] mt-1.5">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
