'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Payment, ApiResponse } from '@/lib/types';
import { formatCurrency, formatBnDate } from '@/lib/utils';
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
import { PaymentReceiptDialog } from '@/components/payments/payment-receipt-dialog';
import { TenantAvatar } from '@/components/ui/tenant-avatar';
import {
  CreditCard,
  FileText,
  RotateCcw,
  Search,
} from 'lucide-react';

export default function PaymentsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [methodFilter, setMethodFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  // 1. Fetch Payments History
  const {
    data: payments,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['payments-history-list', methodFilter],
    queryFn: async () => {
      const methodParam = methodFilter ? `&paymentMethod=${methodFilter}` : '';
      const res = await apiClient.get<ApiResponse<Payment[]>>(`/payments?limit=100${methodParam}`);
      return res.data?.data || [];
    },
  });

  const visiblePayments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return payments || [];
    return (payments || []).filter((payment) => [payment.monthlyRent?.agreement?.tenant?.name, payment.monthlyRent?.agreement?.tenant?.phone, payment.monthlyRent?.agreement?.unit?.unitNumber, payment.monthlyRent?.agreement?.unit?.property?.name, payment.transactionId].some((value) => value?.toLowerCase().includes(term)));
  }, [payments, search]);

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptOpen(true);
  };

  const handleReversePayment = async (id: string, amount: number) => {
    if (
      !confirm(
        isEn
          ? `Are you sure you want to reverse this payment of ৳${amount}? The tenant's rent balance will be increased back.`
          : `আপনি কি নিশ্চিতভাবে এই ৳${amount} টাকার পেমেন্টটি বাতিল (Reverse) করতে চান? ভাড়ার বকেয়া পুনরায় বৃদ্ধি পাবে।`
      )
    ) {
      return;
    }
    try {
      const res = await apiClient.post<ApiResponse<unknown>>(`/payments/${id}/reverse`);
      toast.success(res.data.message || (isEn ? 'Payment reversed successfully' : 'পেমেন্ট সফলভাবে রিভার্স করা হয়েছে'));
      refetch();
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || (isEn ? 'Failed to reverse payment' : 'পেমেন্ট বাতিল সম্ভব হয়নি'));
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title={t.payments}
        description={isEn ? 'Audit trail of all rent collections, methods, and receipts' : 'ভাড়া আদায়ের সকল ট্রানজেকশন, রশিদ এবং পেমেন্ট হিস্ট্রি'}
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[10px] border border-[#E5E7EB] shadow-none">
        <span className="text-xs font-semibold text-[#6B7280]">{t.paymentMethod}:</span>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-9 rounded-lg border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#374151] outline-none"
        >
          <option value="">{t.all}</option>
          <option value="CASH">Cash (নগদ)</option>
          <option value="BKASH">bKash (বিকাশ)</option>
          <option value="NAGAD">Nagad (নগদ)</option>
          <option value="ROCKET">Rocket (রকেট)</option>
          <option value="BANK">Bank Transfer (ব্যাংক)</option>
          <option value="CARD">Card (কার্ড)</option>
        </select>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9CA3AF]" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isEn ? 'Search tenant, phone, unit, property, or transaction' : 'ভাড়াটিয়া, ফোন, ইউনিট, বাড়ি বা ট্রানজেকশন খুঁজুন'} className="pl-10" />
        </div>
        <p className="text-xs text-[#6B7280]">{visiblePayments.length} {isEn ? 'payments' : 'টি পেমেন্ট'}</p>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <Table className="min-w-[950px]">
          <TableHeader>
            <TableRow>
              <TableHead align="left" className="min-w-[105px]">{t.date}</TableHead>
              <TableHead className="min-w-[220px]">{t.tenantName}</TableHead>
              <TableHead className="min-w-[120px]">{t.unitNumber}</TableHead>
              <TableHead align="right" className="min-w-[110px]">{t.amount}</TableHead>
              <TableHead align="center" className="min-w-[100px]">{t.paymentMethod}</TableHead>
              <TableHead align="left" className="min-w-[120px]">{t.transactionId}</TableHead>
              <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
              <TableHead align="right" className="min-w-[150px]">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeleton columns={8} rows={5} />
          </TableBody>
        </Table>
      ) : visiblePayments.length > 0 ? (
        <Table className="min-w-[950px]">
          <TableHeader>
            <TableRow>
              <TableHead align="left" className="min-w-[105px]">{t.date}</TableHead>
              <TableHead className="min-w-[220px]">{t.tenantName}</TableHead>
              <TableHead className="min-w-[120px]">{t.unitNumber}</TableHead>
              <TableHead align="right" className="min-w-[110px]">{t.amount}</TableHead>
              <TableHead align="center" className="min-w-[100px]">{t.paymentMethod}</TableHead>
              <TableHead align="left" className="min-w-[120px]">{t.transactionId}</TableHead>
              <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
              <TableHead align="right" className="min-w-[150px]">{t.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visiblePayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell align="left" className="text-xs text-[#64748B] whitespace-nowrap">
                  {formatBnDate(payment.paymentDate, language)}
                </TableCell>
                <TableCell className="min-w-[220px]">
                  <div className="flex items-center gap-2.5">
                    <TenantAvatar
                      profilePictureId={payment.monthlyRent?.agreement?.tenant?.profilePictureId}
                      name={payment.monthlyRent?.agreement?.tenant?.name || 'Tenant'}
                      size="sm"
                      onClick={() => payment.monthlyRent?.agreement?.tenant?.id && window.open(`/tenants/${payment.monthlyRent.agreement.tenant.id}`, '_blank')}
                      ariaLabel={isEn ? 'View tenant profile' : 'ভাড়াটিয়ার প্রোফাইল দেখুন'}
                    />
                    <div className="min-w-0 max-w-[160px]">
                      <p className="truncate font-medium text-[#0F172A] text-sm" title={payment.monthlyRent?.agreement?.tenant?.name || 'Tenant'}>
                        {payment.monthlyRent?.agreement?.tenant?.name || 'Tenant'}
                      </p>
                      <p className="truncate text-xs text-[#64748B]" title={payment.monthlyRent?.agreement?.tenant?.phone || ''}>
                        {payment.monthlyRent?.agreement?.tenant?.phone || '—'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <div className="min-w-0">
                    <span className="font-semibold text-[#1E293B] block">
                      {payment.monthlyRent?.agreement?.unit?.unitNumber || '—'}
                    </span>
                    <span className="block text-xs text-[#64748B] truncate max-w-[130px]" title={payment.monthlyRent?.agreement?.unit?.property?.name || ''}>
                      {payment.monthlyRent?.agreement?.unit?.property?.name || '—'}
                    </span>
                  </div>
                </TableCell>
                <TableCell align="right" className="font-semibold text-[#059669] text-sm whitespace-nowrap">
                  {formatCurrency(payment.amount, language)}
                </TableCell>
                <TableCell align="center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F8FAFC] text-[#334155] border border-[#E2E8F0] whitespace-nowrap">
                    {payment.paymentMethod || '—'}
                  </span>
                </TableCell>
                <TableCell align="left" className="font-mono text-xs text-[#64748B] whitespace-nowrap">
                  {payment.transactionId || '—'}
                </TableCell>
                <TableCell align="center">
                  <StatusBadge status={payment.status} lang={language} />
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReceipt(payment)}
                      className="h-8 gap-1.5 text-xs px-2.5 rounded-lg text-[#334155] hover:text-[#059669] hover:bg-[#F0FDF4]"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#059669]" />
                      <span>{t.receipt || (isEn ? 'Receipt' : 'মানি রিসিট')}</span>
                    </Button>

                    {payment.status === 'COMPLETED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReversePayment(payment.id, payment.amount)}
                        className="h-8 text-xs text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEF2F2] gap-1 px-2"
                        title={t.reversePayment}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Reverse' : 'রিভার্স'}</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card className="rounded-[10px] border-[#E2E8F0] shadow-none">
          <CardContent className="p-0">
            <EmptyState
              icon={CreditCard}
              title={isEn ? 'No Payment Transactions' : 'কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি'}
              description={isEn ? 'Recorded rent payments will appear here' : 'ভাড়া আদায় করলে তার ট্রানজেকশন তালিকা এখানে দেখতে পাবেন'}
            />
          </CardContent>
        </Card>
      )}

      {/* Payment Receipt Modal */}
      <PaymentReceiptDialog
        payment={selectedPayment}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />
    </div>
  );
}