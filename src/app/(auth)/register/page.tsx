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
import { UserPlus, Lock, User as UserIcon, Mail, Phone, Loader2, Globe } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  email: z.string().email('সঠিক ইমেইল ঠিকানা প্রদান করুন').optional().or(z.literal('')),
  phone: z.string().min(11, '১১ ডিজিটের সঠিক মোবাইল নম্বর দিন').optional().or(z.literal('')),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে'),
}).refine((data) => data.email || data.phone, {
  message: 'ইমেইল অথবা ফোন নম্বরের অন্তত একটি প্রদান করতে হবে',
  path: ['phone'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguageStore();
  const t = useTranslation(language);
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const payload: any = {
        name: data.name,
        password: data.password,
        role: 'OWNER',
      };
      if (data.email) payload.email = data.email;
      if (data.phone) payload.phone = data.phone;

      const response = await apiClient.post<ApiResponse<AuthResponseData>>('/auth/register', payload);

      if (response.data.success && response.data.data) {
        const { user, accessToken, refreshToken, tokenType, expiresIn } = response.data.data;
        setAuth(user, { accessToken, refreshToken, tokenType, expiresIn });
        toast.success(response.data.message || (language === 'bn' ? 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account created successfully!'));
        router.push('/dashboard');
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        (language === 'bn' ? 'রেজিস্ট্রেশন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।' : 'Registration failed. Please check your info.');
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.register}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.registerSubtext}</p>
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
          <Label htmlFor="name">{t.fullName}</Label>
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="name"
              type="text"
              placeholder={language === 'bn' ? 'আসিফ চৌধুরী' : 'Asif Chowdhury'}
              className="pl-10"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-xs font-medium text-rose-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t.phone} (অপশনাল যদি ইমেইল দেন)</Label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="01712345678"
              className="pl-10"
              {...register('phone')}
            />
          </div>
          {errors.phone && (
            <p className="text-xs font-medium text-rose-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t.email} (অপশনাল যদি ফোন দেন)</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              className="pl-10"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-rose-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t.password}</Label>
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
              <UserPlus className="w-4 h-4 mr-2" />
              {t.register}
            </>
          )}
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          {t.alreadyHaveAccount}{' '}
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
