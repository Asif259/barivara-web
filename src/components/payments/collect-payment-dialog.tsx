'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { MonthlyRent, PaymentMethod, ApiResponse, Payment } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
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
import { Loader2, CreditCard, CheckCircle2, User, Building, Home, DollarSign } from 'lucide-react';

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

  const isEn = language === 'en';

  const remaining = rent ? rent.remainingAmount : 0;

  const paymentSchema = z.object({
    amount: z
      .number({ invalid_type_error: isEn ? 'Enter valid amount' : 'সঠিক টাকার পরিমাণ দিন' })
      .min(1, isEn ? 'Amount must be at least 1' : 'টাকার পরিমাণ কমপক্ষে ১ হতে হবে')
      .max(remaining, isEn ? `Amount cannot exceed ${remaining}` : `বকেয়া ${remaining} টাকার বেশি নেওয়া যাবে না`),
    paymentMethod: z.string().min(1, isEn ? 'Select payment method' : 'পেমেন্ট মেথড নির্বাচন করুন'),
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
      transactionId: '',
      note: '',
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    if (!rent) return;
    setIsLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<{ payment: Payment; monthlyRent: MonthlyRent }>>(
        '/payments',
        {
          monthlyRentId: rent.id,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId || undefined,
          note: data.note || undefined,
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || (isEn ? 'Payment recorded successfully!' : 'পেমেন্ট সফলভাবে গ্রহণ করা হয়েছে!')
        );
        reset();
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        (isEn ? 'Failed to record payment' : 'পেমেন্ট গ্রহণ ব্যর্থ হয়েছে।');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!rent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            {isEn ? 'Collect Rent Payment' : 'ভাড়া আদায় / পেমেন্ট গ্রহণ'}
          </DialogTitle>
          <DialogDescription>
            {isEn
              ? 'Record a partial or full payment against this rent bill.'
              : 'এই ভাড়ার বিলের বিপরীতে আংশিক অথবা সম্পূর্ণ ভাড়া গ্রহণ রেকর্ড করুন।'}
          </DialogDescription>
        </DialogHeader>

        {/* Bill Summary Card */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" /> {t.tenantName}:
            </span>
            <span className="font-semibold text-slate-900">
              {rent.agreement?.tenant?.name || 'Tenant'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Home className="w-4 h-4 text-slate-400" /> {t.unitNumber}:
            </span>
            <span className="font-semibold text-slate-900">
              {rent.agreement?.unit?.unitNumber} ({rent.agreement?.unit?.property?.name})
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
            <span className="text-slate-600">{t.total}:</span>
            <span className="font-bold text-slate-900">{formatCurrency(rent.totalAmount, language)}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-700 font-medium">
            <span>{t.paid}:</span>
            <span>{formatCurrency(rent.paidAmount, language)}</span>
          </div>
          <div className="flex items-center justify-between text-rose-700 font-bold text-base">
            <span>{t.remaining}:</span>
            <span>{formatCurrency(rent.remainingAmount, language)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
  );
}
