'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { authApi, getApiErrorMessage } from '@/lib/api';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Required' }),
    newPassword: z.string().min(6, { message: 'Must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Required' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordCard() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      const message = response.data?.message || t.passwordChangedSuccess;
      toast.success(message);
      reset();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, 'Failed to change password.');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400"/>
          {t.security}
        </CardTitle>
        <CardDescription>{t.securitySub}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <Label htmlFor="currentPassword">{t.currentPassword}</Label>
            <div className="relative mt-1">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                className={`pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                {...register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <Label htmlFor="newPassword">{t.newPassword}</Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                className={`pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <Label htmlFor="confirmPassword">{t.confirmNewPassword}</Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button className="mt-2 w-full" disabled={isLoading} type="submit">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
            {isLoading ? t.changingPassword : t.changePassword}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}