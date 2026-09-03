'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Payment, ApiResponse } from '@/lib/types';
import { formatCurrency, formatBnDate } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
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
import {
  CreditCard,
  FileText,
  RotateCcw,
  CheckCircle2,
  Calendar,
  DollarSign,
} from 'lucide-react';

export default function PaymentsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [methodFilter, setMethodFilter] = useState<string>('');
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
      const res = await apiClient.post<ApiResponse<any>>(`/payments/${id}/reverse`);
      toast.success(res.data.message || (isEn ? 'Payment reversed successfully' : 'পেমেন্ট সফলভাবে রিভার্স করা হয়েছে'));
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isEn ? 'Failed to reverse payment' : 'পেমেন্ট বাতিল সম্ভব হয়নি'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.payments}
        description={isEn ? 'Audit trail of all rent collections, methods, and receipts' : 'ভাড়া আদায়ের সকল ট্রানজেকশন, রসিদ এবং পেমেন্ট হিস্ট্রি'}
      />

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-semibold text-slate-500">{t.paymentMethod}:</span>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none"
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

      {/* Payments Table */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
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
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-xs text-slate-600 font-medium">
                      {formatBnDate(payment.paymentDate, language)}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      {payment.monthlyRent?.agreement?.tenant?.name || 'Tenant'}
                      <span className="block text-xs font-normal text-slate-500">
                        {payment.monthlyRent?.agreement?.tenant?.phone}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-800">
                        {payment.monthlyRent?.agreement?.unit?.unitNumber}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {payment.monthlyRent?.agreement?.unit?.property?.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-emerald-600 text-sm">
                      {formatCurrency(payment.amount, language)}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                        {payment.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {payment.transactionId || '-'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} lang={language} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewReceipt(payment)}
                          className="h-8 gap-1.5 text-xs px-2.5 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{t.receipt || (isEn ? 'Receipt' : 'মানি রিসিট')}</span>
                        </Button>

                        {payment.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReversePayment(payment.id, payment.amount)}
                            className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1"
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
