'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { MonthlyRent, Property, ApiResponse } from '@/lib/types';
import { formatCurrency, formatBnDate, getDefaultRentPeriod } from '@/lib/utils';
import { getFileDownloadUrl } from '@/lib/file-upload';
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
} from '@/components/ui/table';
import { CollectPaymentDialog } from '@/components/payments/collect-payment-dialog';
import { GenerateRentDialog } from '@/components/rents/generate-rent-dialog';
import {
  Receipt,
  Wallet,
  Sparkles,
  Search,
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

  const { data: profilePictureUrls } = useQuery({
    queryKey: ['rent-tenant-profile-pictures', rents?.map((rent) => rent.agreement?.tenant?.profilePictureId).filter(Boolean)],
    queryFn: async () => {
      const ids = (rents || []).map((rent) => rent.agreement?.tenant?.profilePictureId).filter(Boolean) as string[];
      const urls = await Promise.all(ids.map(async (id) => { try { return { id, url: await getFileDownloadUrl(id) }; } catch { return { id, url: null }; } }));
      return Object.fromEntries(urls.map((item) => [item.id, item.url]));
    },
    enabled: !!rents?.some((rent) => rent.agreement?.tenant?.profilePictureId),
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

      {/* Rents Table */}
      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : rents && rents.length > 0 ? (
            <Table>
              <TableHeader className="bg-[#FAFAF9]">
                <TableRow>
                  <TableHead className="min-w-[250px]">{t.tenantName}</TableHead>
                  <TableHead>{t.unitNumber}</TableHead>
                  <TableHead>{t.baseRent}</TableHead>
                  <TableHead>{t.serviceFee}</TableHead>
                  <TableHead>{t.total}</TableHead>
                  <TableHead>{t.paid}</TableHead>
                  <TableHead>{t.remaining}</TableHead>
                  <TableHead>{isEn ? 'Due Date' : 'পরিশোধের শেষ তারিখ'}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rents.map((rent) => (
                  <TableRow key={rent.id}>
                    <TableCell data-label={t.tenantName} className="min-w-[250px]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#CDE4DA] bg-[#E8F3EF] text-sm font-semibold text-[#12664F]">
                          {profilePictureUrls?.[rent.agreement?.tenant?.profilePictureId || ''] ? (
                            <img src={profilePictureUrls[rent.agreement?.tenant?.profilePictureId || '']!} alt="" className="h-full w-full object-cover" />
                          ) : (
                            (rent.agreement?.tenant?.name || 'T').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#171717]">{rent.agreement?.tenant?.name || 'Tenant'}</p>
                          <p className="mt-0.5 text-xs text-[#6B7280]">{rent.agreement?.tenant?.phone || (isEn ? 'No phone number' : 'ফোন নম্বর নেই')}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-label={t.unitNumber}>
                      <div className="text-right sm:text-left">
                        <span className="font-semibold text-[#374151]">{rent.agreement?.unit?.unitNumber}</span>
                        {(!propertyFilter && (properties?.length || 0) > 1) && rent.agreement?.unit?.property?.name && (
                          <span className="block text-xs text-[#6B7280] cell-clamp-2" title={rent.agreement.unit.property.name}>{rent.agreement.unit.property.name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell data-label={t.baseRent} className="text-[#374151]">
                      {formatCurrency(rent.rent, language)}
                    </TableCell>
                    <TableCell data-label={t.serviceFee} className="text-[#6B7280]">
                      {formatCurrency(rent.serviceFee, language)}
                    </TableCell>
                    <TableCell data-label={t.total} className="font-bold text-[#171717]">
                      {formatCurrency(rent.totalAmount, language)}
                    </TableCell>
                    <TableCell data-label={t.paid} className="text-[#12664F] font-semibold">
                      {formatCurrency(rent.paidAmount, language)}
                    </TableCell>
                    <TableCell data-label={t.remaining} className="text-[#DC2626] font-bold">
                      {formatCurrency(rent.remainingAmount, language)}
                    </TableCell>
                    <TableCell data-label={isEn ? 'Due Date' : 'পরিশোধের শেষ তারিখ'} className="text-xs text-[#6B7280]">
                      {formatBnDate(rent.dueDate, language)}
                    </TableCell>
                    <TableCell data-label={t.status}>
                      <StatusBadge status={rent.status} lang={language} />
                    </TableCell>
                    <TableCell data-label={t.actions} className="text-right">
                      {rent.status !== 'PAID' && rent.remainingAmount > 0 ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleOpenPayment(rent)}
                          className="gap-1.5 text-xs bg-[#12664F] hover:bg-[#0E513F]"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          {t.collectPayment}
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-[#12664F] inline-flex items-center gap-1">
                          {isEn ? 'Completed' : 'সম্পূর্ণ'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
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
          )}
        </CardContent>
      </Card>

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