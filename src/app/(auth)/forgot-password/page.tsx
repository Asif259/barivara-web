'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Send,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/translations';
import { useLanguageStore } from '@/stores/language-store';
import { authApi, getApiErrorMessage } from '@/lib/api';

const passwordPattern = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

// ============================================================================
// Schemas
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

type DirectResetFormData = z.infer<typeof directResetSchema>;
type RequestOtpFormData = z.infer<typeof requestOtpSchema>;
type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
type SetNewPasswordFormData = z.infer<typeof setNewPasswordSchema>;

function ForgotPasswordContent() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIdentifier = searchParams.get('email') || searchParams.get('identifier') || '';

  // Tab: 'optionA' (known current password) | 'optionB' (email OTP)
  const [activeTab, setActiveTab] = useState<'optionA' | 'optionB'>('optionB');

  // Option B step: 1 (send OTP) -> 2 (verify OTP) -> 3 (set new password)
  const [otpStep, setOtpStep] = useState<1 | 2 | 3>(1);
  const [otpIdentifier, setOtpIdentifier] = useState(initialIdentifier);
  const [resetToken, setResetToken] = useState<string>('');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading states
  const [isDirectLoading, setIsDirectLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Option A Form
  const directForm = useForm<DirectResetFormData>({
    resolver: zodResolver(directResetSchema),
    defaultValues: {
      identifier: initialIdentifier,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Option B Step 1 Form
  const requestOtpForm = useForm<RequestOtpFormData>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: {
      identifier: initialIdentifier,
    },
  });

  // Option B Step 2 Form
  const verifyOtpForm = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Option B Step 3 Form
  const setNewPasswordForm = useForm<SetNewPasswordFormData>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Option A Submit: Direct reset with known current password
  const onDirectSubmit = async (data: DirectResetFormData) => {
    setIsDirectLoading(true);
    try {
      const res = await authApi.resetPasswordDirect({
        identifier: data.identifier,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success(res.data?.message || t.passwordChangedSuccess);
      router.push('/login');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'পাসওয়ার্ড পরিবর্তন করা সম্ভব হয়নি। তথ্য যাচাই করুন।'));
    } finally {
      setIsDirectLoading(false);
    }
  };

  // Option B Step 1 Submit: Request OTP
  const onRequestOtpSubmit = async (data: RequestOtpFormData) => {
    setIsOtpLoading(true);
    try {
      const res = await authApi.forgotPassword({ identifier: data.identifier });
      setOtpIdentifier(data.identifier);
      setOtpStep(2);
      toast.success(res.data?.message || t.otpSentSuccess);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'ওটিপি পাঠাতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।'));
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Option B Step 2 Submit: Verify OTP
  const onVerifyOtpSubmit = async (data: VerifyOtpFormData) => {
    setIsOtpLoading(true);
    try {
      const res = await authApi.verifyResetOtp({
        identifier: otpIdentifier,
        otp: data.otp,
      });
      const token = res.data?.data?.resetToken || '';
      setResetToken(token);
      setOtpStep(3);
      toast.success(res.data?.message || t.otpVerifiedSuccess);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'ভুল বা মেয়াদোত্তীর্ণ ওটিপি কোড।'));
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Option B Step 3 Submit: Set New Password
  const onSetNewPasswordSubmit = async (data: SetNewPasswordFormData) => {
    setIsOtpLoading(true);
    try {
      const res = await authApi.resetPassword({
        identifier: otpIdentifier,
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success(res.data?.message || t.passwordResetSuccess);
      router.push('/login');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।'));
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!otpIdentifier) return;
    setIsResending(true);
    try {
      const res = await authApi.forgotPassword({ identifier: otpIdentifier });
      toast.success(res.data?.message || t.otpSentSuccess);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'ওটিপি পাঠাতে সমস্যা হয়েছে।'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t.forgotPasswordTitle}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t.forgotPasswordSub}
        </p>
      </div>

      {/* Choice Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('optionB')}
          className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'optionB'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.forgotPasswordOptionB}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('optionA')}
          className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'optionA'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.forgotPasswordOptionA}</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* OPTION A: Knows Current Password Flow                               */}
      {/* =================================================================== */}
      {activeTab === 'optionA' && (
        <form onSubmit={directForm.handleSubmit(onDirectSubmit)} className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
            {t.forgotPasswordOptionASub}
          </div>

          {/* Identifier */}
          <div className="space-y-1.5">
            <Label htmlFor="directIdentifier">{t.emailOrPhone}</Label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="directIdentifier"
                type="text"
                placeholder="user@example.com অথবা 01712345678"
                className={`pl-10 rounded-xl ${directForm.formState.errors.identifier ? 'border-red-500' : ''}`}
                {...directForm.register('identifier')}
              />
            </div>
            {directForm.formState.errors.identifier && (
              <p className="text-xs text-red-500">{directForm.formState.errors.identifier.message}</p>
            )}
          </div>

          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="directCurrentPassword">{t.currentPassword}</Label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="directCurrentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`pl-10 pr-10 rounded-xl ${directForm.formState.errors.currentPassword ? 'border-red-500' : ''}`}
                {...directForm.register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {directForm.formState.errors.currentPassword && (
              <p className="text-xs text-red-500">{directForm.formState.errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="directNewPassword">{t.newPassword}</Label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="directNewPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`pl-10 pr-10 rounded-xl ${directForm.formState.errors.newPassword ? 'border-red-500' : ''}`}
                {...directForm.register('newPassword')}
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
            {directForm.formState.errors.newPassword && (
              <p className="text-xs text-red-500">{directForm.formState.errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="directConfirmPassword">{t.confirmNewPassword}</Label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                id="directConfirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`pl-10 pr-10 rounded-xl ${directForm.formState.errors.confirmPassword ? 'border-red-500' : ''}`}
                {...directForm.register('confirmPassword')}
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
            {directForm.formState.errors.confirmPassword && (
              <p className="text-xs text-red-500">{directForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isDirectLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md mt-2 font-semibold"
          >
            {isDirectLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
      {/* OPTION B: Email OTP Flow (3 Steps)                                 */}
      {/* =================================================================== */}
      {activeTab === 'optionB' && (
        <div className="space-y-4">
          {/* Step 1: Request OTP */}
          {otpStep === 1 && (
            <form onSubmit={requestOtpForm.handleSubmit(onRequestOtpSubmit)} className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                {t.forgotPasswordOptionBSub}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="otpIdentifierInput">{t.emailOrPhone}</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="otpIdentifierInput"
                    type="text"
                    placeholder="user@example.com অথবা 01712345678"
                    className={`pl-10 rounded-xl ${requestOtpForm.formState.errors.identifier ? 'border-red-500' : ''}`}
                    {...requestOtpForm.register('identifier')}
                  />
                </div>
                {requestOtpForm.formState.errors.identifier && (
                  <p className="text-xs text-red-500">{requestOtpForm.formState.errors.identifier.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isOtpLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md mt-2 font-semibold"
              >
                {isOtpLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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

          {/* Step 2: Verify OTP */}
          {otpStep === 2 && (
            <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtpSubmit)} className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{t.emailOrPhone}</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{otpIdentifier}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOtpStep(1)}
                  className="text-xs text-emerald-600 hover:text-emerald-700"
                >
                  বদলান
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="otpCodeInput">{t.otpLabel}</Label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="otpCodeInput"
                    type="text"
                    maxLength={6}
                    placeholder={t.otpPlaceholder}
                    className={`pl-10 text-center tracking-widest text-lg font-bold rounded-xl ${
                      verifyOtpForm.formState.errors.otp ? 'border-red-500' : ''
                    }`}
                    {...verifyOtpForm.register('otp')}
                  />
                </div>
                {verifyOtpForm.formState.errors.otp && (
                  <p className="text-xs text-red-500">{verifyOtpForm.formState.errors.otp.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isOtpLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md mt-2 font-semibold"
              >
                {isOtpLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.verifyingOtp}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {t.verifyOtp}
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-xs text-slate-600 hover:text-emerald-600 gap-1.5"
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
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                {t.otpVerifiedSuccess}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="step3NewPassword">{t.newPassword}</Label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="step3NewPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 rounded-xl ${setNewPasswordForm.formState.errors.newPassword ? 'border-red-500' : ''}`}
                    {...setNewPasswordForm.register('newPassword')}
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
                {setNewPasswordForm.formState.errors.newPassword && (
                  <p className="text-xs text-red-500">{setNewPasswordForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="step3ConfirmPassword">{t.confirmNewPassword}</Label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="step3ConfirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pl-10 pr-10 rounded-xl ${setNewPasswordForm.formState.errors.confirmPassword ? 'border-red-500' : ''}`}
                    {...setNewPasswordForm.register('confirmPassword')}
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
                {setNewPasswordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-red-500">{setNewPasswordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isOtpLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md mt-2 font-semibold"
              >
                {isOtpLoading ? (
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
            </form>
          )}
        </div>
      )}

      {/* Back to Login link */}
      <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t.backToLogin}
        </Link>
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
