'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { apiClient, getApiErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { ApiResponse, AuthResponseData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Lock, User as UserIcon, Loader2, Globe } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, 'ইমেইল অথবা মোবাইল নম্বর প্রদান করুন'),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();
  const t = useTranslation(language);
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/login', {
        identifier: data.identifier,
        password: data.password,
      });

      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken, tokenType, expiresIn } = response.data.data;
        setAuth(user, { accessToken, refreshToken, tokenType, expiresIn });
        toast.success(response.data.message || (language === 'bn' ? 'লগইন সফল হয়েছে!' : 'Login successful!'));
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const errorMsg = getApiErrorMessage(
        error,
        language === 'bn' ? 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।' : 'Login failed. Please check credentials.'
      );
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <div>
          <h2 className="text-xl font-bold text-[#171717] tracking-tight">{t.welcomeBack}</h2>
          <p className="text-xs text-[#6B7280] mt-1">{t.loginSubtext}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="gap-1.5 text-xs text-[#374151] rounded-lg border-[#E5E7EB]"
        >
          <Globe className="w-3.5 h-3.5 text-[#12664F]" />
          {language === 'bn' ? 'English' : 'বাংলা'}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="identifier" className="text-xs font-medium text-[#374151]">{t.emailOrPhone}</Label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-[#9CA3AF]" />
            <Input
              id="identifier"
              type="text"
              placeholder={language === 'bn' ? 'rafiq@barivara.com অথবা 01711234567' : 'rafiq@barivara.com or 01711234567'}
              className="pl-10 text-sm"
              {...register('identifier')}
            />
          </div>
          {errors.identifier && (
            <p className="text-xs font-medium text-[#DC2626]">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-medium text-[#374151]">{t.password}</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#12664F] hover:underline"
            >
              {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#9CA3AF]" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10 text-sm"
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-[#DC2626]">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          className="w-full font-semibold shadow-none mt-2 h-10"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              {t.loading}
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              {t.login}
            </>
          )}
        </Button>
      </form>

      <div className="text-center pt-3 border-t border-[#E5E7EB]">
        <p className="text-xs text-[#6B7280]">
          {t.dontHaveAccount}{' '}
          <Link
            href="/register"
            className="font-semibold text-[#12664F] hover:underline"
          >
            {t.registerNow}
          </Link>
        </p>
      </div>
    </div>
  );
}

