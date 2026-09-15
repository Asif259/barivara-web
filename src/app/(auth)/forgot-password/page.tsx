'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, KeyRound, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/translations';
import { useLanguageStore } from '@/stores/language-store';
import { authApi, getApiErrorMessage } from '@/lib/api';

const resetPasswordSchema = z
  .object({
    email: z.string().min(1, { message: 'Required' }).email({ message: 'Invalid email address' }),
    otp: z.string().min(4, { message: 'OTP is required' }),
    newPassword: z.string().min(6, { message: 'Must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Required' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      // 1. Verify OTP to obtain reset token
      const verifyRes = await authApi.verifyResetOtp({
        email: data.email,
        otp: data.otp,
      });

      const resetToken = verifyRes.data?.data?.resetToken;
      if (!resetToken) {
        throw new Error('Failed to obtain reset token from OTP verification.');
      }

      // 2. Perform password reset with reset token
      const resetRes = await authApi.resetPassword({
        resetToken,
        newPassword: data.newPassword,
      });

      const successMsg = resetRes.data?.message || t.passwordResetSuccess;
      toast.success(successMsg);
      router.push('/login');
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, 'Password reset failed. Please check your OTP and try again.');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t.resetPasswordTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t.resetPasswordSub}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <Label htmlFor="email">{t.email}</Label>
          <div className="relative mt-1">
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              {...register('email')}
            />
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* OTP Code */}
        <div>
          <Label htmlFor="otp">{t.otpLabel}</Label>
          <div className="relative mt-1">
            <Input
              id="otp"
              type="text"
              placeholder={t.otpPlaceholder}
              className={`pl-10 ${errors.otp ? 'border-red-500' : ''}`}
              {...register('otp')}
            />
            <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          </div>
          {errors.otp && (
            <p className="mt-1 text-xs text-red-500">{errors.otp.message}</p>
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

        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2" disabled={isLoading} type="submit">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
              {t.resettingPassword}
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-2"/>
              {t.resetPasswordBtn}
            </>
          )}
        </Button>

        <div className="text-center pt-2">
          <Link className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200" href="/login">
            <ArrowLeft className="w-4 h-4 mr-1"/>
            {t.backToLogin}
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center text-slate-500">Loading...</div>}>
      <ResetPasswordForm/>
    </Suspense>
  );
}
