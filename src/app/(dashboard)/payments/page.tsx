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
        description={isEn ? 'Audit trail of all rent collections, methods, and receipts' : 'ভাড়া আদায়ের সকল ট্রানজেকশন, রসিদ এবং পেমেন্ট হিস্ট্রি'}
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
      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : visiblePayments.length > 0 ? (
            <Table>
              <TableHeader className="bg-[#FAFAF9]">
                <TableRow>
                  <TableHead>{t.date}</TableHead>
                  <TableHead>{t.tenantName}</TableHead>
                  <TableHead>{t.unitNumber}</TableHead>
                  <TableHead>{t.amount}</TableHead>
                  <TableHead>{t.paymentMethod}</TableHead>
                  <TableHead>{t.transactionId}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiblePayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell data-label={t.date} className="text-xs text-[#6B7280] font-medium">
                      {formatBnDate(payment.paymentDate, language)}
                    </TableCell>
                    <TableCell data-label={t.tenantName} className="min-w-[250px]">
                      <div className="flex items-center gap-3">
                        <TenantAvatar
                          profilePictureId={payment.monthlyRent?.agreement?.tenant?.profilePictureId}
                          name={payment.monthlyRent?.agreement?.tenant?.name || 'Tenant'}
                          size="md"
                          onClick={() => payment.monthlyRent?.agreement?.tenant?.id && window.open(`/tenants/${payment.monthlyRent.agreement.tenant.id}`, '_blank')}
                          ariaLabel={isEn ? 'View tenant profile' : 'ভাড়াটিয়ার প্রোফাইল দেখুন'}
                        />
                        <div className="min-w-0"><p className="truncate font-medium text-[#171717]">{payment.monthlyRent?.agreement?.tenant?.name || 'Tenant'}</p><p className="mt-0.5 text-xs text-[#6B7280]">{payment.monthlyRent?.agreement?.tenant?.phone || (isEn ? 'No phone number' : 'ফোন নম্বর নেই')}</p></div>
                      </div>
                    </TableCell>
                    <TableCell data-label={t.unitNumber}>
                      <div className="text-right sm:text-left">
                        <span className="font-medium text-[#374151]">
                          {payment.monthlyRent?.agreement?.unit?.unitNumber}
                        </span>
                        <span className="block text-xs text-[#6B7280]">
                          {payment.monthlyRent?.agreement?.unit?.property?.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell data-label={t.amount} className="font-semibold text-[#12664F] text-sm">
                      {formatCurrency(payment.amount, language)}
                    </TableCell>
                    <TableCell data-label={t.paymentMethod} className="text-xs font-semibold text-[#374151]">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAFAF9] border border-[#E5E7EB]">
                        {payment.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell data-label={t.transactionId} className="font-mono text-xs text-[#6B7280]">
                      {payment.transactionId || '-'}
                    </TableCell>
                    <TableCell data-label={t.status}>
                      <StatusBadge status={payment.status} lang={language} />
                    </TableCell>
                    <TableCell data-label={t.actions} className="text-right">
                      <div className="flex items-center justify-end gap-1.5 table-actions">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewReceipt(payment)}
                          className="h-8 gap-1.5 text-xs px-2.5 rounded-lg text-[#374151] hover:text-[#12664F] hover:bg-[#F3FAF5]"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#12664F]" />
                          <span>{t.receipt || (isEn ? 'Receipt' : 'মানি রিসিট')}</span>
                        </Button>

                        {payment.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReversePayment(payment.id, payment.amount)}
                            className="h-8 text-xs text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEF7F7] gap-1"
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
            <EmptyState
              icon={CreditCard}
              title={isEn ? 'No Payment Transactions' : 'কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি'}
              description={isEn ? 'Recorded rent payments will appear here' : 'ভাড়া আদায় করলে তার ট্রানজেকশন তালিকা এখানে দেখতে পাবেন'}
            />
          )}
        </CardContent>
      </Card>

      {/* Payment Receipt Modal */}
      <PaymentReceiptDialog
        payment={selectedPayment}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />
    </div>
  );
}