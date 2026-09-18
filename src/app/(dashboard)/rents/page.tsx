'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { MonthlyRent, Property, ApiResponse } from '@/lib/types';
import { formatCurrency, formatBnDate, getDefaultRentPeriod } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableSkeleton,
} from '@/components/ui/table';
import {
  MobileDataRow,
  MobileTableSkeleton,
  CompactStatus,
  ResponsiveTableContainer,
} from '@/components/ui/responsive-table';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
  DetailItem,
} from '@/components/ui/bottom-sheet';
import { CollectPaymentDialog } from '@/components/payments/collect-payment-dialog';
import { GenerateRentDialog } from '@/components/rents/generate-rent-dialog';
import { TenantAvatar } from '@/components/ui/tenant-avatar';
import {
  Receipt,
  Wallet,
  Sparkles,
  Search,
  ChevronRight,
  User,
} from 'lucide-react';

export default function MonthlyRentsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const defaultPeriod = getDefaultRentPeriod();
  const [selectedYear, setSelectedYear] = useState<number>(defaultPeriod.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultPeriod.month);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [propertyFilter, setPropertyFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedRent, setSelectedRent] = useState<MonthlyRent | null>(null);
  const [detailRent, setDetailRent] = useState<MonthlyRent | null>(null);

  // 1. Fetch Properties for dropdown
  const { data: properties } = useQuery({
    queryKey: ['properties-rents-filter'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties?limit=100');
      return res.data?.data || [];
    },
  });

  // 2. Fetch Monthly Rents
  const {
    data: rents,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['monthly-rents-list', selectedYear, selectedMonth, statusFilter, propertyFilter, search],
    queryFn: async () => {
      let url = `/monthly-rents?year=${selectedYear}&month=${selectedMonth}&limit=100`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (propertyFilter) url += `&propertyId=${propertyFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await apiClient.get<ApiResponse<MonthlyRent[]>>(url);
      return res.data?.data || [];
    },
  });

  const handleOpenPayment = (rent: MonthlyRent) => {
    setSelectedRent(rent);
    setPaymentDialogOpen(true);
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title={t.monthlyRents}
        description={isEn ? 'Manage rent invoices, due dates, and collections' : 'মাসিক ভাড়ার বিল, বকেয়া এবং ভাড়া আদায় পরিচালনা করুন'}
        action={
          <Button onClick={() => setGenerateDialogOpen(true)} variant="default" className="h-10 gap-2">
            <Sparkles className="w-4 h-4" />
            {t.generateMonthlyRent}
          </Button>
        }
      />

      {/* Filter Bar - Month/Year/Status/Property selectors */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[10px] border border-[#E5E7EB] shadow-none">
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B7280]">{isEn ? 'Month:' : 'মাস:'}</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151] outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2026, m - 1).toLocaleString(isEn ? 'en-US' : 'bn-BD', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B7280]">{isEn ? 'Year:' : 'সাল:'}</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151] outline-none"
          >
            {Array.from(new Set([2024, 2025, 2026, 2027, defaultPeriod.year, selectedYear])).sort((a, b) => a - b).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Default / Previous Month Indicator */}
        {selectedYear === defaultPeriod.year && selectedMonth === defaultPeriod.month && (
          <span className="text-[11px] bg-[#F3FAF5] text-[#12664F] font-semibold px-2.5 py-1 rounded-full border border-[#CDE4DA]">
            {t.previousMonth}
          </span>
        )}

        {/* Status Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B7280]">{t.status}:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151] outline-none"
          >
            <option value="">{t.all}</option>
            <option value="PENDING">{isEn ? 'Pending' : 'অপেক্ষমান (Pending)'}</option>
            <option value="PARTIAL">{isEn ? 'Partial' : 'আংশিক (Partial)'}</option>
            <option value="PAID">{isEn ? 'Paid' : 'পরিশোধিত (Paid)'}</option>
            <option value="OVERDUE">{isEn ? 'Overdue' : 'মেয়াদোত্তীর্ণ (Overdue)'}</option>
          </select>
        </div>

        {/* Property Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B7280]">{t.properties}:</span>
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151] outline-none max-w-[180px]"
          >
            <option value="">{isEn ? 'All Properties' : 'সকল বাড়ি'}</option>
            {properties?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9CA3AF]" />
          <Input placeholder={isEn ? 'Search tenant, unit, or property' : 'ভাড়াটিয়া, ইউনিট বা বাড়ি খুঁজুন'} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <p className="text-xs text-[#6B7280]">{rents ? `${rents.length} ${isEn ? 'invoices' : 'টি বিল'}` : ''}</p>
      </div>

      {/* Rents Responsive Table Container */}
      {isLoading ? (
        <ResponsiveTableContainer>
          <div className="hidden md:block">
            <Table className="min-w-[1020px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">{t.tenantName}</TableHead>
                  <TableHead className="min-w-[110px]">{t.unitNumber}</TableHead>
                  <TableHead align="right" className="min-w-[100px]">{t.baseRent}</TableHead>
                  <TableHead align="right" className="min-w-[95px]">{t.serviceFee}</TableHead>
                  <TableHead align="right" className="min-w-[105px]">{t.total}</TableHead>
                  <TableHead align="right" className="min-w-[95px]">{t.paid}</TableHead>
                  <TableHead align="right" className="min-w-[95px]">{t.remaining}</TableHead>
                  <TableHead align="left" className="min-w-[105px]">{isEn ? 'Due Date' : 'পরিশোধের শেষ তারিখ'}</TableHead>
                  <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
                  <TableHead align="right" className="min-w-[130px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton columns={10} rows={5} />
              </TableBody>
            </Table>
          </div>
          <div className="block md:hidden">
            <MobileTableSkeleton rows={5} />
          </div>
        </ResponsiveTableContainer>
      ) : rents && rents.length > 0 ? (
        <ResponsiveTableContainer>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table className="min-w-[1020px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">{t.tenantName}</TableHead>
                  <TableHead className="min-w-[110px]">{t.unitNumber}</TableHead>
                  <TableHead align="right" className="min-w-[100px]">{t.baseRent}</TableHead>
                  <TableHead align="right" className="min-w-[95px]">{t.serviceFee}</TableHead>
                  <TableHead align="right" className="min-w-[105px]">{t.total}</TableHead>
                  <TableHead align="right" className="min-w-[95px]">{t.paid}</TableHead>
                  <TableHead align="right" className="min-w-[95px]">{t.remaining}</TableHead>
                  <TableHead align="left" className="min-w-[105px]">{isEn ? 'Due Date' : 'পরিশোধের শেষ তারিখ'}</TableHead>
                  <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
                  <TableHead align="right" className="min-w-[130px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rents.map((rent) => (
                  <TableRow key={rent.id}>
                    <TableCell className="min-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <TenantAvatar
                          profilePictureId={rent.agreement?.tenant?.profilePictureId}
                          name={rent.agreement?.tenant?.name || 'Tenant'}
                          size="sm"
                          onClick={() => rent.agreement?.tenant?.id && window.open(`/tenants/${rent.agreement.tenant.id}`, '_blank')}
                          ariaLabel={isEn ? 'View tenant profile' : 'ভাড়াটিয়ার প্রোফাইল দেখুন'}
                        />
                        <div className="min-w-0 max-w-[160px]">
                          <p className="truncate font-medium text-[#0F172A] text-sm" title={rent.agreement?.tenant?.name || 'Tenant'}>
                            {rent.agreement?.tenant?.name || 'Tenant'}
                          </p>
                          <p className="truncate text-xs text-[#64748B]" title={rent.agreement?.tenant?.phone || ''}>
                            {rent.agreement?.tenant?.phone || '—'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[110px]">
                      <div className="min-w-0">
                        <span className="font-semibold text-[#1E293B] block">
                          {rent.agreement?.unit?.unitNumber || '—'}
                        </span>
                        {(!propertyFilter && (properties?.length || 0) > 1) && rent.agreement?.unit?.property?.name && (
                          <span className="block text-xs text-[#64748B] truncate max-w-[120px]" title={rent.agreement.unit.property.name}>
                            {rent.agreement.unit.property.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="right" className="text-[#334155] whitespace-nowrap">
                      {formatCurrency(rent.rent, language)}
                    </TableCell>
                    <TableCell align="right" className="text-[#64748B] whitespace-nowrap">
                      {formatCurrency(rent.serviceFee, language)}
                    </TableCell>
                    <TableCell align="right" className="font-semibold text-[#0F172A] whitespace-nowrap">
                      {formatCurrency(rent.totalAmount, language)}
                    </TableCell>
                    <TableCell align="right" className="text-[#059669] font-medium whitespace-nowrap">
                      {formatCurrency(rent.paidAmount, language)}
                    </TableCell>
                    <TableCell align="right" className="text-[#DC2626] font-medium whitespace-nowrap">
                      {formatCurrency(rent.remainingAmount, language)}
                    </TableCell>
                    <TableCell align="left" className="text-xs text-[#64748B] whitespace-nowrap">
                      {rent.dueDate ? formatBnDate(rent.dueDate, language) : '—'}
                    </TableCell>
                    <TableCell align="center">
                      <StatusBadge status={rent.status} lang={language} />
                    </TableCell>
                    <TableCell align="right">
                      {rent.status !== 'PAID' && rent.remainingAmount > 0 ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenPayment(rent)}
                          className="h-8 gap-1.5 text-xs bg-[#059669] hover:bg-[#047857] px-2.5"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>{t.collectPayment}</span>
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-[#059669] inline-flex items-center gap-1">
                          {isEn ? 'Completed' : 'সম্পূর্ণ'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile 2-Line Row Representation */}
          <div className="block md:hidden divide-y divide-[#F1F5F9]">
            {rents.map((rent) => {
              const statusVariant =
                rent.status === 'PAID'
                  ? 'success'
                  : rent.status === 'OVERDUE'
                  ? 'danger'
                  : rent.status === 'PARTIAL'
                  ? 'warning'
                  : 'info';

              const statusLabel =
                rent.status === 'PAID'
                  ? (isEn ? 'Paid' : 'পরিশোধিত')
                  : rent.status === 'OVERDUE'
                  ? (isEn ? 'Overdue' : 'বকেয়া')
                  : rent.status === 'PARTIAL'
                  ? (isEn ? 'Partial' : 'আংশিক')
                  : (isEn ? 'Pending' : 'অপেক্ষমাণ');

              return (
                <MobileDataRow
                  key={rent.id}
                  onClick={() => setDetailRent(rent)}
                  showChevron
                  identity={
                    <div className="flex items-center gap-2">
                      <TenantAvatar
                        profilePictureId={rent.agreement?.tenant?.profilePictureId}
                        name={rent.agreement?.tenant?.name || 'Tenant'}
                        size="sm"
                      />
                      <span className="font-semibold text-sm text-[#0F172A] truncate">
                        {rent.agreement?.tenant?.name || 'Tenant'}
                      </span>
                    </div>
                  }
                  value={formatCurrency(rent.remainingAmount > 0 ? rent.remainingAmount : rent.totalAmount, language)}
                  stateAndDetail={
                    <>
                      <CompactStatus label={statusLabel} variant={statusVariant} />
                      <span className="text-slate-300">·</span>
                      {rent.agreement?.unit?.unitNumber && (
                        <span>Unit {rent.agreement.unit.unitNumber}</span>
                      )}
                      {rent.dueDate && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span>{isEn ? `Due ${formatBnDate(rent.dueDate, language)}` : `পরিশোধ ${formatBnDate(rent.dueDate, language)}`}</span>
                        </>
                      )}
                    </>
                  }
                  action={
                    rent.status !== 'PAID' && rent.remainingAmount > 0 ? (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPayment(rent);
                        }}
                        className="h-8 min-h-[40px] px-2.5 text-xs bg-[#059669] hover:bg-[#047857] gap-1"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>{t.collectPayment}</span>
                      </Button>
                    ) : null
                  }
                />
              );
            })}
          </div>
        </ResponsiveTableContainer>
      ) : (
        <Card className="rounded-[10px] border-[#E2E8F0] shadow-none">
          <CardContent className="p-0">
            <EmptyState
              icon={Receipt}
              title={isEn ? 'No Rent Invoices Found' : 'এই মাসের কোনো ভাড়ার বিল তৈরি হয়নি'}
              description={
                isEn
                  ? 'Click "Generate Monthly Invoices" to create bills for all active apartments.'
                  : '"মাসিক বিল তৈরি করুন" বাটনে ক্লিক করে স্বয়ংক্রিয়ভাবে বিল তৈরি করুন।'
              }
              actionLabel={t.generateMonthlyRent}
              onAction={() => setGenerateDialogOpen(true)}
            />
          </CardContent>
        </Card>
      )}

      {/* Row Details Bottom Sheet on Mobile */}
      <BottomSheet open={!!detailRent} onOpenChange={(open) => !open && setDetailRent(null)}>
        {detailRent && (
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>
                {detailRent.agreement?.tenant?.name || 'Tenant'}
              </BottomSheetTitle>
              <BottomSheetDescription>
                {detailRent.agreement?.unit?.property?.name ? `${detailRent.agreement.unit.property.name} · ` : ''}
                Unit {detailRent.agreement?.unit?.unitNumber || '—'}
              </BottomSheetDescription>
            </BottomSheetHeader>

            <div className="py-2">
              <DetailItem
                label={isEn ? 'Billing Period' : 'ভাড়ার মাস'}
                value={new Date(detailRent.year, detailRent.month - 1).toLocaleString(isEn ? 'en-US' : 'bn-BD', { month: 'long', year: 'numeric' })}
              />
              <DetailItem
                label={isEn ? 'Base Rent' : 'মূল ভাড়া'}
                value={formatCurrency(detailRent.rent, language)}
                isNumeric
              />
              <DetailItem
                label={isEn ? 'Service Fee' : 'সার্ভিস চার্জ'}
                value={formatCurrency(detailRent.serviceFee, language)}
                isNumeric
              />
              <DetailItem
                label={isEn ? 'Total Bill' : 'মোট বিল'}
                value={formatCurrency(detailRent.totalAmount, language)}
                isNumeric
                highlight
              />
              <DetailItem
                label={isEn ? 'Paid Amount' : 'পরিশোধিত'}
                value={formatCurrency(detailRent.paidAmount, language)}
                isNumeric
              />
              <DetailItem
                label={isEn ? 'Remaining Due' : 'বকেয়া'}
                value={formatCurrency(detailRent.remainingAmount, language)}
                isNumeric
              />
              <DetailItem
                label={isEn ? 'Due Date' : 'পরিশোধের তারিখ'}
                value={detailRent.dueDate ? formatBnDate(detailRent.dueDate, language) : '—'}
              />
              <DetailItem
                label={isEn ? 'Status' : 'অবস্থা'}
                value={<StatusBadge status={detailRent.status} lang={language} />}
              />
              {detailRent.agreement?.tenant?.phone && (
                <DetailItem
                  label={isEn ? 'Phone' : 'ফোন'}
                  value={detailRent.agreement.tenant.phone}
                />
              )}
            </div>

            <BottomSheetFooter>
              {detailRent.status !== 'PAID' && detailRent.remainingAmount > 0 && (
                <Button
                  onClick={() => {
                    const r = detailRent;
                    setDetailRent(null);
                    handleOpenPayment(r);
                  }}
                  className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] min-h-[44px]"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {t.collectPayment}
                </Button>
              )}
              {detailRent.agreement?.tenant?.id && (
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(`/tenants/${detailRent.agreement?.tenant?.id}`, '_blank');
                  }}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  <User className="w-4 h-4 mr-2" />
                  {isEn ? 'View Tenant' : 'প্রোফাইল দেখুন'}
                </Button>
              )}
            </BottomSheetFooter>
          </BottomSheetContent>
        )}
      </BottomSheet>

      {/* Generate Rent Modal Dialog */}
      <GenerateRentDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        onSuccess={refetch}
      />

      {/* Collect Payment Modal Dialog */}
      <CollectPaymentDialog
        rent={selectedRent}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}