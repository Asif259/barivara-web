'use client';

import type { ReactNode } from 'react';
import { Check, MessageCircle, ReceiptText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandingCopy } from './copy';
import { StatusPill } from './primitives';

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#071a14]/85 p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

function PanelTitle({ label, meta }: { label: string; meta?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#7f978c]">{label}</p>
      {meta ? <span className="text-[11px] text-[#9db3a8]">{meta}</span> : null}
    </div>
  );
}

function KhataPanel({ t }: { t: LandingCopy }) {
  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#d8cfb8] bg-[#f3ecd9] p-4 text-[#3f3a2c]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a7d5d]">{t.comparison.paperLabel}</p>
          <div className="mt-3 space-y-2.5">
            {[92, 74, 84, 58].map((width, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#a3966f]" />
                <span className="h-px flex-1 bg-[#b9ac86]" style={{ maxWidth: `${width}%` }} />
              </div>
            ))}
          </div>
          <p className="mt-4 rotate-[-3deg] font-[cursive] text-[13px] text-[#6d5a33]">৳ ?</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0b241c] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7ff0c2]">{t.comparison.bariLabel}</p>
          <div className="mt-3 space-y-2">
            {t.sceneVisuals.rent.rows.slice(0, 3).map((row) => (
              <div key={row.unit} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.04] px-2.5 py-1.5">
                <span className="truncate text-[11px] text-[#d5e4dc]">{row.unit}</span>
                <span className="text-[11px] tabular-nums text-[#f2faf6]">{row.amount}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-[#7ff0c2]">
            <Check className="h-3 w-3" />
            {t.sceneVisuals.rent.formula}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function UnitsPanel({ t }: { t: LandingCopy }) {
  const floors = [5, 4, 3, 2, 1, 0];
  return (
    <Panel>
      <PanelTitle label={t.story.chapters[1].kicker} meta={t.sceneVisuals.unitTagNote} />
      <div className="space-y-1.5">
        {floors.map((floor, index) => (
          <div key={floor} className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-[9px] uppercase tracking-[0.14em] text-[#829c90]">
              {floor === 0 ? 'G' : `F${floor}`}
            </span>
            <div className="grid flex-1 grid-cols-4 gap-1.5">
              {Array.from({ length: 4 }).map((__, cell) => {
                const tone =
                  (index + cell) % 7 === 0 ? 'vacant' : (index + cell) % 5 === 0 ? 'partial' : (index + cell) % 9 === 0 ? 'overdue' : 'paid';
                return (
                  <div
                    key={cell}
                    className={cn(
                      'flex h-10 items-center justify-center rounded-md border text-[9px]',
                      tone === 'paid' && 'border-[#5ef29a]/25 bg-[#5ef29a]/10 text-[#a9e8cd]',
                      tone === 'partial' && 'border-[#f0c05a]/25 bg-[#f0c05a]/10 text-[#f0c05a]',
                      tone === 'overdue' && 'border-[#ff8d7d]/25 bg-[#ff8d7d]/10 text-[#ff8d7d]',
                      tone === 'vacant' && 'border-white/8 bg-white/[0.02] text-[#829c90]',
                    )}
                  >
                    {floor}
                    {cell + 1}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-1.5 sm:grid-cols-3">
        {t.sceneVisuals.unitTags.map((tag) => (
          <div key={tag.name} className="rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2">
            <p className="truncate text-[11px] text-[#e9f3ee]">{tag.name}</p>
            <StatusPill label={tag.status} tone={tag.tone} onDark className="mt-1.5" />
          </div>
        ))}
      </div>
    </Panel>
  );
}


function TenantPanel({ t }: { t: LandingCopy }) {
  const tenant = t.sceneVisuals.tenant;
  const agreement = t.sceneVisuals.agreement;
  const rows = [
    [tenant.phoneLabel, tenant.phone],
    [tenant.emergencyLabel, tenant.emergency],
    [tenant.addressLabel, tenant.address],
    [tenant.occupationLabel, tenant.occupation],
  ];
  return (
    <Panel>
      <PanelTitle label={tenant.heading} meta={tenant.role} />
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#7ff0c2]/30 bg-[#7ff0c2]/10 text-[13px] font-semibold text-[#a9e8cd]">
          {tenant.name.slice(0, 1)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-[#f2faf6]">{tenant.name}</p>
          <p className="mt-0.5 text-[11px] text-[#7f978c]">{tenant.unit}</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full border border-[#7ff0c2]/25 bg-[#7ff0c2]/10 px-2 py-0.5 text-[10px] text-[#a9e8cd]">
          {tenant.nidValue}
        </span>
      </div>
      <dl className="mt-4 grid gap-2 text-[11px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 border-b border-white/6 pb-1.5">
            <dt className="shrink-0 text-[#829c90]">{label}</dt>
            <dd className="truncate text-right text-[#cfdfd7]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-xl border border-[#7ff0c2]/20 bg-[#0b241c] p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f978c]">{agreement.heading}</p>
          <StatusPill label={agreement.status} tone="paid" onDark />
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
          {[
            [agreement.rentLabel, agreement.rent],
            [agreement.serviceLabel, agreement.service],
            [agreement.parkingLabel, agreement.parking],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white/[0.04] px-1.5 py-2">
              <p className="text-[9px] text-[#7f978c]">{label}</p>
              <p className="mt-0.5 text-[12px] font-medium tabular-nums text-[#f2faf6]">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-[10px] text-[#7f978c]">{agreement.note}</p>
      </div>
    </Panel>
  );
}

function RentPanel({ t }: { t: LandingCopy }) {
  const rent = t.sceneVisuals.rent;
  return (
    <Panel>
      <PanelTitle label={rent.heading} meta={rent.subheading} />
      <div className="overflow-hidden rounded-xl border border-white/8">
        <div className="grid grid-cols-[1.3fr_1.1fr_0.9fr] gap-2 bg-white/[0.04] px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-[#7f978c]">
          <span>{rent.columns.unit}</span>
          <span className="text-right">{rent.columns.amount}</span>
          <span className="text-right">{rent.columns.status}</span>
        </div>
        {rent.rows.map((row) => (
          <div
            key={row.unit}
            className="grid grid-cols-[1.3fr_1.1fr_0.9fr] items-center gap-2 border-t border-white/6 px-3 py-2.5 text-[11px]"
          >
            <span className="truncate text-[#d5e4dc]">{row.unit}</span>
            <span className="text-right tabular-nums text-[#f2faf6]">{row.amount}</span>
            <span className="flex justify-end">
              <StatusPill label={row.status} tone={row.tone} onDark />
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {rent.methods.map((method) => (
          <span key={method} className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#9db3a8]">
            {method}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-[#7ff0c2]">{rent.noDuplicate}</p>
    </Panel>
  );
}

function ReceiptPanel({ t }: { t: LandingCopy }) {
  const receipt = t.sceneVisuals.receipt;
  return (
    <Panel className="bg-[#071a14]/70">
      <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
        <div className="bv-doc rounded-lg p-4 text-[#1f2a24]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[#8a7d5d]">{receipt.heading}</p>
              <p className="mt-1 text-[13px] font-semibold">{t.common.appName}</p>
            </div>
            <div className="text-right text-[9px] text-[#6b7280]">
              <p>
                {receipt.numberLabel} {receipt.number}
              </p>
              <p>{receipt.date}</p>
            </div>
          </div>
          <div className="mt-3 border-y border-dashed border-[#d8cfb8] py-2.5">
            <p className="text-[9px] uppercase tracking-[0.16em] text-[#8a7d5d]">{receipt.fromLabel}</p>
            <p className="text-[12px] font-medium">{receipt.from}</p>
            <p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-[#8a7d5d]">{receipt.amountLabel}</p>
            <p className="text-[20px] font-semibold tracking-tight tabular-nums">{receipt.amount}</p>
            <p className="text-[9px] text-[#6b7280]">{receipt.inWords}</p>
          </div>
          <dl className="mt-2.5 space-y-1 text-[10px]">
            <div className="flex justify-between gap-2">
              <dt className="text-[#6b7280]">{receipt.forLabel}</dt>
              <dd className="text-right">{receipt.forValue}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[#6b7280]">{receipt.methodLabel}</dt>
              <dd className="text-right">{receipt.method}</dd>
            </div>
          </dl>
          <div className="mt-5 flex items-end justify-between">
            <p className="text-[8px] uppercase tracking-[0.14em] text-[#9ca3af]">{receipt.printNote}</p>
            <div className="text-right">
              <div className="h-4 w-16 border-b border-[#9ca3af]" />
              <p className="mt-1 text-[8px] text-[#6b7280]">{receipt.signature}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3">
          <div className="rounded-xl border border-[#25d366]/25 bg-[#0b241c] p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-[#a9e8cd]">
              <MessageCircle className="h-3 w-3" />
              {receipt.whatsappLabel}
              <span className="ml-auto text-[9px] text-[#829c90]">{receipt.whatsappTime}</span>
            </div>
            <p className="mt-2 rounded-lg rounded-tl-none bg-[#134e3a] px-2.5 py-2 text-[10px] leading-relaxed text-[#e9f3ee]">
              {receipt.whatsappMessage}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-[#9db3a8]">
              <ReceiptText className="h-3 w-3 text-[#7ff0c2]" />
              {receipt.printNote}
            </div>
            <p className="mt-2 text-[10px] text-[#829c90]">{t.common.sampleDataShort}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ReportsPanel({ t }: { t: LandingCopy }) {
  const reports = t.sceneVisuals.reports;
  return (
    <Panel>
      <PanelTitle label={reports.heading} meta={reports.csvNote} />
      <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#7f978c]">{reports.occupancyLabel}</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-[30px] font-semibold leading-none tracking-tight text-[#7ff0c2]">
              {reports.occupancyValue}
            </span>
            <span className="mb-0.5 text-[10px] text-[#7f978c]">{reports.occupancyDetail}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#2dc2bd] to-[#7ff0c2]" />
          </div>
          <dl className="mt-4 space-y-1.5 text-[10px]">
            {[
              [reports.expectedLabel, reports.expectedValue, 'text-[#f2faf6]'],
              [reports.collectedLabel, reports.collectedValue, 'text-[#7ff0c2]'],
              [reports.outstandingLabel, reports.outstandingValue, 'text-[#f0c05a]'],
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-baseline justify-between border-b border-white/6 pb-1">
                <dt className="text-[#7f978c]">{label}</dt>
                <dd className={cn('tabular-nums', color)}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#7f978c]">{reports.expenseLabel}</p>
          <div className="mt-3 space-y-2">
            {reports.expenses.map((expense) => (
              <div key={expense.label}>
                <div className="flex items-baseline justify-between gap-2 text-[10px]">
                  <span className="text-[#cfdfd7]">{expense.label}</span>
                  <span className="tabular-nums text-[#9db3a8]">{expense.value}</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[#2dc2bd]"
                    style={{ width: `${expense.percent}%`, opacity: 0.55 + expense.percent / 200 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[9px] text-[#829c90]">{reports.expenseNote}</p>
        </div>
      </div>
    </Panel>
  );
}

function ClosingPanel({ t }: { t: LandingCopy }) {
  const closing = t.sceneVisuals.closing;
  return (
    <Panel className="border-[#7ff0c2]/25 bg-[#0b2a21]">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo_t.png" alt="" className="h-12 w-12 rounded-xl object-contain" />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium leading-snug text-[#f2faf6]">{closing.title}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#9db3a8]">{closing.body}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="/register"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#7ff0c2] px-4 text-[12px] font-medium text-[#05100c]"
        >
          {closing.cta}
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
        <a
          href="/login"
          className="inline-flex h-9 items-center rounded-full border border-white/15 px-4 text-[12px] text-[#e9f3ee]"
        >
          {closing.secondary}
        </a>
      </div>
      <p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-[#829c90]">{t.common.sampleData}</p>
    </Panel>
  );
}

export function StoryVisual({ id, t }: { id: string; t: LandingCopy }) {
  switch (id) {
    case 'properties':
      return <UnitsPanel t={t} />;
    case 'tenants':
      return <TenantPanel t={t} />;
    case 'rent':
      return <RentPanel t={t} />;
    case 'receipts':
      return <ReceiptPanel t={t} />;
    case 'reports':
      return <ReportsPanel t={t} />;
    case 'closing':
      return <ClosingPanel t={t} />;
    default:
      return <KhataPanel t={t} />;
  }
}
