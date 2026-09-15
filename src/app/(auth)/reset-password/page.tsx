'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, KeyRound, Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/translations';
import { useLanguageStore } from '@/stores/language-store';
import { authApi, getApiErrorMessage } from '@/lib/api';

const passwordPattern = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

const resetPasswordSchema = z
  .object({
    identifier: z.string().min(1, 'ইমেইল অথবা মোবাইল নম্বর প্রদান করুন'),
    otp: z.string().length(6, 'ওটিপি কোড অবশ্যই ৬ ডিজিটের হতে হবে'),
    newPassword: z
      .string()
      .min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে')
      .regex(passwordPattern, 'পাসওয়ার্ডে বড়, ছোট হাতের অক্ষর এবং সংখ্যা/চিহ্ন থাকতে হবে'),
    confirmPassword: z.string().min(1, 'নতুন পাসওয়ার্ড নিশ্চিত করুন'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIdentifier = searchParams.get('email') || searchParams.get('identifier') || '';

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
      identifier: initialIdentifier,
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      // 1. Verify OTP
      const verifyRes = await authApi.verifyResetOtp({
        identifier: data.identifier,
        otp: data.otp,
      });

      const resetToken = verifyRes.data?.data?.resetToken;

      // 2. Perform password reset
      const resetRes = await authApi.resetPassword({
        identifier: data.identifier,
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      const successMsg = resetRes.data?.message || t.passwordResetSuccess;
      toast.success(successMsg);
      router.push('/login');
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে। ওটিপি কোড ও তথ্য যাচাই করে পুনরায় চেষ্টা করুন।',
      );
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
        {/* Identifier / Email */}
        <div className="space-y-1.5">
          <Label htmlFor="resetIdentifier">{t.emailOrPhone}</Label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="resetIdentifier"
              type="text"
              placeholder="user@example.com অথবা 01712345678"
              className={`pl-10 rounded-xl ${errors.identifier ? 'border-red-500' : ''}`}
              {...register('identifier')}
            />
          </div>
          {errors.identifier && (
            <p className="text-xs text-red-500">{errors.identifier.message}</p>
          )}
        </div>

        {/* OTP Code */}
        <div className="space-y-1.5">
          <Label htmlFor="resetOtp">{t.otpLabel}</Label>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="resetOtp"
              type="text"
              maxLength={6}
              placeholder={t.otpPlaceholder}
              className={`pl-10 text-center tracking-widest text-lg font-bold rounded-xl ${
                errors.otp ? 'border-red-500' : ''
              }`}
              {...register('otp')}
            />
          </div>
          {errors.otp && (
            <p className="text-xs text-red-500">{errors.otp.message}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <Label htmlFor="resetNewPassword">{t.newPassword}</Label>
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="resetNewPassword"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`pl-10 pr-10 rounded-xl ${errors.newPassword ? 'border-red-500' : ''}`}
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <Label htmlFor="resetConfirmPassword">{t.confirmNewPassword}</Label>
          <div className="relative">
            <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="resetConfirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`pl-10 pr-10 rounded-xl ${errors.confirmPassword ? 'border-red-500' : ''}`}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md mt-2 font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t.resettingPassword}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t.resetPasswordBtn}
            </>
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/forgot-password"
            className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            {t.forgotPasswordTitle}
          </Link>
        </div>

        <div className="text-center pt-1">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t.backToLogin}
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">লোড হচ্ছে...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
