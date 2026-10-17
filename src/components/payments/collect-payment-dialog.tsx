'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { MonthlyRent, PaymentMethod, ApiResponse, Payment } from '@/lib/types';
import { formatCurrency, formatBnDate, formatNumber } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUploader } from '@/components/ui/file-uploader';
import { Loader2, CreditCard, CheckCircle2, User, Home, DollarSign, Calendar, Clock } from 'lucide-react';
import { PaymentReceiptDialog } from './payment-receipt-dialog';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const paymentMethods: { value: PaymentMethod; labelBn: string; labelEn: string }[] = [
  { value: 'CASH', labelBn: 'নগদ (Cash)', labelEn: 'Cash' },
  { value: 'BKASH', labelBn: 'বিকাশ (bKash)', labelEn: 'bKash' },
  { value: 'NAGAD', labelBn: 'নগদ (Nagad)', labelEn: 'Nagad' },
  { value: 'ROCKET', labelBn: 'রকেট (Rocket)', labelEn: 'Rocket' },
  { value: 'BANK', labelBn: 'ব্যাংক ট্রান্সফার (Bank)', labelEn: 'Bank Transfer' },
  { value: 'CARD', labelBn: 'কার্ড (Debit/Credit Card)', labelEn: 'Card' },
  { value: 'OTHER', labelBn: 'অন্যান্য (Other)', labelEn: 'Other' },
];

interface CollectPaymentDialogProps {
  rent: MonthlyRent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CollectPaymentDialog({
  rent,
  open,
  onOpenChange,
  onSuccess,
}: CollectPaymentDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [selectedRentId, setSelectedRentId] = useState<string | null>(rent?.id || null);
  const [prevRentId, setPrevRentId] = useState<string | null>(rent?.id || null);

  if (open && rent && rent.id !== prevRentId) {
    setPrevRentId(rent.id);
    setSelectedRentId(rent.id);
  }

  const isEn = language === 'en';

  const tenantId = rent?.agreement?.tenant?.id || rent?.agreement?.tenantId;

  // 1. Fetch all eligible outstanding or partially paid invoices for this tenant
  const { data: outstandingInvoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['tenant-outstanding-rents', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const res = await apiClient.get<ApiResponse<MonthlyRent[]>>(
        `/monthly-rents/outstanding?tenantId=${tenantId}&limit=50`
      );
      return res.data?.data || [];
    },
    enabled: open && !!tenantId,
  });

  // Combine query results and passed rent to ensure the active selection is always present
  const invoiceOptions = React.useMemo(() => {
    const list = outstandingInvoices ? [...outstandingInvoices] : [];
    if (rent && !list.some((i) => i.id === rent.id)) {
      list.unshift(rent);
    }
    return list;
  }, [outstandingInvoices, rent]);

  // The active invoice targeted for this payment
  const activeRent = React.useMemo(() => {
    if (selectedRentId) {
      const found = invoiceOptions.find((i) => i.id === selectedRentId);
      if (found) return found;
    }
    return rent;
  }, [selectedRentId, invoiceOptions, rent]);


  const remaining = activeRent ? activeRent.remainingAmount : 0;

  const paymentSchema = z.object({
    amount: z
      .number({ invalid_type_error: isEn ? 'Enter valid amount' : 'সঠিক টাকার পরিমাণ দিন' })
      .min(1, isEn ? 'Amount must be at least 1' : 'টাকার পরিমাণ কমপক্ষে ১ হতে হবে')
      .max(remaining, isEn ? `Amount cannot exceed ${remaining}` : `বকেয়া ${remaining} টাকার বেশি নেওয়া যাবে না`),
    paymentMethod: z.string().min(1, isEn ? 'Select payment method' : 'পেমেন্ট মেথড নির্বাচন করুন'),
    paymentDate: z
      .string()
      .min(1, isEn ? 'Select payment date' : 'পেমেন্টের তারিখ নির্বাচন করুন')
      .refine(
        (val) => {
          if (!val) return true;
          const selected = new Date(val);
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          return selected <= today;
        },
        { message: isEn ? 'Payment date cannot be in the future' : 'পেমেন্টের তারিখ ভবিষ্যতের তারিখ হতে পারে না' }
      ),
    transactionId: z.string().optional(),
    note: z.string().optional(),
  });

  type PaymentFormValues = z.infer<typeof paymentSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    values: {
      amount: remaining,
      paymentMethod: 'CASH',
      paymentDate: getTodayString(),
      transactionId: '',
      note: '',
    },
  });

  // Re-populate remaining amount when targeted invoice changes
  React.useEffect(() => {
    if (activeRent) {
      setValue('amount', activeRent.remainingAmount);
    }
  }, [activeRent, setValue]);

  const getMonthLabel = (m: number, y: number) => {
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    return isEn
      ? `${monthsEn[m - 1]} ${y}`
      : `${monthsBn[m - 1]} ${formatNumber(y, 'bn')}`;
  };

  const onSubmit = async (data: PaymentFormValues) => {
    if (!activeRent) return;
    setIsLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<{ payment: Payment; monthlyRent: MonthlyRent }>>(
        '/payments',
        {
          monthlyRentId: activeRent.id,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          paymentDate: data.paymentDate || getTodayString(),
          transactionId: data.transactionId || undefined,
          note: data.note || undefined,
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || (isEn ? 'Payment recorded successfully!' : 'পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে!')
        );
        reset();
        const createdPayment = response.data.data?.payment;
        if (createdPayment) {
          setReceiptPayment({
            ...createdPayment,
            monthlyRent: response.data.data?.monthlyRent || activeRent,
          });
        } else {
          onOpenChange(false);
          if (onSuccess) onSuccess();
        }
      }
    } catch (error: unknown) {
      const errorMsg = getApiErrorMessage(
        error,
        isEn ? 'Failed to record payment' : 'পেমেন্ট গ্রহণ ব্যর্থ হয়েছে।'
      );
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!rent || !activeRent) return null;

  return (
    <>
      <Dialog open={open && !receiptPayment} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            {isEn ? 'Collect Rent Payment' : 'ভাড়া আদায় / পেমেন্ট গ্রহণ'}
          </DialogTitle>
          <DialogDescription>
            {isEn
              ? 'Record a payment against an outstanding or partially paid rent invoice.'
              : 'নির্দিষ্ট বকেয়া বা আংশিক পরিশোধিত ভাড়ার বিলের বিপরীতে পেমেন্ট রেকর্ড করুন।'}
          </DialogDescription>
        </DialogHeader>

        {/* 1. Explicit Rent Month / Invoice Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="invoiceSelect" className="text-xs font-semibold text-slate-800">
              {isEn ? 'Rent Month / Invoice' : 'ভাড়ার মাস ও বিল নির্বাচন'}
            </Label>
            {isLoadingInvoices && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {isEn ? 'Loading bills...' : 'বিল খোঁজা হচ্ছে...'}
              </span>
            )}
          </div>
          <select
            id="invoiceSelect"
            value={activeRent.id}
            onChange={(e) => {
              const chosenId = e.target.value;
              setSelectedRentId(chosenId);
              const chosen = invoiceOptions.find((i) => i.id === chosenId);
              if (chosen) {
                setValue('amount', chosen.remainingAmount);
              }
            }}
            disabled={invoiceOptions.length <= 1}
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-medium"
          >
            {invoiceOptions.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {getMonthLabel(inv.month, inv.year)} — {isEn ? 'Due: ' : 'বকেয়া: '}
                {formatCurrency(inv.remainingAmount, language)}
                {inv.status ? ` (${inv.status})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Bill Summary Card */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" /> {t.tenantName}:
            </span>
            <span className="font-semibold text-slate-900">
              {activeRent.agreement?.tenant?.name || 'Tenant'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-slate-400" /> {t.unitNumber}:
            </span>
            <span className="font-semibold text-slate-900">
              {activeRent.agreement?.unit?.unitNumber} ({activeRent.agreement?.unit?.property?.name})
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" /> {isEn ? 'Rent Month' : 'ভাড়ার মাস'}:
            </span>
            <span className="font-semibold text-emerald-800">
              {getMonthLabel(activeRent.month, activeRent.year)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" /> {isEn ? 'Due Date' : 'পরিশোধের শেষ তারিখ'}:
            </span>
            <span className="font-medium text-slate-900">
              {formatBnDate(activeRent.dueDate, language)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>{isEn ? 'Status' : 'বিল স্ট্যাটাস'}:</span>
            <StatusBadge status={activeRent.status} lang={language} />
          </div>
          <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
            <span className="text-slate-600">{t.total}:</span>
            <span className="font-bold text-slate-900">{formatCurrency(activeRent.totalAmount, language)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 font-medium">
            <span>{t.paid}:</span>
            <span>{formatCurrency(activeRent.paidAmount, language)}</span>
          </div>
          <div className="flex items-center justify-between text-rose-700 font-bold text-base">
            <span>{t.remaining}:</span>
            <span>{formatCurrency(activeRent.remainingAmount, language)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paymentDate">{t.paymentDate || (isEn ? 'Payment Date' : 'পেমেন্টের তারিখ')}</Label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="paymentDate"
                type="date"
                max={getTodayString()}
                className="pl-10 font-semibold text-sm"
                {...register('paymentDate')}
              />
            </div>
            {errors.paymentDate && (
              <p className="text-xs font-medium text-rose-500">{errors.paymentDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{isEn ? 'Payment Amount (৳)' : 'পরিশোধিত টাকার পরিমাণ (৳)'}</Label>
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="amount"
                type="number"
                step="any"
                className="pl-10 font-semibold text-base"
                {...register('amount', { valueAsNumber: true })}
              />
            </div>
            {errors.amount && (
              <p className="text-xs font-medium text-rose-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">{t.paymentMethod}</Label>
            <select
              id="paymentMethod"
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              {...register('paymentMethod')}
            >
              {paymentMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {isEn ? m.labelEn : m.labelBn}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="text-xs font-medium text-rose-500">{errors.paymentMethod.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transactionId">{t.transactionId} ({isEn ? 'Optional' : 'ঐচ্ছিক'})</Label>
            <Input
              id="transactionId"
              type="text"
              placeholder={isEn ? 'e.g. BKASH-TX-987123' : 'যেমন: BKASH-TX-987123'}
              {...register('transactionId')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t.note} ({isEn ? 'Optional' : 'ঐচ্ছিক'})</Label>
            <Input
              id="note"
              type="text"
              placeholder={isEn ? 'e.g. Cash received by owner' : 'যেমন: নগদ গ্রহণ'}
              {...register('note')}
            />
          </div>

          {/* Payment Receipt / Deposit Voucher Upload */}
          <div className="border-t border-slate-100 pt-3">
            <FileUploader
              category="PAYMENT_RECEIPT"
              entityType="payment"
              label={isEn ? 'Payment Proof / Bank Slip (Optional)' : 'টাকা পাওয়ার প্রমাণ / ডিপোজিট স্লিপ (ঐচ্ছিক)'}
              description={isEn ? 'Upload bank deposit slip or screenshot (Max 5MB)' : 'ব্যাংক স্লিপ বা স্ক্রিনশট আপলোড করুন (সর্বোচ্চ ৫MB)'}
              maxSizeMB={5}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.loading}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t.confirm}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {receiptPayment && (
      <PaymentReceiptDialog
        payment={receiptPayment}
        open={!!receiptPayment}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setReceiptPayment(null);
            onOpenChange(false);
            if (onSuccess) onSuccess();
          }
        }}
      />
    )}
  </>
  );
}