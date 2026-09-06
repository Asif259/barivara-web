'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import {
  DashboardOverview,
  MonthlyRent,
  Property,
  ApiResponse,
} from '@/lib/types';
import { formatCurrency, formatBnDate, formatNumber } from '@/lib/utils';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
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
  Plus,
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

  return (
    <div className="space-y-8">
      {/* Top Header & Property Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.dashboard}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEn
              ? 'Real-time overview of your rental properties, units, and collections'
              : 'আপনার সকল বাড়ি, ইউনিট এবং চলতি মাসের ভাড়া আদায়ের লাইভ সারাংশ'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="">{isEn ? 'All Properties' : 'সকল বাড়ি'}</option>
              {propertiesData?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <Link href="/rents">
            <Button variant="gradient" size="sm" className="gap-1.5 shadow-xs">
              <Receipt className="w-4 h-4" />
              {t.generateRent}
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Property & Occupancy Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isOverviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              title={t.properties}
              value={formatNumber(overviewData?.totalProperties || 0, language)}
              subtitle={isEn ? 'Registered properties' : 'মোট নিবন্ধিত বাড়ি'}
              icon={Building2}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-50"
            />
            <StatCard
              title={t.units}
              value={formatNumber(overviewData?.totalUnits || 0, language)}
              subtitle={`${formatNumber(overviewData?.occupiedUnits || 0, language)} ${t.occupied} • ${formatNumber(overviewData?.vacantUnits || 0, language)} ${t.vacant}`}
              icon={Home}
              iconColor="text-sky-600"
              iconBgColor="bg-sky-50"
            />
            <StatCard
              title={t.tenants}
              value={formatNumber(overviewData?.totalTenants || 0, language)}
              subtitle={isEn ? 'Active tenants' : 'সক্রিয় ভাড়াটিয়া'}
              icon={Users}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-50"
            />
            <StatCard
              title={t.occupancyRate}
              value={`${formatNumber(overviewData?.occupancyRate || 0, language)}%`}
              subtitle={isEn ? 'Units occupied' : 'ভাড়া হওয়ার হার'}
              icon={Percent}
              iconColor="text-teal-600"
              iconBgColor="bg-teal-50"
            />
          </>
        )}
      </div>

      {/* Row 2: Monthly Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isOverviewLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              title={isEn ? 'Expected Rent' : 'প্রত্যাশিত মোট ভাড়া'}
              value={formatCurrency(currentMonth?.expected || 0, language)}
              subtitle={isEn ? 'Current month bill' : 'চলতি মাসের মোট বিল'}
              icon={DollarSign}
              iconColor="text-slate-700"
              iconBgColor="bg-slate-100"
            />
            <StatCard
              title={isEn ? 'Collected Rent' : 'আদায়কৃত ভাড়া'}
              value={formatCurrency(currentMonth?.collected || 0, language)}
              subtitle={`${formatNumber(currentMonth?.paidCount || 0, language)} ${isEn ? 'units fully paid' : 'টি ফ্ল্যাট পরিশোধিত'}`}
              icon={CheckCircle2}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-50"
            />
            <StatCard
              title={isEn ? 'Outstanding Due' : 'বকেয়া ও অপরিশোধিত'}
              value={formatCurrency(currentMonth?.outstanding || 0, language)}
              subtitle={`${formatNumber((currentMonth?.pendingCount || 0) + (currentMonth?.overdueCount || 0) + (currentMonth?.partialCount || 0), language)} ${isEn ? 'units pending' : 'টি বকেয়া রয়েছে'}`}
              icon={AlertCircle}
              iconColor="text-rose-600"
              iconBgColor="bg-rose-50"
            />
            <StatCard
              title={t.collectionRate}
              value={`${formatNumber(currentMonth?.collectionRate || 0, language)}%`}
              subtitle={isEn ? 'Collected vs expected' : 'আদায়ের অগ্রগতি'}
              icon={TrendingUp}
              iconColor="text-emerald-600"
              iconBgColor="bg-emerald-50"
            />
          </>
        )}
      </div>

      {/* Outstanding Rents Section */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              {isEn ? 'Outstanding & Overdue Rent Invoices' : 'বকেয়া ও মেয়াদোত্তীর্ণ ভাড়ার তালিকা'}
            </CardTitle>
            <CardDescription>
              {isEn
                ? 'Quickly record payments for tenants with pending dues'
                : 'বকেয়া থাকা ভাড়াটিয়াদের থেকে দ্রুত ভাড়া আদায় রেকর্ড করুন'}
            </CardDescription>
          </div>
          <Link href="/rents" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
            {isEn ? 'View All Rents' : 'সকল ভাড়া দেখুন'} <ArrowUpRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent>
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
                    <TableCell className="font-semibold text-slate-900">
                      {rent.agreement?.tenant?.name || 'Tenant'}
                      <span className="block text-xs font-normal text-slate-500">
                        {rent.agreement?.tenant?.phone}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-800">
                        {rent.agreement?.unit?.unitNumber}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {rent.agreement?.unit?.property?.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {rent.month}/{rent.year}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(rent.totalAmount, language)}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-medium">
                      {formatCurrency(rent.paidAmount, language)}
                    </TableCell>
                    <TableCell className="text-rose-600 font-bold">
                      {formatCurrency(rent.remainingAmount, language)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={rent.status} lang={language} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleOpenPayment(rent)}
                        className="gap-1 shadow-xs bg-emerald-600 hover:bg-emerald-700"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        {isEn ? 'Collect Rent' : 'ভাড়া আদায়'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title={isEn ? 'No Outstanding Rents!' : 'কোনো বকেয়া ভাড়া নেই!'}
              description={
                isEn
                  ? 'All rent invoices for the current period have been fully collected.'
                  : 'চলতি সময়ের সকল ফ্ল্যাটের ভাড়া শতভাগ আদায় সম্পন্ন হয়েছে।'
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Collect Payment Modal Dialog */}
      <CollectPaymentDialog
        rent={selectedRentForPayment}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
