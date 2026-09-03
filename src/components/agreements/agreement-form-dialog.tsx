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
import { Tenant, Property, Unit, RentalAgreement, ApiResponse } from '@/lib/types';
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
import { FileText, Loader2, Save } from 'lucide-react';

const agreementSchema = z.object({
  tenantId: z.string().min(1, 'ভাড়াটিয়া নির্বাচন করুন'),
  unitId: z.string().min(1, 'ইউনিট নির্বাচন করুন'),
  monthlyRent: z.number().min(0, 'ভাড়ার পরিমাণ দিন'),
  serviceFee: z.number().min(0),
  parkingFee: z.number().min(0),
  extraCharge: z.number().min(0),
  dueDay: z.number().min(1).max(31),
  securityDeposit: z.number().min(0),
  startDate: z.string().min(1, 'চুক্তির শুরুর তারিখ নির্বাচন করুন'),
  endDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional(),
  agreementDocumentId: z.string().optional(),
  generateCurrentMonthRent: z.boolean(),
});

type AgreementFormValues = {
  tenantId: string;
  unitId: string;
  monthlyRent: number;
  serviceFee: number;
  parkingFee: number;
  extraCharge: number;
  dueDay: number;
  securityDeposit: number;
  startDate: string;
  endDate?: string;
  notes?: string;
  agreementDocumentId?: string;
  generateCurrentMonthRent: boolean;
};

interface AgreementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AgreementFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: AgreementFormDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // 1. Fetch Tenants
  const { data: tenants } = useQuery({
    queryKey: ['tenants-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Tenant[]>>('/tenants?limit=100');
      return res.data?.data || [];
    },
    enabled: open,
  });

  // 2. Fetch Properties
  const { data: properties } = useQuery({
    queryKey: ['properties-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties?limit=100');
      return res.data?.data || [];
    },
    enabled: open,
  });

  // 3. Fetch Units for selected property
  const { data: units } = useQuery({
    queryKey: ['units-dropdown', selectedPropertyId],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const res = await apiClient.get<ApiResponse<Unit[]>>(`/properties/${selectedPropertyId}/units?status=VACANT&limit=100`);
      return res.data?.data || [];
    },
    enabled: !!selectedPropertyId && open,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementSchema),
    values: {
      tenantId: '',
      unitId: '',
      monthlyRent: 15000,
      serviceFee: 2000,
      parkingFee: 0,
      extraCharge: 0,
      dueDay: 5,
      securityDeposit: 30000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      notes: '',
      agreementDocumentId: '',
      generateCurrentMonthRent: true,
    },
  });

  const handleUnitSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitId = e.target.value;
    setValue('unitId', unitId);
    const selected = units?.find((u) => u.id === unitId);
    if (selected) {
      setValue('monthlyRent', selected.monthlyBaseRent || 15000);
      setValue('serviceFee', selected.defaultServiceFee || 0);
      setValue('parkingFee', selected.defaultParkingFee || 0);
      setValue('extraCharge', selected.defaultExtraCharge || 0);
    }
  };

  const onSubmit = async (data: AgreementFormValues) => {
    setIsLoading(true);
    try {
      const payload: any = {
        tenantId: data.tenantId,
        unitId: data.unitId,
        monthlyRent: data.monthlyRent,
        serviceFee: data.serviceFee,
        parkingFee: data.parkingFee,
        extraCharge: data.extraCharge,
        dueDay: data.dueDay,
        securityDeposit: data.securityDeposit,
        startDate: new Date(data.startDate).toISOString(),
        generateCurrentMonthRent: data.generateCurrentMonthRent,
      };
      if (data.endDate) {
        payload.endDate = new Date(data.endDate).toISOString();
      }
      if (data.notes) {
        payload.notes = data.notes;
      }
      if (data.agreementDocumentId) {
        payload.agreementDocumentId = data.agreementDocumentId;
      }

      const res = await apiClient.post<ApiResponse<RentalAgreement>>('/rental-agreements', payload);
      toast.success(res.data.message || (isEn ? 'Rental agreement created!' : 'ভাড়া চুক্তি সম্পন্ন হয়েছে!'));
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || (isEn ? 'Failed to create agreement' : 'ভাড়া চুক্তি তৈরি করা সম্ভব হয়নি।');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {t.addNewAgreement}
          </DialogTitle>
          <DialogDescription>
            {isEn
              ? 'Assign a tenant to a vacant unit and set recurring monthly charges.'
              : 'একটি খালি ফ্ল্যাটে ভাড়াটিয়া বরাদ্দ করুন এবং নিয়মিত ভাড়া ও চার্জ নির্ধারণ করুন।'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tenant Select */}
          <div className="space-y-2">
            <Label htmlFor="tenantId">{t.tenantName}</Label>
            <select
              id="tenantId"
              className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              {...register('tenantId')}
            >
              <option value="">{isEn ? '-- Select Tenant --' : '-- ভাড়াটিয়া নির্বাচন করুন --'}</option>
              {tenants?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.phone})
                </option>
              ))}
            </select>
            {errors.tenantId && <p className="text-xs text-rose-500">{errors.tenantId.message}</p>}
          </div>

          {/* Property and Unit Select */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="propertySelect">{t.propertyName}</Label>
              <select
                id="propertySelect"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <option value="">{isEn ? '-- Select Property --' : '-- বাড়ি নির্বাচন করুন --'}</option>
                {properties?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitId">{t.unitNumber} ({isEn ? 'Vacant only' : 'শুধুমাত্র খালি'})</Label>
              <select
                id="unitId"
                onChange={handleUnitSelect}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <option value="">{isEn ? '-- Select Unit --' : '-- ইউনিট নির্বাচন করুন --'}</option>
                {units?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.unitNumber} (ভাড়া: ৳{u.monthlyBaseRent})
                  </option>
                ))}
              </select>
              {errors.unitId && <p className="text-xs text-rose-500">{errors.unitId.message}</p>}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">{t.baseRent} (৳)</Label>
              <Input
                id="monthlyRent"
                type="number"
                {...register('monthlyRent', { valueAsNumber: true })}
              />
              {errors.monthlyRent && <p className="text-xs text-rose-500">{errors.monthlyRent.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceFee">{t.serviceFee} (৳)</Label>
              <Input
                id="serviceFee"
                type="number"
                {...register('serviceFee', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="parkingFee">{t.parkingFee} (৳)</Label>
              <Input
                id="parkingFee"
                type="number"
                {...register('parkingFee', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extraCharge">{t.extraCharge} (৳)</Label>
              <Input
                id="extraCharge"
                type="number"
                {...register('extraCharge', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="securityDeposit">{t.securityDeposit} (৳)</Label>
              <Input
                id="securityDeposit"
                type="number"
                {...register('securityDeposit', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDay">{t.dueDay}</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="31"
                placeholder="5"
                {...register('dueDay', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t.startDate}</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-xs text-rose-500">{errors.startDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t.endDate} ({isEn ? 'Optional' : 'ঐচ্ছিক'})</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
            </div>
          </div>

          {/* Auto Generate Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="generateCurrentMonthRent"
              className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
              {...register('generateCurrentMonthRent')}
            />
            <Label htmlFor="generateCurrentMonthRent" className="text-xs text-slate-700 cursor-pointer">
              {isEn ? 'Generate current month rent invoice immediately' : 'তাত্ক্ষণিকভাবে চলতি মাসের ভাড়ার বিল তৈরি করুন'}
            </Label>
          </div>

          {/* Agreement Contract Scan Upload */}
          <div className="border-t border-slate-100 pt-3">
            <FileUploader
              category="AGREEMENT_DOCUMENT"
              entityType="agreement"
              label={isEn ? 'Signed Agreement Document (PDF / Scan)' : 'স্বাক্ষরিত চুক্তিপত্র (পিডিএফ বা স্ক্যান কপি)'}
              description={isEn ? 'Upload rental agreement contract (PDF or Images, Max 10MB)' : 'চুক্তিপত্রের কপি আপলোড করুন (PDF বা ছবি, সর্বোচ্চ ১০MB)'}
              maxSizeMB={10}
              value={watch('agreementDocumentId')}
              onChange={(id) => setValue('agreementDocumentId', id || undefined)}
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
                  {t.create}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
