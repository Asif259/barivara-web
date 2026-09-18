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
import { PaymentReceiptDialog } from '@/components/payments/payment-receipt-dialog';
import { TenantAvatar } from '@/components/ui/tenant-avatar';
import {
  CreditCard,
  FileText,
  RotateCcw,
  Search,
  User,
} from 'lucide-react';

export default function PaymentsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [methodFilter, setMethodFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);

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

      {/* Payments Responsive Table Container */}
      {isLoading ? (
        <ResponsiveTableContainer>
          <div className="hidden md:block">
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
          </div>
          <div className="block md:hidden">
            <MobileTableSkeleton rows={5} />
          </div>
        </ResponsiveTableContainer>
      ) : visiblePayments.length > 0 ? (
        <ResponsiveTableContainer>
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
          </div>

          {/* Mobile 2-Line Row Representation */}
          <div className="block md:hidden divide-y divide-[#F1F5F9]">
            {visiblePayments.map((payment) => {
              const statusVariant =
                payment.status === 'COMPLETED'
                  ? 'success'
                  : payment.status === 'REVERSED'
                  ? 'danger'
                  : 'warning';

              const statusLabel =
                payment.status === 'COMPLETED'
                  ? (isEn ? 'Paid' : 'পরিশোধিত')
                  : payment.status === 'REVERSED'
                  ? (isEn ? 'Reversed' : 'রিভার্সড')
                  : (isEn ? 'Pending' : 'অপেক্ষমাণ');

              return (
                <MobileDataRow
                  key={payment.id}
                  onClick={() => setDetailPayment(payment)}
                  showChevron
                  identity={
                    <div className="flex items-center gap-2">
                      <TenantAvatar
                        profilePictureId={payment.monthlyRent?.agreement?.tenant?.profilePictureId}
                        name={payment.monthlyRent?.agreement?.tenant?.name || 'Tenant'}
                        size="sm"
                      />
                      <span className="font-semibold text-sm text-[#0F172A] truncate">
                        {payment.monthlyRent?.agreement?.tenant?.name || 'Tenant'}
                      </span>
                    </div>
                  }
                  value={formatCurrency(payment.amount, language)}
                  stateAndDetail={
                    <>
                      <CompactStatus label={statusLabel} variant={statusVariant} />
                      <span className="text-slate-300">·</span>
                      <span>{isEn ? `Paid ${formatBnDate(payment.paymentDate, language)}` : `পরিশোধ ${formatBnDate(payment.paymentDate, language)}`}</span>
                      {payment.monthlyRent?.agreement?.unit?.unitNumber && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span>Unit {payment.monthlyRent.agreement.unit.unitNumber}</span>
                        </>
                      )}
                    </>
                  }
                  action={
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReceipt(payment);
                      }}
                      className="h-8 min-h-[40px] px-2.5 text-xs text-[#059669] border-[#E2E8F0] hover:bg-[#F0FDF4] gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Receipt' : 'রিসিট'}</span>
                    </Button>
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
              icon={CreditCard}
              title={isEn ? 'No Payment Transactions' : 'কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি'}
              description={isEn ? 'Recorded rent payments will appear here' : 'ভাড়া আদায় করলে তার ট্রানজেকশন তালিকা এখানে দেখতে পাবেন'}
            />
          </CardContent>
        </Card>
      )}

      {/* Row Details Bottom Sheet on Mobile */}
      <BottomSheet open={!!detailPayment} onOpenChange={(open) => !open && setDetailPayment(null)}>
        {detailPayment && (
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>
                {detailPayment.monthlyRent?.agreement?.tenant?.name || 'Payment Details'}
              </BottomSheetTitle>
              <BottomSheetDescription>
                {detailPayment.monthlyRent?.agreement?.unit?.property?.name ? `${detailPayment.monthlyRent.agreement.unit.property.name} · ` : ''}
                Unit {detailPayment.monthlyRent?.agreement?.unit?.unitNumber || '—'}
              </BottomSheetDescription>
            </BottomSheetHeader>

            <div className="py-2">
              <DetailItem
                label={isEn ? 'Payment Amount' : 'পরিশোধের পরিমাণ'}
                value={formatCurrency(detailPayment.amount, language)}
                isNumeric
                highlight
              />
              <DetailItem
                label={isEn ? 'Payment Date' : 'পরিশোধের তারিখ'}
                value={formatBnDate(detailPayment.paymentDate, language)}
              />
              <DetailItem
                label={isEn ? 'Payment Method' : 'পেমেন্ট পদ্ধতি'}
                value={detailPayment.paymentMethod || '—'}
              />
              <DetailItem
                label={isEn ? 'Transaction ID' : 'ট্রানজেকশন আইডি'}
                value={detailPayment.transactionId || '—'}
              />
              <DetailItem
                label={isEn ? 'Status' : 'অবস্থা'}
                value={<StatusBadge status={detailPayment.status} lang={language} />}
              />
              {detailPayment.monthlyRent?.agreement?.tenant?.phone && (
                <DetailItem
                  label={isEn ? 'Phone' : 'ফোন'}
                  value={detailPayment.monthlyRent.agreement.tenant.phone}
                />
              )}
            </div>

            <BottomSheetFooter>
              <Button
                onClick={() => {
                  const p = detailPayment;
                  setDetailPayment(null);
                  handleViewReceipt(p);
                }}
                className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] min-h-[44px]"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.receipt || (isEn ? 'View Receipt' : 'মানি রিসিট')}
              </Button>

              {detailPayment.status === 'COMPLETED' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const id = detailPayment.id;
                    const amount = detailPayment.amount;
                    setDetailPayment(null);
                    handleReversePayment(id, amount);
                  }}
                  className="w-full sm:w-auto min-h-[44px] text-[#DC2626] hover:bg-[#FEF2F2] border-[#FCA5A5]"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isEn ? 'Reverse Payment' : 'রিভার্স করুন'}
                </Button>
              )}
            </BottomSheetFooter>
          </BottomSheetContent>
        )}
      </BottomSheet>

      {/* Payment Receipt Modal */}
      <PaymentReceiptDialog
        payment={selectedPayment}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />
    </div>
  );
}