'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Tenant, ApiResponse } from '@/lib/types';
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
import { UserPlus, User, Loader2, Save } from 'lucide-react';

const tenantSchema = z.object({
  name: z.string().min(2, 'ভাড়াটিয়ার নাম লিখুন'),
  phone: z.string().min(11, '১১ ডিজিটের সঠিক মোবাইল নম্বর দিন'),
  email: z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  nid: z.string().optional(),
  nidImageId: z.string().optional().nullable(),
  permanentAddress: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  occupation: z.string().optional(),
  notes: z.string().optional(),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface TenantFormDialogProps {
  tenant?: Tenant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TenantFormDialog({
  tenant,
  open,
  onOpenChange,
  onSuccess,
}: TenantFormDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!tenant;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    values: {
      name: tenant?.name || '',
      phone: tenant?.phone || '',
      email: tenant?.email || '',
      nid: tenant?.nid || '',
      nidImageId: tenant?.nidImageId || '',
      permanentAddress: tenant?.permanentAddress || '',
      emergencyContactName: tenant?.emergencyContactName || '',
      emergencyContactPhone: tenant?.emergencyContactPhone || '',
      occupation: tenant?.occupation || '',
      notes: tenant?.notes || '',
    },
  });

  const onSubmit = async (data: TenantFormValues) => {
    setIsLoading(true);
    try {
      if (isEditing && tenant) {
        const res = await apiClient.patch<ApiResponse<Tenant>>(`/tenants/${tenant.id}`, data);
        toast.success(res.data.message || (isEn ? 'Tenant updated successfully!' : 'ভাড়াটিয়ার তথ্য সফলভাবে হালনাগাদ করা হয়েছে!'));
      } else {
        const res = await apiClient.post<ApiResponse<Tenant>>('/tenants', data);
        toast.success(res.data.message || (isEn ? 'Tenant created successfully!' : 'নতুন ভাড়াটিয়া যুক্ত করা হয়েছে!'));
      }
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || (isEn ? 'Failed to save tenant' : 'ভাড়াটিয়ার তথ্য সংরক্ষণ ব্যর্থ হয়েছে।');
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
            <User className="w-5 h-5 text-emerald-600" />
            {isEditing ? t.editTenant : t.addNewTenant}
          </DialogTitle>
          <DialogDescription>
            {isEn ? 'Enter tenant personal and contact details.' : 'ভাড়াটিয়ার ব্যক্তিগত ও যোগাযোগের তথ্য দিন।'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name">{t.tenantName}</Label>
              <Input id="name" placeholder={isEn ? 'e.g. Kamal Hossain' : 'যেমন: কামাল হোসেন'} {...register('name')} />
              {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input id="phone" placeholder="01812345678" {...register('phone')} />
              {errors.phone && <p className="text-xs text-rose-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="email">{t.email} ({isEn ? 'Optional' : 'ঐচ্ছিক'})</Label>
              <Input id="email" type="email" placeholder="kamal@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nid">{t.nid}</Label>
              <Input id="nid" placeholder={isEn ? 'National ID Number' : 'এনআইডি নম্বর'} {...register('nid')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="occupation">{t.occupation}</Label>
              <Input id="occupation" placeholder={isEn ? 'e.g. Software Engineer' : 'যেমন: চাকরিজীবী / ব্যবসায়ী'} {...register('occupation')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="permanentAddress">{t.permanentAddress}</Label>
              <Input id="permanentAddress" placeholder={isEn ? 'Village, District' : 'গ্রাম, থানা, জেলা'} {...register('permanentAddress')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">{isEn ? 'Emergency Contact Name' : 'জরুরি যোগাযোগের নাম'}</Label>
              <Input id="emergencyContactName" placeholder={isEn ? 'Contact Person' : 'অভিভাবক/আত্মীয়'} {...register('emergencyContactName')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">{isEn ? 'Emergency Contact Phone' : 'জরুরি যোগাযোগের ফোন'}</Label>
              <Input id="emergencyContactPhone" placeholder="017xxxxxxxx" {...register('emergencyContactPhone')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t.note}</Label>
            <Input id="notes" placeholder={isEn ? 'Family members, references...' : 'পরিবারের সদস্য সংখ্যা বা অন্যান্য তথ্য'} {...register('notes')} />
          </div>

          {/* Tenant NID & Document Upload */}
          <div className="border-t border-slate-100 pt-3">
            <FileUploader
              category="TENANT_NID"
              entityType="tenant"
              entityId={tenant?.id}
              value={watch('nidImageId') || tenant?.nidImageId || null}
              onChange={(id) => setValue('nidImageId', id || '')}
              label={isEn ? 'Tenant NID Card Photo (Private & Secure)' : 'ভাড়াটিয়ার এনআইডি (NID) কার্ডের ছবি / কপি (সুরক্ষিত)'}
              description={isEn ? 'Upload front/back copy of National ID card (Max 5MB)' : 'জাতীয় পরিচয়পত্রের কপি আপলোড করুন (সর্বোচ্চ ৫MB)'}
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
