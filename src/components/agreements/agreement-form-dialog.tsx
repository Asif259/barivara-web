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
import { Tenant, Property, Unit, RentalAgreement, ApiResponse, AgreementStatus } from '@/lib/types';
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
import { FileText, Loader2, Save, AlertCircle, ExternalLink } from 'lucide-react';

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
  status: z.enum(['ACTIVE', 'ENDED', 'CANCELLED']).optional(),
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
  status?: AgreementStatus;
  notes?: string;
  agreementDocumentId?: string;
  generateCurrentMonthRent: boolean;
};

const defaultAgreementValues: AgreementFormValues = {
  tenantId: '',
  unitId: '',
  monthlyRent: 1300,
  serviceFee: 2000,
  parkingFee: 0,
  extraCharge: 0,
  securityDeposit: 15000,
  dueDay: 10,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  status: 'ACTIVE',
  notes: '',
  agreementDocumentId: '',
  generateCurrentMonthRent: false,
};

interface AgreementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  agreement?: RentalAgreement | null;
  isEditing?: boolean;
}

export function AgreementFormDialog({
  open,
  onOpenChange,
  onSuccess,
  agreement,
  isEditing = false,
}: AgreementFormDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // 1. Fetch full agreement details before editing
  const { data: fetchedAgreement, isLoading: isFetchingAgreement } = useQuery({
    queryKey: ['agreement-detail', agreement?.id],
    queryFn: async () => {
      if (!agreement?.id) return null;
      const res = await apiClient.get<ApiResponse<RentalAgreement>>(`/rental-agreements/${agreement.id}`);
      return res.data?.data || null;
    },
    enabled: !!agreement?.id && open && isEditing,
  });

  const activeAgreementData = isEditing ? (fetchedAgreement || agreement) : null;

  // 2. Fetch Tenants
  const { data: tenants } = useQuery({
    queryKey: ['tenants-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Tenant[]>>('/tenants?limit=100');
      return res.data?.data || [];
    },
    enabled: open,
  });

  // 3. Fetch Properties
  const { data: properties } = useQuery({
    queryKey: ['properties-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties?limit=100');
      return res.data?.data || [];
    },
    enabled: open,
  });

  // 4. Fetch Units for selected property (Include current unit if editing)
  const activeAgreementUnitId = activeAgreementData?.unitId;
  const { data: units } = useQuery({
    queryKey: ['units-dropdown', selectedPropertyId, isEditing ? activeAgreementUnitId : ''],
    queryFn: async () => {
      if (!selectedPropertyId) return [];
      const res = await apiClient.get<ApiResponse<Unit[]>>(`/properties/${selectedPropertyId}/units?limit=100`);
      const allUnits = res.data?.data || [];
      if (isEditing && activeAgreementUnitId) {
        return allUnits.filter((u) => u.status === 'VACANT' || u.id === activeAgreementUnitId);
      }
      return allUnits.filter((u) => u.status === 'VACANT');
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
    defaultValues: defaultAgreementValues,
  });

  // Reset & Populate Form with freshly fetched data
  React.useEffect(() => {
    if (open) {
      if (isEditing) {
        const current = fetchedAgreement || agreement;
        if (current) {
          reset({
            tenantId: current.tenantId || '',
            unitId: current.unitId || '',
            monthlyRent: Number(current.monthlyRent) || 0,
            serviceFee: Number(current.serviceFee) || 0,
            parkingFee: Number(current.parkingFee) || 0,
            extraCharge: Number(current.extraCharge) || 0,
            securityDeposit: Number(current.securityDeposit) || 0,
            dueDay: current.dueDay || 10,
            startDate: current.startDate ? current.startDate.split('T')[0] : '',
            endDate: current.endDate ? current.endDate.split('T')[0] : '',
            status: current.status || 'ACTIVE',
            notes: current.notes || '',
            agreementDocumentId: current.agreementDocumentId || '',
            generateCurrentMonthRent: false,
          });
          const propId = current.unit?.propertyId || (current.unit as unknown as { property?: { id?: string } })?.property?.id;
          if (propId) {
            setSelectedPropertyId(propId);
          }
        }
      } else {
        reset(defaultAgreementValues);
        setSelectedPropertyId('');
      }
    }
  }, [open, isEditing, agreement, fetchedAgreement, reset]);

  // Check if selected tenant already has an ACTIVE agreement
  const selectedTenantId = watch('tenantId');
  const { data: tenantActiveAgreements, isLoading: isCheckingTenant } = useQuery({
    queryKey: ['tenant-active-agreements', selectedTenantId, isEditing ? agreement?.id : ''],
    queryFn: async () => {
      if (!selectedTenantId) return [];
      const res = await apiClient.get<ApiResponse<RentalAgreement[]>>(
        `/rental-agreements?tenantId=${selectedTenantId}&status=ACTIVE&limit=5`
      );
      const agreementsList = res.data?.data || [];
      if (isEditing && agreement) {
        return agreementsList.filter((a) => a.id !== agreement.id);
      }
      return agreementsList;
    },
    enabled: !!selectedTenantId && open && !isEditing,
  });

  const activeAgreement =
    tenantActiveAgreements && tenantActiveAgreements.length > 0
      ? tenantActiveAgreements[0]
      : null;
  const hasActiveAgreement = !isEditing && !!activeAgreement;

  const handleUnitSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unitId = e.target.value;
    setValue('unitId', unitId);
    const selected = units?.find((u) => u.id === unitId);
    if (selected) {
      if (selected.monthlyBaseRent && selected.monthlyBaseRent > 0) {
        setValue('monthlyRent', selected.monthlyBaseRent);
      }
      if (selected.defaultServiceFee && selected.defaultServiceFee > 0) {
        setValue('serviceFee', selected.defaultServiceFee);
      }
      if (selected.defaultParkingFee && selected.defaultParkingFee > 0) {
        setValue('parkingFee', selected.defaultParkingFee);
      }
      if (selected.defaultExtraCharge && selected.defaultExtraCharge > 0) {
        setValue('extraCharge', selected.defaultExtraCharge);
      }
    }
  };

  const onSubmit = async (data: AgreementFormValues) => {
    setIsLoading(true);
    try {
      const payload: Record<string, unknown> = {
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
      } else if (isEditing) {
        payload.endDate = null;
      }

      if (data.notes !== undefined) {
        payload.notes = data.notes;
      }

      if (data.agreementDocumentId !== undefined) {
        payload.agreementDocumentId = data.agreementDocumentId || null;
      }

      if (isEditing && data.status) {
        payload.status = data.status;
      }

      let res;
      if (isEditing && agreement) {
        res = await apiClient.patch<ApiResponse<RentalAgreement>>(
          `/rental-agreements/${agreement.id}`,
          payload
        );
      } else {
        res = await apiClient.post<ApiResponse<RentalAgreement>>(
          '/rental-agreements',
          payload
        );
      }

      toast.success(
        res.data.message ||
          (isEn
            ? isEditing
              ? 'Rental agreement updated successfully!'
              : 'Rental agreement created successfully!'
            : isEditing
            ? 'ভাড়া চুক্তি সফলভাবে হালনাগাদ করা হয়েছে!'
            : 'ভাড়া চুক্তি সফলভাবে সম্পন্ন হয়েছে!')
      );
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const errorMsg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isEn
          ? isEditing
            ? 'Failed to update agreement'
            : 'Failed to create agreement'
          : isEditing
          ? 'চুক্তি হালনাগাদ করা সম্ভব হয়নি।'
          : 'ভাড়া চুক্তি তৈরি করা সম্ভব হয়নি।');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {isEditing ? t.editAgreement : t.addNewAgreement}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? (isEn
                  ? 'Update any of the rental agreement terms, tenant, unit, dates, and charges.'
                  : 'ভাড়া চুক্তির সকল তথ্য (ভাড়াটিয়া, ইউনিট, তারিখ, ফি ও শর্তাবলী) পরিমার্জন করুন।')
              : (isEn
                  ? 'Assign a tenant to a vacant unit and set recurring monthly charges.'
                  : 'একটি খালি ফ্ল্যাটে ভাড়াটিয়া বরাদ্দ করুন এবং নিয়মিত ভাড়া ও চার্জ নির্ধারণ করুন।')}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isFetchingAgreement ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm text-slate-500 font-medium">
              {isEn ? 'Loading agreement details...' : 'চুক্তির তথ্য লোড করা হচ্ছে...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 1. Tenant Select */}
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

              {/* Active Agreement Warning (Create mode only) */}
              {!isEditing && hasActiveAgreement && activeAgreement && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5 text-rose-900">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-rose-950">
                        {t.tenantHasActiveAgreement}
                      </p>
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        {t.tenantActiveAgreementWarning}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/90 p-2.5 rounded-lg border border-rose-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                      {t.currentActiveAgreement}:
                    </span>
                    <div className="flex items-center justify-between text-slate-800 font-medium">
                      <span>
                        {isEn ? 'Unit' : 'ইউনিট'}: {activeAgreement.unit?.unitNumber || '-'} {activeAgreement.unit?.property?.name ? `(${activeAgreement.unit.property.name})` : ''}
                      </span>
                      <span className="font-semibold text-slate-950">৳{activeAgreement.monthlyRent}</span>
                    </div>
                  </div>

                  <div className="pt-0.5 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('/agreements', '_blank')}
                      className="h-7 text-xs gap-1.5 border-rose-300 text-rose-800 hover:bg-rose-100 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {t.viewExistingAgreement}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Property and Unit Select */}
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
                <Label htmlFor="unitId">
                  {t.unitNumber} {isEditing ? '' : `(${isEn ? 'Vacant only' : 'শুধুমাত্র খালি'})`}
                </Label>
                <select
                  id="unitId"
                  value={watch('unitId')}
                  onChange={handleUnitSelect}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="">{isEn ? '-- Select Unit --' : '-- ইউনিট নির্বাচন করুন --'}</option>
                  {units?.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber} ({isEn ? 'Rent' : 'ভাড়া'}: ৳{u.monthlyBaseRent})
                    </option>
                  ))}
                </select>
                {errors.unitId && <p className="text-xs text-rose-500">{errors.unitId.message}</p>}
              </div>
            </div>

            {/* 3. Base Rent & Service Fee */}
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

            {/* 4. Parking Fee & Extra Charge */}
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

            {/* 5. Security Deposit & Due Day */}
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
                  placeholder="10"
                  {...register('dueDay', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* 6. Start Date & End Date */}
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

            {/* 7. Agreement Status (Edit mode only) */}
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">{t.status || 'স্ট্যাটাস'}</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  {...register('status')}
                >
                  <option value="ACTIVE">{isEn ? 'ACTIVE (Active Agreement)' : 'সক্রিয় (ACTIVE)'}</option>
                  <option value="ENDED">{isEn ? 'ENDED (Terminated Agreement)' : 'সমাপ্ত (ENDED)'}</option>
                  <option value="CANCELLED">{isEn ? 'CANCELLED (Cancelled)' : 'বাতিল (CANCELLED)'}</option>
                </select>
              </div>
            )}

            {/* 8. Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t.note} ({isEn ? 'Optional' : 'ঐচ্ছিক'})</Label>
              <Input
                id="notes"
                placeholder={isEn ? 'E.g. 1-year lease, special terms...' : 'যেমন: ১ বছরের চুক্তি, বিশেষ শর্তাবলী...'}
                {...register('notes')}
              />
            </div>

            {/* 9. Auto Generate Checkbox (Create mode only) */}
            {!isEditing && (
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
            )}

            {/* 10. Agreement Contract Scan Upload */}
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
              <Button
                type="submit"
                variant="gradient"
                disabled={isLoading || (!isEditing && hasActiveAgreement) || isCheckingTenant}
                className="gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing
                      ? t.save
                      : hasActiveAgreement
                      ? (isEn ? 'Active Agreement Exists' : 'সক্রিয় চুক্তি রয়েছে')
                      : t.create}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}