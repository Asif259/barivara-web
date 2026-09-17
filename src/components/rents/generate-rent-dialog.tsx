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
import { Property, ApiResponse } from '@/lib/types';
import { getDefaultRentPeriod } from '@/lib/utils';
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
import { Receipt, Loader2, Sparkles } from 'lucide-react';

const monthsBn = [
  { value: 1, label: 'জানুয়ারি (January)' },
  { value: 2, label: 'ফেব্রুয়ারি (February)' },
  { value: 3, label: 'মার্চ (March)' },
  { value: 4, label: 'এপ্রিল (April)' },
  { value: 5, label: 'মে (May)' },
  { value: 6, label: 'জুন (June)' },
  { value: 7, label: 'জুলাই (July)' },
  { value: 8, label: 'আগস্ট (August)' },
  { value: 9, label: 'সেপ্টেম্বর (September)' },
  { value: 10, label: 'অক্টোবর (October)' },
  { value: 11, label: 'নভেম্বর (November)' },
  { value: 12, label: 'ডিসেম্বর (December)' },
];

const generateSchema = z.object({
  year: z.number().min(2020).max(2035),
  month: z.number().min(1).max(12),
  propertyId: z.string().optional(),
  includeCurrentMonthNewTenants: z.boolean(),
});

type GenerateFormValues = {
  year: number;
  month: number;
  propertyId?: string;
  includeCurrentMonthNewTenants: boolean;
};

interface GenerateRentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GenerateRentDialog({
  open,
  onOpenChange,
  onSuccess,
}: GenerateRentDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Properties
  const { data: properties } = useQuery({
    queryKey: ['properties-generate-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties?limit=100');
      return res.data?.data || [];
    },
    enabled: open,
  });

  const defaultPeriod = getDefaultRentPeriod();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      year: defaultPeriod.year,
      month: defaultPeriod.month,
      propertyId: '',
      includeCurrentMonthNewTenants: false,
    },
  });

  // Automatically reset to the previous calendar month when opened
  React.useEffect(() => {
    if (open) {
      const period = getDefaultRentPeriod();
      reset({
        year: period.year,
        month: period.month,
        propertyId: '',
        includeCurrentMonthNewTenants: false,
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: GenerateFormValues) => {
    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
        year: Number(data.year),
        month: Number(data.month),
        includeCurrentMonthNewTenants: !!data.includeCurrentMonthNewTenants,
      };
      if (data.propertyId) {
        payload.propertyId = data.propertyId;
      }

      const res = await apiClient.post<ApiResponse<{ generatedCount: number; message?: string }>>(
        '/monthly-rents/generate',
        payload
      );

      const count = res.data?.data?.generatedCount ?? 0;
      toast.success(
        res.data?.message ||
          (isEn
            ? `Generated ${count} monthly rent invoices successfully!`
            : `মোট ${count} টি ফ্ল্যাটের মাসিক ভাড়ার বিল সফলভাবে তৈরি করা হয়েছে!`)
      );
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isEn ? 'Failed to generate rents' : 'ভাড়া তৈরি করতে সমস্যা হয়েছে।');
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
            <Receipt className="w-5 h-5 text-emerald-600" />
            {t.generateMonthlyRent}
          </DialogTitle>
          <DialogDescription>
            {isEn
              ? 'Automatically generate monthly bills for active rental agreements.'
              : 'সকল সক্রিয় ভাড়া চুক্তির জন্য এক ক্লিকে স্বয়ংক্রিয়ভাবে মাসিক বিল তৈরি করুন।'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="month">{isEn ? 'Month' : 'মাস'}</Label>
              <select
                id="month"
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                {...register('month', { valueAsNumber: true })}
              >
                {monthsBn.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">{isEn ? 'Year' : 'সাল'}</Label>
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
              />
              {errors.year && <p className="text-xs text-rose-500">{errors.year.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyId">{t.propertyName} ({isEn ? 'All or specific property' : 'নির্দিষ্ট বাড়ি বা সকল বাড়ি'})</Label>
            <select
              id="propertyId"
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              {...register('propertyId')}
            >
              <option value="">{isEn ? '-- All Properties --' : '-- সকল বাড়ি --'}</option>
              {properties?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Option for new tenants starting current month (Default: Off) */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70">
            <input
              type="checkbox"
              id="includeCurrentMonthNewTenants"
              className="h-4 w-4 mt-0.5 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              {...register('includeCurrentMonthNewTenants')}
            />
            <div className="space-y-0.5 leading-tight">
              <Label htmlFor="includeCurrentMonthNewTenants" className="text-xs font-semibold text-slate-800 cursor-pointer">
                {isEn
                  ? "Also generate current month's rent for new tenants who started this month"
                  : 'চলতি মাসে চুক্তি শুরু করা নতুন ভাড়াটিয়াদের চলতি মাসের বিলও একসাথে তৈরি করুন'}
              </Label>
              <p className="text-[11px] text-slate-500">
                {isEn
                  ? 'Default (Off): New tenants starting this month will not receive previous month invoices. Check this if you collect current month rent in advance.'
                  : 'ডিফল্ট (বন্ধ): এই মাসে চুক্তি শুরু করা নতুন ভাড়াটিয়াদের গত মাসের বিল তৈরি হবে না। অগ্রিম ভাড়া আদায়ের জন্য এটি অন করুন।'}
              </p>
            </div>
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
                  <Sparkles className="w-4 h-4" />
                  {t.generateRent}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}