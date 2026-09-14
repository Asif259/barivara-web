'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { DashboardOverview, MonthlyRent, Property, ApiResponse } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { CollectPaymentDialog } from '@/components/payments/collect-payment-dialog';
import {
  Building2,
  Home,
  Users,
  Percent,
  Wallet,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Receipt,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedRentForPayment, setSelectedRentForPayment] = useState<MonthlyRent | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // 1. Fetch Properties for the filter dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties-list-filter'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties?limit=100');
      return res.data?.data || [];
    },
  });

  // 2. Fetch Dashboard Overview Stats
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['dashboard-overview', selectedPropertyId],
    queryFn: async () => {
      const queryParam = selectedPropertyId ? `?propertyId=${selectedPropertyId}` : '';
      const res = await apiClient.get<ApiResponse<DashboardOverview>>(`/dashboard/overview${queryParam}`);
      return res.data?.data;
    },
  });

  // 3. Fetch Outstanding Rents
  const {
    data: outstandingRents,
    isLoading: isOutstandingLoading,
    refetch: refetchOutstanding,
  } = useQuery({
    queryKey: ['outstanding-rents', selectedPropertyId],
    queryFn: async () => {
      const queryParam = selectedPropertyId ? `?propertyId=${selectedPropertyId}&limit=10` : '?limit=10';
      const res = await apiClient.get<ApiResponse<MonthlyRent[]>>(`/monthly-rents/outstanding${queryParam}`);
      return res.data?.data || [];
    },
  });

  const handleOpenPayment = (rent: MonthlyRent) => {
    setSelectedRentForPayment(rent);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    refetchOverview();
    refetchOutstanding();
  };

  const currentMonth = overviewData?.currentMonth;
  const collectionRate = currentMonth?.collectionRate || 0;
  const outstandingCount =
    (currentMonth?.pendingCount || 0) + (currentMonth?.overdueCount || 0) + (currentMonth?.partialCount || 0);

  return (
    <div className="space-y-10 pb-8">
      <div className="flex flex-col gap-5 border-b border-[#E5E7EB] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-[#6B7280]">BariVara</p>
          <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-[#171717]">{t.dashboard}</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#6B7280]">
            {isEn
              ? 'A clear view of your properties, occupancy, and rent collection.'
              : 'আপনার বাড়ি, ভাড়াটিয়া এবং ভাড়া আদায়ের সংক্ষিপ্ত সারাংশ।'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-sm text-[#6B7280] focus-within:border-[#12664F] focus-within:ring-2 focus-within:ring-[#12664F]/10">
            <Filter className="h-4 w-4 text-[#9CA3AF]" />
            <span className="sr-only">{isEn ? 'Filter by property' : 'বাড়ি দিয়ে ফিল্টার করুন'}</span>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="min-w-[150px] bg-transparent text-sm font-medium text-[#374151] outline-none"
            >
              <option value="">{isEn ? 'All properties' : 'সকল বাড়ি'}</option>
              {propertiesData?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <Link href="/rents">
            <Button size="sm" className="h-10 w-full gap-1.5 px-4 sm:w-auto">
              <Receipt className="h-4 w-4" />
              {t.generateRent}
            </Button>
          </Link>
        </div>
      </div>

      <section aria-labelledby="portfolio-overview-heading">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="portfolio-overview-heading" className="text-[17px] font-semibold text-[#171717]">
              {isEn ? 'Portfolio overview' : 'সম্পত্তির সারাংশ'}
            </h2>
            <p className="mt-1 text-[13px] text-[#6B7280]">
              {isEn ? 'Current operating snapshot' : 'বর্তমান পরিচালনামূলক অবস্থা'}
            </p>
          </div>
        </div>

        {isOverviewLoading ? (
          <div className="grid grid-cols-2 divide-x divide-y divide-[#E5E7EB] rounded-[10px] border border-[#E5E7EB] bg-white lg:grid-cols-4 lg:divide-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3 p-5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 divide-x divide-y divide-[#E5E7EB] rounded-[10px] border border-[#E5E7EB] bg-white lg:grid-cols-4 lg:divide-y-0">
            <Metric label={t.properties} value={formatNumber(overviewData?.totalProperties || 0, language)} detail={isEn ? 'Registered properties' : 'মোট নিবন্ধিত বাড়ি'} icon={Building2} />
            <Metric label={t.units} value={formatNumber(overviewData?.totalUnits || 0, language)} detail={`${formatNumber(overviewData?.occupiedUnits || 0, language)} ${t.occupied} · ${formatNumber(overviewData?.vacantUnits || 0, language)} ${t.vacant}`} icon={Home} />
            <Metric label={t.tenants} value={formatNumber(overviewData?.totalTenants || 0, language)} detail={isEn ? 'Active tenants' : 'সক্রিয় ভাড়াটিয়া'} icon={Users} />
            <Metric label={t.occupancyRate} value={`${formatNumber(overviewData?.occupancyRate || 0, language)}%`} detail={isEn ? 'Units occupied' : 'ভাড়া হওয়ার হার'} icon={Percent} />
          </div>
        )}
      </section>

      <section aria-labelledby="collection-heading">
        <div className="mb-4">
          <h2 id="collection-heading" className="text-[17px] font-semibold text-[#171717]">
            {isEn ? 'Collection overview' : 'ভাড়া আদায়ের সারাংশ'}
          </h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">
            {isEn ? 'Monthly financial performance at a glance' : 'চলতি মাসের আর্থিক অগ্রগতি'}
          </p>
        </div>

        {isOverviewLoading ? (
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Skeleton className="h-52 rounded-[10px]" />
            <Skeleton className="h-52 rounded-[10px]" />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
              <CardHeader className="border-b border-[#F3F4F6] pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-[17px]">{isEn ? 'Monthly rent' : 'মাসিক ভাড়া'}</CardTitle>
                    <CardDescription className="mt-1">
                      {currentMonth?.month
                        ? new Date(currentMonth.year, currentMonth.month - 1).toLocaleString(isEn ? 'en-US' : 'bn-BD', { month: 'long', year: 'numeric' })
                        : (isEn ? 'Current billing period' : 'চলতি বিলিং সময়')}
                    </CardDescription>
                  </div>
                  <DollarSign className="h-4 w-4 text-[#307473]" />
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 pt-5 sm:grid-cols-3">
                <FinancialFigure label={isEn ? 'Expected' : 'প্রত্যাশিত'} value={formatCurrency(currentMonth?.expected || 0, language)} />
                <FinancialFigure label={isEn ? 'Collected' : 'আদায়কৃত'} value={formatCurrency(currentMonth?.collected || 0, language)} accent />
                <FinancialFigure label={isEn ? 'Outstanding' : 'বকেয়া'} value={formatCurrency(currentMonth?.outstanding || 0, language)} danger />
              </CardContent>
            </Card>

            <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-[17px]">{t.collectionRate}</CardTitle>
                    <CardDescription className="mt-1">{isEn ? 'Collected vs expected' : 'আদায়ের অগ্রগতি'}</CardDescription>
                  </div>
                  <TrendingUp className="h-4 w-4 text-[#12664F]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-4">
                  <span className="text-4xl font-semibold tracking-tight text-[#171717]">{formatNumber(collectionRate, language)}%</span>
                  <span className="pb-1 text-xs text-[#6B7280]">{formatNumber(currentMonth?.paidCount || 0, language)} {isEn ? 'fully paid' : 'সম্পূর্ণ পরিশোধিত'}</span>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E8F3EF]">
                  <div className="h-full rounded-full bg-[#12664F] transition-all" style={{ width: `${Math.min(Math.max(collectionRate, 0), 100)}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280]">
                  <span>{isEn ? 'Collection progress' : 'আদায়ের অগ্রগতি'}</span>
                  <span>{formatNumber(outstandingCount, language)} {isEn ? 'pending' : 'বকেয়া'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <section aria-labelledby="outstanding-heading">
        <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
          <CardHeader className="flex flex-col gap-3 border-b border-[#F3F4F6] pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[#B45309]" />
                <CardTitle id="outstanding-heading" className="text-[17px]">
                  {isEn ? 'Outstanding rent' : 'বকেয়া ভাড়া'}
                </CardTitle>
              </div>
              <CardDescription className="mt-1">
                {isEn ? 'Invoices that need attention' : 'যেসব বিলের জন্য পদক্ষেপ প্রয়োজন'}
              </CardDescription>
            </div>
            <Link href="/rents" className="inline-flex items-center gap-1 text-sm font-medium text-[#12664F] hover:text-[#0E513F]">
              {isEn ? 'View all rents' : 'সকল ভাড়া দেখুন'} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="pt-5">
            {isOutstandingLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : outstandingRents && outstandingRents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.tenantName}</TableHead>
                    <TableHead>{t.unitNumber}</TableHead>
                    <TableHead>{isEn ? 'Month / Year' : 'মাস ও সাল'}</TableHead>
                    <TableHead>{t.total}</TableHead>
                    <TableHead>{t.paid}</TableHead>
                    <TableHead>{t.remaining}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead className="text-right">{t.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outstandingRents.map((rent) => (
                    <TableRow key={rent.id}>
                      <TableCell data-label={t.tenantName} className="font-medium text-[#171717]">
                        <div className="text-right sm:text-left">
                          <span>{rent.agreement?.tenant?.name || 'Tenant'}</span>
                          <span className="block text-xs font-normal text-[#6B7280]">{rent.agreement?.tenant?.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell data-label={t.unitNumber}>
                        <div className="text-right sm:text-left">
                          <span className="font-medium text-[#374151]">{rent.agreement?.unit?.unitNumber}</span>
                          <span className="block text-xs text-[#6B7280]">{rent.agreement?.unit?.property?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell data-label={isEn ? 'Month / Year' : 'মাস ও সাল'} className="text-xs text-[#6B7280]">{rent.month}/{rent.year}</TableCell>
                      <TableCell data-label={t.total} className="font-medium">{formatCurrency(rent.totalAmount, language)}</TableCell>
                      <TableCell data-label={t.paid} className="font-medium text-[#15803D]">{formatCurrency(rent.paidAmount, language)}</TableCell>
                      <TableCell data-label={t.remaining} className="font-medium text-[#DC2626]">{formatCurrency(rent.remainingAmount, language)}</TableCell>
                      <TableCell data-label={t.status}><StatusBadge status={rent.status} lang={language} /></TableCell>
                      <TableCell data-label={t.actions} className="text-right">
                        <Button size="sm" variant="outline" onClick={() => handleOpenPayment(rent)} className="gap-1.5 whitespace-nowrap">
                          <Wallet className="h-3.5 w-3.5 text-[#12664F]" />
                          {isEn ? 'Collect rent' : 'ভাড়া আদায়'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title={isEn ? 'No outstanding rents' : 'কোনো বকেয়া ভাড়া নেই'}
                description={isEn ? 'All rent invoices for the current period have been fully collected.' : 'চলতি সময়ের সকল ফ্ল্যাটের ভাড়া শতভাগ আদায় সম্পন্ন হয়েছে।'}
              />
            )}
          </CardContent>
        </Card>
      </section>

      <CollectPaymentDialog rent={selectedRentForPayment} open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} onSuccess={handlePaymentSuccess} />
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: React.ElementType }) {
  return (
    <div className="min-w-0 p-5">
      <div className="flex items-center gap-2 text-[#6B7280]">
        <Icon className="h-4 w-4 text-[#9CA3AF]" />
        <p className="truncate text-sm font-medium">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#171717]">{value}</p>
      <p className="mt-1 truncate text-xs text-[#6B7280]">{detail}</p>
    </div>
  );
}

function FinancialFigure({ label, value, accent = false, danger = false }: { label: string; value: string; accent?: boolean; danger?: boolean }) {
  return (
    <div>
      <p className="text-[13px] text-[#6B7280]">{label}</p>
      <p className={`mt-2 text-xl font-semibold tracking-tight ${danger ? 'text-[#DC2626]' : accent ? 'text-[#12664F]' : 'text-[#171717]'}`}>
        {value}
      </p>
    </div>
  );
}