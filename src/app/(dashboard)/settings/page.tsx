'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { ApiResponse, User } from '@/lib/types';
import { getFileDownloadUrl, deleteFileRecord } from '@/lib/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { FileUploader } from '@/components/ui/file-uploader';
import { ChangePasswordCard } from '@/components/settings/change-password-card';
import { formatBnDate } from '@/lib/utils';
import {
  User as UserIcon,
  Mail,
  Phone,
  ShieldCheck,
  CalendarDays,
  Pencil,
  Trash2,
  ImageIcon,
  Upload,
  Info,
  Check,
  X,
  Loader2,
} from 'lucide-react';

export default function SettingsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const { user: storeUser, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Local preview URL for the signature image
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(null);
  const [pendingFileId, setPendingFileId] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Profile name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Fetch the latest profile (includes signatureFileId)
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      return res.data?.data;
    },
  });

  const currentUser = profile || storeUser;
  const currentSignatureFileId = currentUser?.signatureFileId || null;

  // Resolve preview URL whenever the current signature changes
  useEffect(() => {
    let cancelled = false;
    if (currentSignatureFileId) {
      getFileDownloadUrl(currentSignatureFileId)
        .then((url) => {
          if (!cancelled) setSignaturePreviewUrl(url);
        })
        .catch(() => {
          if (!cancelled) setSignaturePreviewUrl(null);
        });
    } else {
      Promise.resolve().then(() => {
        if (!cancelled) setSignaturePreviewUrl(null);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [currentSignatureFileId]);

  // Mutation: persist the chosen file as the owner's current signature
  const setSignatureMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const res = await apiClient.patch<ApiResponse<User>>('/users/profile/signature', { fileId });
      return res.data?.data;
    },
    onSuccess: (updated) => {
      if (updated) {
        setUser(updated);
        queryClient.setQueryData(['user-profile'], updated);
        setPendingFileId(null);
      }
    },
  });

  // Mutation: clear the owner's signature
  const removeSignatureMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete<ApiResponse<User>>('/users/profile/signature');
      return res.data?.data;
    },
    onSuccess: (updated) => {
      if (updated) {
        setUser(updated);
        queryClient.setQueryData(['user-profile'], updated);
        setSignaturePreviewUrl(null);
        setShowRemoveConfirm(false);
      }
    },
  });

  // Mutation: update user profile (name)
  const updateNameMutation = useMutation({
    mutationFn: async (newName: string) => {
      const res = await apiClient.patch<ApiResponse<User>>('/users/profile', {
        name: newName,
      });
      return res.data?.data;
    },
    onSuccess: (updated) => {
      if (updated) {
        setUser(updated);
        queryClient.setQueryData(['user-profile'], updated);
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        setIsEditingName(false);
      }
    },
  });

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length < 2) {
      toast.warning(t.nameMinLength);
      return;
    }
    const namePromise = updateNameMutation.mutateAsync(trimmed);
    toast.promise(namePromise, {
      loading: isEn ? 'Updating name...' : 'নাম পরিবর্তন করা হচ্ছে...',
      success: t.nameUpdated,
      error: (err: unknown) => {
        return (
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (isEn ? 'Failed to update name' : 'নাম পরিবর্তন করতে ব্যর্থ হয়েছে')
        );
      },
    });
  };

  /**
   * Called by FileUploader whenever the user picks/replaces/removes a file.
   * We intentionally do NOT auto-save — we wait for the user to click
   * "Save" so they can preview before committing.
   */
  const handleSignatureFileChange = useCallback((fileId: string | null) => {
    setPendingFileId(fileId);
  }, []);

  /**
   * Confirm the pending file → call PATCH /users/profile/signature
   */
  const handleSaveSignature = () => {
    if (!pendingFileId) return;
    const savePromise = setSignatureMutation.mutateAsync(pendingFileId);
    toast.promise(savePromise, {
      loading: isEn ? 'Saving signature...' : 'স্বাক্ষর সংরক্ষণ করা হচ্ছে...',
      success: t.signatureUpdated,
      error: (err: unknown) => {
        setPendingFileId(null);
        return (
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          t.uploadFailed
        );
      },
    });
  };

  const handleRemoveSignature = async () => {
    if (!currentSignatureFileId) return;
    const removePromise = (async () => {
      try {
        await deleteFileRecord(currentSignatureFileId);
      } catch {
        // Non-fatal; proceed to unlink the reference from the user.
      }
      return await removeSignatureMutation.mutateAsync();
    })();

    toast.promise(removePromise, {
      loading: isEn ? 'Removing signature...' : 'স্বাক্ষর মুছে ফেলা হচ্ছে...',
      success: t.signatureRemoved,
      error: (err: unknown) => {
        return (
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          t.uploadFailed
        );
      },
    });
  };

  if (isProfileLoading && !storeUser) {
    return (
      <div className="space-y-8 pb-8">
        <Skeleton className="h-24 rounded-[10px]" />
        <Skeleton className="h-72 rounded-[10px]" />
        <Skeleton className="h-48 rounded-[10px]" />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">{t.settings}</h1>
        <p className="text-sm text-[#6B7280] mt-1">
          {isEn
            ? 'Manage your profile information and owner signature used on receipts.'
            : 'আপনার প্রোফাইল তথ্য এবং রশিদে ব্যবহৃত মালিকের স্বাক্ষর পরিচালনা করুন।'}
        </p>
      </div>

      {/* Account Information Card */}
      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#12664F]" />
            {t.profileInformation}
          </CardTitle>
          <CardDescription>
            {isEn
              ? 'Your account details registered with BariVara.'
              : 'বাড়িভাড়া সিস্টেমে নিবন্ধিত আপনার অ্যাকাউন্টের তথ্য।'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`space-y-1.5 transition-all ${isEditingName ? 'sm:col-span-2' : ''}`}>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-[#6B7280] flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                {t.fullName}
              </Label>
              {!isEditingName && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNameInput(currentUser.name || '');
                    setIsEditingName(true);
                  }}
                  className="h-6 px-2 text-xs text-[#12664F] hover:text-[#0D4D3B] hover:bg-[#12664F]/5 font-medium gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  {t.editName}
                </Button>
              )}
            </div>

            {isEditingName ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveName();
                }}
                className="space-y-1.5 pt-0.5"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setNameInput(currentUser.name || '');
                      }
                    }}
                    placeholder={t.enterYourName}
                    disabled={updateNameMutation.isPending}
                    className="h-9 text-sm font-medium"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateNameMutation.isPending || !nameInput.trim()}
                    className="h-9 px-3 gap-1.5 bg-[#12664F] hover:bg-[#0D4D3B] text-white shrink-0"
                  >
                    {updateNameMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>{t.save}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameInput(currentUser.name || '');
                    }}
                    disabled={updateNameMutation.isPending}
                    className="h-9 px-3 gap-1 text-[#6B7280] hover:text-[#171717] shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{t.cancel}</span>
                  </Button>
                </div>
                {nameInput.trim().length > 0 && nameInput.trim().length < 2 && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {t.nameMinLength}
                  </p>
                )}
              </form>
            ) : (
              <p className="font-semibold text-[#171717]">{currentUser.name}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-[#6B7280] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.role}
            </Label>
            <div>
              <Badge variant="secondary" className="font-semibold">
                {currentUser.role}
              </Badge>
            </div>
          </div>
          {currentUser.email && (
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6B7280] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {t.email}
              </Label>
              <p className="font-medium text-[#171717]">{currentUser.email}</p>
            </div>
          )}
          {currentUser.phone && (
            <div className="space-y-1.5">
              <Label className="text-xs text-[#6B7280] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {t.phone}
              </Label>
              <p className="font-medium text-[#171717]">{currentUser.phone}</p>
            </div>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs text-[#6B7280] flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              {t.memberSince}
            </Label>
            <p className="font-medium text-[#171717]">
              {formatBnDate(currentUser.createdAt, language)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Owner Signature Card */}
      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Pencil className="w-5 h-5 text-[#12664F]" />
            {t.ownerSignature}
          </CardTitle>
          <CardDescription>{t.ownerSignatureDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Current Signature Preview */}
          <div className="rounded-[10px] border border-dashed border-[#D1D5DB] bg-[#FAFAF9] p-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="h-32 w-full sm:w-56 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center overflow-hidden shrink-0 relative">
                {signaturePreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={signaturePreviewUrl}
                    alt={t.ownerSignature}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center px-3">
                    <ImageIcon className="w-8 h-8 mx-auto text-[#9CA3AF]" />
                    <p className="text-xs font-medium text-[#6B7280] mt-2">
                      {t.noSignatureUploaded}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2 text-xs text-[#6B7280]">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <p>
                    {isEn
                      ? 'Upload a clear, high-contrast image of your signature (PNG with a transparent background is recommended). Once set, it will appear on all new payment receipts.'
                      : 'আপনার স্বাক্ষরের একটি পরিষ্কার ছবি আপলোড করুন (স্বচ্ছ ব্যাকগ্রাউন্ডসহ PNG ফরম্যাট সুপারিশকৃত)। একবার সেট করলে নতুন সকল রশিদে এটি দেখাবে।'}
                  </p>
                </div>
                <p className="text-[11px] text-[#9CA3AF]">{t.signatureUploadHint}</p>
              </div>
            </div>
          </div>

          {/* File Uploader */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#374151]">
              {currentSignatureFileId ? t.replaceSignature : t.uploadSignature}
            </Label>
            <FileUploader
              category="OWNER_SIGNATURE"
              value={pendingFileId}
              onChange={handleSignatureFileChange}
              accept="image/png,image/jpeg,image/webp"
              maxSizeMB={2}
              label={t.uploadSignature}
              description={t.signatureUploadHint}
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F3F4F6]">
            {pendingFileId && (
              <Button
                onClick={handleSaveSignature}
                disabled={setSignatureMutation.isPending}
                variant="default"
                size="sm"
                className="gap-1.5"
              >
                <Upload className="w-4 h-4" />
                {setSignatureMutation.isPending ? t.loading : t.save}
              </Button>
            )}

            {pendingFileId && (
              <Button
                onClick={() => setPendingFileId(null)}
                variant="outline"
                size="sm"
                disabled={setSignatureMutation.isPending}
              >
                {t.cancel}
              </Button>
            )}

            {currentSignatureFileId && !showRemoveConfirm && (
              <Button
                onClick={() => setShowRemoveConfirm(true)}
                variant="outline"
                size="sm"
                className="gap-1.5 text-[#DC2626] border-[#FECACA] hover:bg-[#FEF7F7] hover:text-[#B91C1C] ml-auto"
                disabled={removeSignatureMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
                {t.removeSignature}
              </Button>
            )}

            {showRemoveConfirm && (
              <div className="ml-auto flex items-center gap-2 bg-[#FEF7F7] border border-[#FECACA] rounded-lg px-3 py-1.5">
                <span className="text-xs font-medium text-[#B91C1C]">
                  {t.confirmRemoveSignature}
                </span>
                <Button
                  onClick={handleRemoveSignature}
                  variant="destructive"
                  size="sm"
                  disabled={removeSignatureMutation.isPending}
                  className="h-7 px-2 text-xs"
                >
                  {t.confirm}
                </Button>
                <Button
                  onClick={() => setShowRemoveConfirm(false)}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={removeSignatureMutation.isPending}
                >
                  {t.cancel}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security & Password Card */}
      <ChangePasswordCard />
    </div>
  );
}