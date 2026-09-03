'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
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
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        (language === 'bn' ? 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।' : 'Login failed. Please check credentials.');
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.welcomeBack}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.loginSubtext}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="gap-1.5 text-xs text-slate-600 rounded-xl"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          {language === 'bn' ? 'English' : 'বাংলা'}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="identifier">{t.emailOrPhone}</Label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="identifier"
              type="text"
              placeholder={language === 'bn' ? 'user@example.com অথবা 01712345678' : 'user@example.com or 01712345678'}
              className="pl-10"
              {...register('identifier')}
            />
          </div>
          {errors.identifier && (
            <p className="text-xs font-medium text-rose-500">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.password}</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-rose-500">{errors.password.message}</p>
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

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          {t.dontHaveAccount}{' '}
          <Link
            href="/register"
            className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            {t.registerNow}
          </Link>
        </p>
      </div>
    </div>
  );
}
