'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { unitsApi } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Unit, UnitType, UnitStatus } from '@/lib/types';
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
import { Home, Loader2, Save } from 'lucide-react';

const unitTypes: { value: UnitType; labelBn: string; labelEn: string }[] = [
  { value: 'APARTMENT', labelBn: 'অ্যাপার্টমেন্ট (Apartment)', labelEn: 'Apartment' },
  { value: 'FLAT', labelBn: 'ফ্ল্যাট (Flat)', labelEn: 'Flat' },
  { value: 'ROOM', labelBn: 'একক রুম (Single Room)', labelEn: 'Room' },
  { value: 'SHOP', labelBn: 'দোকান (Shop)', labelEn: 'Shop' },
  { value: 'OFFICE', labelBn: 'অফিস (Office Space)', labelEn: 'Office' },
  { value: 'PARKING', labelBn: 'গ্যারেজ/পার্কিং (Parking)', labelEn: 'Parking' },
  { value: 'OTHER', labelBn: 'অন্যান্য (Other)', labelEn: 'Other' },
];

const unitStatuses: { value: UnitStatus; labelBn: string; labelEn: string }[] = [
  { value: 'VACANT', labelBn: 'খালি (Vacant)', labelEn: 'Vacant' },
  { value: 'OCCUPIED', labelBn: 'ভাড়া দেওয়া (Occupied)', labelEn: 'Occupied' },
  { value: 'MAINTENANCE', labelBn: 'মেরামত চলছে (Maintenance)', labelEn: 'Maintenance' },
  { value: 'INACTIVE', labelBn: 'নিষ্ক্রিয় (Inactive)', labelEn: 'Inactive' },
];

const unitSchema = z.object({
  unitNumber: z.string().min(1, 'ইউনিট নম্বর দিন (যেমন: 4A, Flat-B)'),
  floor: z.number(),
  unitType: z.enum(['APARTMENT', 'FLAT', 'ROOM', 'SHOP', 'OFFICE', 'PARKING', 'OTHER']),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  monthlyBaseRent: z.number().min(0),
  defaultServiceFee: z.number().min(0),
  defaultParkingFee: z.number().min(0),
  defaultExtraCharge: z.number().min(0),
  status: z.enum(['VACANT', 'OCCUPIED', 'MAINTENANCE', 'INACTIVE']),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface UnitFormDialogProps {
  propertyId: string;
  unit?: Unit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UnitFormDialog({
  propertyId,
  unit,
  open,
  onOpenChange,
  onSuccess,
}: UnitFormDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!unit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    values: {
      unitNumber: unit?.unitNumber || '',
      floor: unit?.floor ?? 1,
      unitType: unit?.unitType || 'APARTMENT',
      bedrooms: unit?.bedrooms ?? 3,
      bathrooms: unit?.bathrooms ?? 2,
      monthlyBaseRent: unit?.monthlyBaseRent ?? 15000,
      defaultServiceFee: unit?.defaultServiceFee ?? 2000,
      defaultParkingFee: unit?.defaultParkingFee ?? 0,
      defaultExtraCharge: unit?.defaultExtraCharge ?? 0,
      status: unit?.status || 'VACANT',
    },
  });

  const onSubmit = async (data: UnitFormValues) => {
    setIsLoading(true);
    try {
      if (isEditing && unit) {
        const res = await unitsApi.update(unit.id, data);
        toast.success(res.data.message || (isEn ? 'Unit updated successfully!' : 'ইউনিট সফলভাবে হালনাগাদ করা হয়েছে!'));
      } else {
        const res = await unitsApi.create(propertyId, data);
        toast.success(res.data.message || (isEn ? 'Unit added successfully!' : 'নতুন ইউনিট সফলভাবে যুক্ত করা হয়েছে!'));
      }
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const errorMsg =
        (typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined) || (isEn ? 'Failed to save unit' : 'ইউনিট সংরক্ষণ ব্যর্থ হয়েছে।');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            {isEditing ? t.editUnit : t.addNewUnit}
          </DialogTitle>
          <DialogDescription>
            {isEn ? 'Configure flat or unit rent and charges.' : 'ফ্ল্যাট বা ইউনিটের ভাড়া ও সার্ভিস চার্জ নির্ধারণ করুন।'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="unitNumber">{t.unitNumber}</Label>
              <Input id="unitNumber" placeholder={isEn ? 'e.g. 4A' : 'যেমন: 4A'} {...register('unitNumber')} />
              {errors.unitNumber && <p className="text-xs text-rose-500">{errors.unitNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">{t.floor}</Label>
              <Input id="floor" type="number" {...register('floor', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="unitType">{t.unitType}</Label>
              <select
                id="unitType"
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                {...register('unitType')}
              >
                {unitTypes.map((u) => (
                  <option key={u.value} value={u.value}>
                    {isEn ? u.labelEn : u.labelBn}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t.status}</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                {...register('status')}
              >
                {unitStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {isEn ? s.labelEn : s.labelBn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">{t.bedrooms}</Label>
              <Input id="bedrooms" type="number" {...register('bedrooms', { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">{t.bathrooms}</Label>
              <Input id="bathrooms" type="number" {...register('bathrooms', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div className="space-y-2">
              <Label htmlFor="monthlyBaseRent">{t.baseRent} (৳)</Label>
              <Input
                id="monthlyBaseRent"
                type="number"
                {...register('monthlyBaseRent', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultServiceFee">{t.serviceFee} (৳)</Label>
              <Input
                id="defaultServiceFee"
                type="number"
                {...register('defaultServiceFee', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="defaultParkingFee">{t.parkingFee} (৳)</Label>
              <Input
                id="defaultParkingFee"
                type="number"
                {...register('defaultParkingFee', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultExtraCharge">{t.extraCharge} (৳)</Label>
              <Input
                id="defaultExtraCharge"
                type="number"
                {...register('defaultExtraCharge', { valueAsNumber: true })}
              />
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