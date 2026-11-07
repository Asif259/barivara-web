'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { Check, MessageCircle, ReceiptText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LandingCopy } from './copy';
import { StatusPill } from './primitives';

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#071a14]/90 p-6 backdrop-blur-md',
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
      <p className="text-xs font-semibold text-[#9db3a8]">{label}</p>
      {meta ? <span className="text-xs text-[#829c90]">{meta}</span> : null}
    </div>
  );
}

function KhataPanel({ t }: { t: LandingCopy }) {
  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#d8cfb8] bg-[#f3ecd9] p-4 text-[#3f3a2c]">
          <p className="text-xs font-semibold text-[#5c5038]">{t.comparison.paperLabel}</p>
          <div className="mt-3 space-y-2.5">
            {[92, 74, 84, 58].map((width, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#a3966f]" />
                <span className="h-px flex-1 bg-[#b9ac86]" style={{ maxWidth: `${width}%` }} />
              </div>
            ))}
          </div>
          <p className="mt-4 font-serif text-sm text-[#6d5a33]">৳ ?</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#0b241c] p-4">
          <p className="text-xs font-semibold text-[#8fe9c4]">{t.comparison.bariLabel}</p>
          <div className="mt-3 space-y-2">
            {t.sceneVisuals.rent.rows.slice(0, 3).map((row) => (
              <div key={row.unit} className="flex items-center justify-between gap-2 rounded bg-white/[0.04] px-2.5 py-1.5">
                <span className="truncate text-xs text-[#d5e4dc]">{row.unit}</span>
                <span className="text-xs tabular-nums text-[#f2faf6]">{row.amount}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#8fe9c4]">
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
            <span className="w-10 shrink-0 text-xs font-semibold text-[#829c90]">
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
                      'flex h-10 items-center justify-center rounded-lg border text-xs font-medium',
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
          <div key={tag.name} className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
            <p className="truncate text-xs text-[#e9f3ee]">{tag.name}</p>
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
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#8fe9c4]/30 bg-[#8fe9c4]/10 text-sm font-semibold text-[#8fe9c4]">
          {tenant.name.slice(0, 1)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#f2faf6]">{tenant.name}</p>
          <p className="mt-0.5 text-xs text-[#7f978c]">{tenant.unit}</p>
        </div>
        <span className="ml-auto shrink-0 rounded border border-[#8fe9c4]/25 bg-[#8fe9c4]/10 px-2 py-0.5 text-xs text-[#8fe9c4]">
          {tenant.nidValue}
        </span>
      </div>
      <dl className="mt-4 grid gap-2 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 border-b border-white/6 pb-1.5">
            <dt className="shrink-0 text-[#829c90]">{label}</dt>
            <dd className="truncate text-right text-[#cfdfd7]">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 rounded-xl border border-[#8fe9c4]/20 bg-[#0b241c] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-[#9db3a8]">{agreement.heading}</p>
          <StatusPill label={agreement.status} tone="paid" onDark />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            [agreement.rentLabel, agreement.rent],
            [agreement.serviceLabel, agreement.service],
            [agreement.parkingLabel, agreement.parking],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-white/[0.04] px-1.5 py-2">
              <p className="text-xs text-[#7f978c]">{label}</p>
              <p className="mt-0.5 text-xs font-semibold tabular-nums text-[#f2faf6]">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-xs text-[#7f978c]">{agreement.note}</p>
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
        <div className="grid grid-cols-[1.3fr_1.1fr_0.9fr] gap-2 bg-white/[0.04] px-3.5 py-2.5 text-xs font-semibold text-[#9db3a8]">
          <span>{rent.columns.unit}</span>
          <span className="text-right">{rent.columns.amount}</span>
          <span className="text-right">{rent.columns.status}</span>
        </div>
        {rent.rows.map((row) => (
          <div
            key={row.unit}
            className="grid grid-cols-[1.3fr_1.1fr_0.9fr] items-center gap-2 border-t border-white/6 px-3.5 py-2.5 text-xs"
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
          <span key={method} className="rounded border border-white/10 px-2.5 py-0.5 text-xs text-[#9db3a8]">
            {method}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#8fe9c4]">{rent.noDuplicate}</p>
    </Panel>
  );
}

function ReceiptPanel({ t }: { t: LandingCopy }) {
  const receipt = t.sceneVisuals.receipt;
  return (
    <Panel className="bg-[#071a14]/70">
      <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
        <div className="bv-doc rounded-xl p-4 text-[#1f2a24]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#5c5038]">{receipt.heading}</p>
              <p className="mt-1 text-sm font-bold">{t.common.appName}</p>
            </div>
            <div className="text-right text-xs text-[#6b7280]">
              <p>
                {receipt.numberLabel} {receipt.number}
              </p>
              <p>{receipt.date}</p>
            </div>
          </div>
          <div className="mt-3 border-y border-dashed border-[#d8cfb8] py-2.5">
            <p className="text-xs text-[#5c5038]">{receipt.fromLabel}</p>
            <p className="text-sm font-semibold">{receipt.from}</p>
            <p className="mt-2 text-xs text-[#5c5038]">{receipt.amountLabel}</p>
            <p className="text-xl font-bold tracking-tight tabular-nums">{receipt.amount}</p>
            <p className="text-xs text-[#6b7280]">{receipt.inWords}</p>
          </div>
          <dl className="mt-2.5 space-y-1 text-xs">
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
            <p className="text-xs text-[#9ca3af]">{receipt.printNote}</p>
            <div className="text-right">
              <div className="h-4 w-16 border-b border-[#9ca3af]" />
              <p className="mt-1 text-xs text-[#6b7280]">{receipt.signature}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3">
          <div className="rounded-xl border border-[#25d366]/25 bg-[#0b241c] p-4">
            <div className="flex items-center gap-1.5 text-xs text-[#a9e8cd]">
              <MessageCircle className="h-3.5 w-3.5" />
              {receipt.whatsappLabel}
              <span className="ml-auto text-xs text-[#829c90]">{receipt.whatsappTime}</span>
            </div>
            <p className="mt-2 rounded-lg bg-[#134e3a] p-3 text-xs leading-relaxed text-[#e9f3ee]">
              {receipt.whatsappMessage}
            </p>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-1.5 text-xs text-[#9db3a8]">
              <ReceiptText className="h-3.5 w-3.5 text-[#8fe9c4]" />
              {receipt.printNote}
            </div>
            <p className="mt-2 text-xs text-[#829c90]">{t.common.sampleDataShort}</p>
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
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold text-[#9db3a8]">{reports.occupancyLabel}</p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-2xl font-bold leading-none tracking-tight text-[#8fe9c4]">
              {reports.occupancyValue}
            </span>
            <span className="mb-0.5 text-xs text-[#7f978c]">{reports.occupancyDetail}</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div className="h-full w-3/4 rounded-full bg-[#8fe9c4]" />
          </div>
          <dl className="mt-4 space-y-1.5 text-xs">
            {[
              [reports.expectedLabel, reports.expectedValue, 'text-[#f2faf6]'],
              [reports.collectedLabel, reports.collectedValue, 'text-[#8fe9c4]'],
              [reports.outstandingLabel, reports.outstandingValue, 'text-[#f0c05a]'],
            ].map(([label, value, color]) => (
              <div key={label} className="flex items-baseline justify-between border-b border-white/6 pb-1">
                <dt className="text-[#7f978c]">{label}</dt>
                <dd className={cn('tabular-nums font-medium', color)}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold text-[#9db3a8]">{reports.expenseLabel}</p>
          <div className="mt-3 space-y-2">
            {reports.expenses.map((expense) => (
              <div key={expense.label}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="text-[#cfdfd7]">{expense.label}</span>
                  <span className="tabular-nums text-[#9db3a8]">{expense.value}</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-[#2dc2bd]"
                    style={{ width: `${expense.percent}%`, opacity: 0.6 + expense.percent / 200 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#829c90]">{reports.expenseNote}</p>
        </div>
      </div>
    </Panel>
  );
}

function ClosingPanel({ t }: { t: LandingCopy }) {
  const closing = t.sceneVisuals.closing;
  return (
    <Panel className="border-[#8fe9c4]/20 bg-[#0b2a21]">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Image src="/logo_t.png" alt="BariVara" width={48} height={48} className="h-12 w-12 rounded-xl object-contain" />
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold leading-snug text-[#f2faf6]">{closing.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#9db3a8]">{closing.body}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <a
          href="/register"
          className="inline-flex h-9 items-center justify-center rounded-full bg-[#7ff0c2] px-4 text-xs font-semibold text-[#05100c] transition-colors duration-150 active:scale-[0.98] hover:bg-[#a6f7d6]"
        >
          {closing.cta}
        </a>
        <a
          href="/login"
          className="inline-flex h-9 items-center justify-center rounded-full border border-white/15 px-4 text-xs font-semibold text-[#e9f3ee] transition-colors duration-150 active:scale-[0.98] hover:bg-white/10"
        >
          {closing.secondary}
        </a>
      </div>
      <p className="mt-3 text-xs text-[#829c90]">{t.common.sampleData}</p>
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
