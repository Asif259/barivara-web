'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Property, Expense, ExpenseCategory, PaymentMethod, ApiResponse } from '@/lib/types';
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
import { Wallet, Loader2, Save } from 'lucide-react';

const expenseCategories: { value: ExpenseCategory; labelBn: string; labelEn: string }[] = [
  { value: 'ELECTRICITY', labelBn: 'বিদ্যুৎ বিল (Electricity)', labelEn: 'Electricity' },
  { value: 'WATER', labelBn: 'পানি/ওয়াসা বিল (Water)', labelEn: 'Water' },
  { value: 'GAS', labelBn: 'গ্যাস বিল (Gas)', labelEn: 'Gas' },
  { value: 'MAINTENANCE', labelBn: 'রক্ষণাবেক্ষণ (Maintenance)', labelEn: 'Maintenance' },
  { value: 'REPAIR', labelBn: 'মেরামত খরচ (Repair)', labelEn: 'Repair' },
  { value: 'SECURITY', labelBn: 'নিরাপত্তা/গার্ডের বেতন (Security)', labelEn: 'Security' },
  { value: 'CLEANING', labelBn: 'পরিচ্ছন্নতা (Cleaning)', labelEn: 'Cleaning' },
  { value: 'SALARY', labelBn: 'কেয়ারটেকার/স্টাফ বেতন (Salary)', labelEn: 'Staff Salary' },
  { value: 'TAX', labelBn: 'হোল্ডিং ট্যাক্স/পৌরকর (Tax)', labelEn: 'Tax' },
  { value: 'OTHER', labelBn: 'অন্যান্য বিবিধ খরচ (Other)', labelEn: 'Other' },
];

const paymentMethods: { value: PaymentMethod; labelBn: string; labelEn: string }[] = [
  { value: 'CASH', labelBn: 'নগদ (Cash)', labelEn: 'Cash' },
  { value: 'BKASH', labelBn: 'বিকাশ (bKash)', labelEn: 'bKash' },
  { value: 'NAGAD', labelBn: 'নগদ (Nagad)', labelEn: 'Nagad' },
  { value: 'BANK', labelBn: 'ব্যাংক (Bank)', labelEn: 'Bank' },
  { value: 'OTHER', labelBn: 'অন্যান্য (Other)', labelEn: 'Other' },
];

const expenseSchema = z.object({
  propertyId: z.string().min(1, 'বাড়ি নির্বাচন করুন'),
  category: z.string().min(1, 'খরচের খাত নির্বাচন করুন'),
  amount: z.number().min(1, 'টাকার পরিমাণ দিন'),
  expenseDate: z.string().min(1, 'তারিখ নির্বাচন করুন'),
  description: z.string().optional(),
  paymentMethod: z.string(),
  reference: z.string().optional(),
  receiptFileId: z.string().optional(),
  createdBy: z.string().optional(),
});

type ExpenseFormValues = {
  propertyId: string;
  category: string;
  amount: number;
  expenseDate: string;
  description?: string;
  paymentMethod: string;
  reference?: string;
  receiptFileId?: string;
  createdBy?: string;
};

interface ExpenseFormDialogProps {
  expense?: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ExpenseFormDialog({
  expense,
  open,
  onOpenChange,
  onSuccess,
}: ExpenseFormDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!expense;

  // Fetch Properties
  const { data: properties } = useQuery({
    queryKey: ['properties-expense-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties?limit=100');
      return res.data?.data || [];
    },
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    values: {
      propertyId: expense?.propertyId || '',
      category: expense?.category || 'ELECTRICITY',
      amount: expense?.amount || 0,
      expenseDate: expense?.expenseDate
        ? new Date(expense.expenseDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      description: expense?.description || '',
      paymentMethod: expense?.paymentMethod || 'CASH',
      reference: expense?.reference || '',
      receiptFileId: expense?.receiptFileId || '',
      createdBy: expense?.createdBy || '',
    },
  });

  const onSubmit = async (data: ExpenseFormValues) => {
    setIsLoading(true);
    try {
      const payload: any = {
        propertyId: data.propertyId,
        category: data.category,
        amount: data.amount,
        expenseDate: new Date(data.expenseDate).toISOString(),
        paymentMethod: data.paymentMethod,
        description: data.description || undefined,
        reference: data.reference || undefined,
        receiptFileId: data.receiptFileId || undefined,
        createdBy: data.createdBy || undefined,
      };

      if (isEditing && expense) {
        const res = await apiClient.patch<ApiResponse<Expense>>(`/expenses/${expense.id}`, payload);
        toast.success(res.data.message || (isEn ? 'Expense updated!' : 'খরচের তথ্য হালনাগাদ করা হয়েছে!'));
      } else {
        const res = await apiClient.post<ApiResponse<Expense>>('/expenses', payload);
        toast.success(res.data.message || (isEn ? 'Expense recorded!' : 'খরচের রেকর্ড যুক্ত করা হয়েছে!'));
      }
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || (isEn ? 'Failed to save expense' : 'খরচ সংরক্ষণ সম্ভব হয়নি।');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            {isEditing ? (isEn ? 'Edit Expense' : 'খরচ এডিট করুন') : (isEn ? 'Record Property Expense' : 'নতুন খরচ যুক্ত করুন')}
          </DialogTitle>
          <DialogDescription>
            {isEn ? 'Track electricity, maintenance, and building costs.' : 'বাড়ির বিদ্যুৎ, গ্যাস বা রক্ষণাবেক্ষণ খরচ লিপিবদ্ধ করুন।'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyId">{t.propertyName}</Label>
            <select
              id="propertyId"
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              {...register('propertyId')}
            >
              <option value="">{isEn ? '-- Select Property --' : '-- বাড়ি নির্বাচন করুন --'}</option>
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.propertyId && <p className="text-xs text-rose-500">{errors.propertyId.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">{isEn ? 'Category' : 'খরচের খাত'}</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                {...register('category')}
              >
                {expenseCategories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {isEn ? c.labelEn : c.labelBn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t.amount} (৳)</Label>
              <Input
                id="amount"
                type="number"
                step="any"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expenseDate">{t.date}</Label>
              <Input id="expenseDate" type="date" {...register('expenseDate')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">{t.paymentMethod}</Label>
              <select
                id="paymentMethod"
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                {...register('paymentMethod')}
              >
                {paymentMethods.map((m) => (
                  <option key={m.value} value={m.value}>
                    {isEn ? m.labelEn : m.labelBn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{isEn ? 'Description' : 'বিবরণ'}</Label>
            <Input
              id="description"
              placeholder={isEn ? 'e.g. Common area light repair' : 'যেমন: কমন প্যাসেজের লাইট ও ওয়্যারিং মেরামত'}
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="reference">{isEn ? 'Voucher / Bill No.' : 'ভাউচার / বিল নম্বর'}</Label>
              <Input id="reference" placeholder="DESCO-88219" {...register('reference')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="createdBy">{isEn ? 'Paid By' : 'খরচকারী'}</Label>
              <Input id="createdBy" placeholder={isEn ? 'Manager' : 'ম্যানেজার'} {...register('createdBy')} />
            </div>
          </div>

          {/* Expense Bill / Voucher Upload */}
          <div className="border-t border-slate-100 pt-3">
            <FileUploader
              category="OTHER"
              entityType="expense"
              entityId={expense?.id}
              label={isEn ? 'Attach Bill / Memo / Receipt (Optional)' : 'বিল / মেমো / রশিদের ছবি বা ডকুমেন্ট (ঐচ্ছিক)'}
              description={isEn ? 'Upload electricity bill, memo scan or receipt (Max 5MB)' : 'বিদ্যুৎ বিলের কপি বা খরচের মেমো আপলোড করুন (সর্বোচ্চ ৫MB)'}
              maxSizeMB={5}
              value={watch('receiptFileId')}
              onChange={(id) => setValue('receiptFileId', id || undefined)}
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
            <Button type="submit" variant="gradient" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.loading}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? t.save : t.create}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}