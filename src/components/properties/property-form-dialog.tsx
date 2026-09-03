'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Property, ApiResponse } from '@/lib/types';
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
import { Building2, Loader2, Save } from 'lucide-react';

const propertySchema = z.object({
  name: z.string().min(2, 'বাড়ির নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  address: z.string().min(3, 'সঠিক ঠিকানা লিখুন'),
  city: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  description: z.string().optional(),
  totalFloors: z.number().min(1, 'কমপক্ষে ১ তলা হতে হবে'),
});

type PropertyFormValues = {
  name: string;
  address: string;
  city?: string;
  district?: string;
  postalCode?: string;
  description?: string;
  totalFloors: number;
};

interface PropertyFormDialogProps {
  property?: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PropertyFormDialog({
  property,
  open,
  onOpenChange,
  onSuccess,
}: PropertyFormDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!property;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    values: {
      name: property?.name || '',
      address: property?.address || '',
      city: property?.city || '',
      district: property?.district || '',
      postalCode: property?.postalCode || '',
      description: property?.description || '',
      totalFloors: property?.totalFloors || 1,
    },
  });

  const onSubmit = async (data: PropertyFormValues) => {
    setIsLoading(true);
    try {
      if (isEditing && property) {
        const res = await apiClient.patch<ApiResponse<Property>>(`/properties/${property.id}`, data);
        toast.success(res.data.message || (isEn ? 'Property updated successfully!' : 'বাড়ির তথ্য সফলভাবে হালনাগাদ করা হয়েছে!'));
      } else {
        const res = await apiClient.post<ApiResponse<Property>>('/properties', data);
        toast.success(res.data.message || (isEn ? 'Property created successfully!' : 'নতুন বাড়ি সফলভাবে যুক্ত করা হয়েছে!'));
      }
      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || (isEn ? 'Failed to save property' : 'বাড়ি সংরক্ষণ ব্যর্থ হয়েছে।');
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
            <Building2 className="w-5 h-5 text-emerald-600" />
            {isEditing ? t.editProperty : t.addNewProperty}
          </DialogTitle>
          <DialogDescription>
            {isEn
              ? 'Enter the details of your residential or commercial building.'
              : 'আপনার আবাসিক বা বাণিজ্যিক ভবনের বিবরণ লিখুন।'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.propertyName}</Label>
            <Input
              id="name"
              placeholder={isEn ? 'e.g. Green View Tower' : 'যেমন: গ্রিন ভিউ ভিলা'}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t.address}</Label>
            <Input
              id="address"
              placeholder={isEn ? 'House 10, Road 4, Dhanmondi' : 'বাড়ি # ১০, রোড # ৪, ধানমন্ডি'}
              {...register('address')}
            />
            {errors.address && <p className="text-xs text-rose-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">{t.city}</Label>
              <Input id="city" placeholder={isEn ? 'Dhaka' : 'ঢাকা'} {...register('city')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">{t.district}</Label>
              <Input id="district" placeholder={isEn ? 'Dhaka' : 'ঢাকা'} {...register('district')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="postalCode">{t.postalCode}</Label>
              <Input id="postalCode" placeholder="1205" {...register('postalCode')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalFloors">{t.totalFloors}</Label>
              <Input
                id="totalFloors"
                type="number"
                min="1"
                {...register('totalFloors', { valueAsNumber: true })}
              />
              {errors.totalFloors && <p className="text-xs text-rose-500">{errors.totalFloors.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{isEn ? 'Description' : 'বিবরণ'}</Label>
            <Input
              id="description"
              placeholder={isEn ? 'e.g. 6-storied building with lift' : 'যেমন: লিফট সুবিধা সহ ৬ তলা ভবন'}
              {...register('description')}
            />
          </div>

          {/* Property Image Upload */}
          <div className="border-t border-slate-100 pt-3">
            <FileUploader
              category="PROPERTY_IMAGE"
              entityType="property"
              entityId={property?.id}
              label={isEn ? 'Property Cover Photo' : 'বাড়ির কভার ছবি / ফটো'}
              description={isEn ? 'Upload a high-quality building photo (Max 5MB)' : 'বাড়ির পরিষ্কার ছবি আপলোড করুন (সর্বোচ্চ ৫MB)'}
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
