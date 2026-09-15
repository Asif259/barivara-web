'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  Globe,
  Send,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { authApi, getApiErrorMessage } from '@/lib/api';

const passwordPattern = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

// ============================================================================
// Form Schemas
// ============================================================================

const directResetSchema = z
  .object({
    identifier: z.string().min(1, 'ইমেইল অথবা মোবাইল নম্বর প্রদান করুন'),
    currentPassword: z.string().min(1, 'বর্তমান পাসওয়ার্ড প্রদান করুন'),
    newPassword: z
      .string()
      .min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে')
      .regex(passwordPattern, 'পাসওয়ার্ডে বড়, ছোট হাতের অক্ষর এবং সংখ্যা/চিহ্ন থাকতে হবে'),
    confirmPassword: z.string().min(1, 'নতুন পাসওয়ার্ড নিশ্চিত করুন'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ডের সমান হতে পারবে না',
    path: ['newPassword'],
  });

const requestOtpSchema = z.object({
  identifier: z.string().min(1, 'ইমেইল অথবা মোবাইল নম্বর প্রদান করুন'),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'ওটিপি কোড অবশ্যই ৬ ডিজিটের হতে হবে'),
});

const setNewPasswordSchema = z
  .object({
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

type DirectResetFormValues = z.infer<typeof directResetSchema>;
type RequestOtpFormValues = z.infer<typeof requestOtpSchema>;
type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
type SetNewPasswordFormValues = z.infer<typeof setNewPasswordSchema>;

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIdentifier = searchParams.get('email') || searchParams.get('identifier') || '';

  const { language, setLanguage } = useLanguageStore();
  const t = useTranslation(language);
  const isBn = language === 'bn';

  // Recovery method tab: 'otp' | 'direct'
  const [method, setMethod] = useState<'otp' | 'direct'>('otp');

  // OTP Sub-steps: 1 = Enter Identifier, 2 = Verify OTP, 3 = New Password
  const [otpStep, setOtpStep] = useState<1 | 2 | 3>(1);
  const [otpIdentifier, setOtpIdentifier] = useState(initialIdentifier);
  const [resetToken, setResetToken] = useState<string>('');

  // Password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading flags
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  // Option A (Direct Reset with Known Current Password)
  const directForm = useForm<DirectResetFormValues>({
    resolver: zodResolver(directResetSchema),
    defaultValues: {
      identifier: initialIdentifier,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Option B (Step 1: Request OTP)
  const requestOtpForm = useForm<RequestOtpFormValues>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: {
      identifier: initialIdentifier,
    },
  });

  // Option B (Step 2: Verify OTP)
  const verifyOtpForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Option B (Step 3: Set New Password)
  const setNewPasswordForm = useForm<SetNewPasswordFormValues>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Submit: Option A Direct Reset
  const onDirectSubmit = async (data: DirectResetFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.resetPasswordDirect({
        identifier: data.identifier,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      toast.success(
        response.data?.message || (isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Password changed successfully!'),
      );
      router.push('/login');
    } catch (error: any) {
      const errorMsg = getApiErrorMessage(
        error,
        isBn ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।' : 'Password change failed. Please check your credentials.',
      );
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit: Option B Step 1 Request OTP
  const onRequestOtpSubmit = async (data: RequestOtpFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword({ identifier: data.identifier });
      setOtpIdentifier(data.identifier);
      setOtpStep(2);
      toast.success(
        response.data?.message ||
          (isBn ? 'পাসওয়ার্ড রিসেট ওটিপি আপনার ইমেইলে পাঠানো হয়েছে।' : 'Password reset OTP has been sent to your email.'),
      );
    } catch (error: any) {
      const errorMsg = getApiErrorMessage(
        error,
        isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।' : 'Failed to send OTP. Please try again.',
      );
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit: Option B Step 2 Verify OTP
  const onVerifyOtpSubmit = async (data: VerifyOtpFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyResetOtp({
        identifier: otpIdentifier,
        otp: data.otp,
      });
      const token = response.data?.data?.resetToken || '';
      setResetToken(token);
      setOtpStep(3);
      toast.success(
        response.data?.message || (isBn ? 'ওটিপি কোড যাচাই সফল হয়েছে!' : 'OTP verified successfully!'),
      );
    } catch (error: any) {
      const errorMsg = getApiErrorMessage(
        error,
        isBn ? 'ভুল বা মেয়াদোত্তীর্ণ ওটিপি কোড।' : 'Invalid or expired OTP code.',
      );
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit: Option B Step 3 Set New Password
  const onSetNewPasswordSubmit = async (data: SetNewPasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await authApi.resetPassword({
        identifier: otpIdentifier,
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success(
        response.data?.message || (isBn ? 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে!' : 'Password reset successfully!'),
      );
      router.push('/login');
    } catch (error: any) {
      const errorMsg = getApiErrorMessage(
        error,
        isBn ? 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।' : 'Password reset failed. Please try again.',
      );
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!otpIdentifier) return;
    setIsResending(true);
    try {
      const response = await authApi.forgotPassword({ identifier: otpIdentifier });
      toast.success(
        response.data?.message || (isBn ? 'নতুন ওটিপি কোড পাঠানো হয়েছে।' : 'New OTP code sent.'),
      );
    } catch (error: any) {
      const errorMsg = getApiErrorMessage(
        error,
        isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে।' : 'Failed to resend OTP.',
      );
      toast.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Language Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isBn ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Reset Password'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isBn ? 'অ্যাকাউন্টে প্রবেশের মাধ্যম বেছে নিন' : 'Choose how you want to recover your account'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="gap-1.5 text-xs text-slate-600 rounded-xl shrink-0"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          {isBn ? 'English' : 'বাংলা'}
        </Button>
      </div>

      {/* Choice Segmented Control */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setMethod('otp');
            setOtpStep(1);
          }}
          className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            method === 'otp'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5 shrink-0" />
          <span>{isBn ? 'ইমেইল ওটিপি (OTP)' : 'Email OTP'}</span>
        </button>

        <button
          type="button"
          onClick={() => setMethod('direct')}
          className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            method === 'direct'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 shrink-0" />
          <span>{isBn ? 'আগের পাসওয়ার্ড জানা আছে' : 'I know password'}</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* OPTION A: DIRECT RESET (Knows current password)                     */}
      {/* =================================================================== */}
      {method === 'direct' && (
        <form onSubmit={directForm.handleSubmit(onDirectSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="directIdentifier">{t.emailOrPhone}</Label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="directIdentifier"
                type="text"
                placeholder={isBn ? 'user@example.com অথবা 01712345678' : 'user@example.com or 01712345678'}
                className="pl-10"
                {...directForm.register('identifier')}
              />
            </div>
            {directForm.formState.errors.identifier && (
              <p className="text-xs font-medium text-rose-500">
                {directForm.formState.errors.identifier.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directCurrentPassword">{t.currentPassword}</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="directCurrentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...directForm.register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {directForm.formState.errors.currentPassword && (
              <p className="text-xs font-medium text-rose-500">
                {directForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directNewPassword">{t.newPassword}</Label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="directNewPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...directForm.register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {directForm.formState.errors.newPassword && (
              <p className="text-xs font-medium text-rose-500">
                {directForm.formState.errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="directConfirmPassword">{t.confirmNewPassword}</Label>
            <div className="relative">
              <ShieldCheck className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="directConfirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                {...directForm.register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {directForm.formState.errors.confirmPassword && (
              <p className="text-xs font-medium text-rose-500">
                {directForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full font-semibold shadow-md mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t.changingPassword}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t.changePassword}
              </>
            )}
          </Button>
        </form>
      )}

      {/* =================================================================== */}
      {/* OPTION B: EMAIL OTP FLOW                                            */}
      {/* =================================================================== */}
      {method === 'otp' && (
        <div className="space-y-4">
          {/* Step 1: Identifier Input */}
          {otpStep === 1 && (
            <form onSubmit={requestOtpForm.handleSubmit(onRequestOtpSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpIdentifierInput">{t.emailOrPhone}</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="otpIdentifierInput"
                    type="text"
                    placeholder={isBn ? 'user@example.com অথবা 01712345678' : 'user@example.com or 01712345678'}
                    className="pl-10"
                    {...requestOtpForm.register('identifier')}
                  />
                </div>
                {requestOtpForm.formState.errors.identifier && (
                  <p className="text-xs font-medium text-rose-500">
                    {requestOtpForm.formState.errors.identifier.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full font-semibold shadow-md mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t.sendingOtp}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {t.sendOtp}
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: OTP Verification Input */}
          {otpStep === 2 && (
            <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtpSubmit)} className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                <div>
                  <span className="text-xs text-slate-500 block">{t.emailOrPhone}</span>
                  <span className="text-sm font-semibold text-slate-900 block truncate max-w-[200px]">
                    {otpIdentifier}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOtpStep(1)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 h-8 px-2.5 rounded-lg"
                >
                  {isBn ? 'পরিবর্তন' : 'Change'}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otpCodeInput">{t.otpLabel}</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="otpCodeInput"
                    type="text"
                    maxLength={6}
                    placeholder={t.otpPlaceholder}
                    className="pl-10 text-center tracking-widest text-lg font-bold"
                    {...verifyOtpForm.register('otp')}
                  />
                </div>
                {verifyOtpForm.formState.errors.otp && (
                  <p className="text-xs font-medium text-rose-500">
                    {verifyOtpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full font-semibold shadow-md mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t.verifyingOtp}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {t.verifyOtp}
                  </>
                )}
              </Button>

              <div className="text-center pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-xs font-medium text-slate-600 hover:text-emerald-600 gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  {t.resendOtp}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Set New Password */}
          {otpStep === 3 && (
            <form onSubmit={setNewPasswordForm.handleSubmit(onSetNewPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="step3NewPassword">{t.newPassword}</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="step3NewPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    {...setNewPasswordForm.register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {setNewPasswordForm.formState.errors.newPassword && (
                  <p className="text-xs font-medium text-rose-500">
                    {setNewPasswordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="step3ConfirmPassword">{t.confirmNewPassword}</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="step3ConfirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    {...setNewPasswordForm.register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {setNewPasswordForm.formState.errors.confirmPassword && (
                  <p className="text-xs font-medium text-rose-500">
                    {setNewPasswordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full font-semibold shadow-md mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t.resettingPassword}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t.resetPasswordBtn}
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Footer Link to Login */}
      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          {isBn ? 'পাসওয়ার্ড মনে পড়েছে?' : 'Remember your password?'}{' '}
          <Link
            href="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            {t.loginNow}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">লোড হচ্ছে...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
