'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Tenant, ApiResponse } from '@/lib/types';
import { formatCurrency, formatBnDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { TenantFormDialog } from '@/components/tenants/tenant-form-dialog';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import { getFileDownloadUrl } from '@/lib/file-upload';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Shield,
  Edit,
  FileText,
  CheckCircle2,
  Eye,
  Ban,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';

/**
 * Shared thumbnail for a document/photo field on the tenant profile.
 * Renders an empty-state placeholder when no URL is available yet.
 * Uses object-contain on a light background so NID documents aren't cropped.
 */
function DocumentThumbnail({
  url,
  label,
  alt,
  emptyLabel,
  viewLabel,
  onView,
}: {
  url: string | null | undefined;
  label: string;
  alt: string;
  emptyLabel: string;
  viewLabel: string;
  onView: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-slate-500 block font-medium">{label}</span>
      {url ? (
        <button
          onClick={onView}
          className="group relative h-24 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:border-emerald-300 transition-colors cursor-pointer"
          aria-label={alt}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={alt} className="w-full h-full object-contain p-1.5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <span className="text-white text-xs font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {viewLabel}
            </span>
          </div>
        </button>
      ) : (
        <div className="h-24 w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-slate-400">
          <ImageIcon className="w-6 h-6 mb-1" />
          <span className="text-xs">{emptyLabel}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Shown when a document ID exists on the tenant but its signed URL
 * failed to load (e.g. fetch error, expired/broken link) — distinct from
 * "no document uploaded" so it doesn't look like the file never existed.
 */
function DocumentThumbnailError({ label, isEn }: { label: string; isEn: boolean }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-slate-500 block font-medium">{label}</span>
      <div className="h-24 w-full rounded-xl border border-dashed border-amber-300 bg-amber-50 flex flex-col items-center justify-center text-amber-700">
        <AlertTriangle className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">{isEn ? 'Preview unavailable' : 'প্রিভিউ দেখানো যাচ্ছে না'}</span>
      </div>
    </div>
  );
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();

  // Next.js dynamic route params can theoretically be string | string[] | undefined.
  // Normalize defensively instead of an unchecked `as string` cast.
  const rawTenantId = params?.id;
  const tenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId;

  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // End-agreement confirmation + per-row busy state
  const [confirmEndAgreementId, setConfirmEndAgreementId] = useState<string | null>(null);
  const [endingAgreementId, setEndingAgreementId] = useState<string | null>(null);

  const openPreview = (url: string | null, title: string) => {
    if (url) {
      setPreviewImageUrl(url);
      setPreviewTitle(title);
      setPreviewOpen(true);
    }
  };

  // 1. Fetch Tenant Profile
  const {
    data: tenant,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['tenant-details', tenantId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Tenant>>(`/tenants/${tenantId}`);
      return res.data?.data;
    },
    enabled: !!tenantId,
  });

  // 2. Fetch document URLs.
  // IMPORTANT: these hooks must run unconditionally (same order every render),
  // so they're declared before any early `return` and gated with `enabled`
  // instead of being skipped via a conditional return above them.
  const { data: profilePictureUrl } = useQuery({
    queryKey: ['file-download-url', tenant?.profilePictureId],
    queryFn: () => getFileDownloadUrl(tenant!.profilePictureId!),
    enabled: !!tenant?.profilePictureId,
  });

  const { data: nidFrontUrl } = useQuery({
    queryKey: ['file-download-url', tenant?.nidFrontImageId],
    queryFn: () => getFileDownloadUrl(tenant!.nidFrontImageId!),
    enabled: !!tenant?.nidFrontImageId,
  });

  const { data: nidBackUrl } = useQuery({
    queryKey: ['file-download-url', tenant?.nidBackImageId],
    queryFn: () => getFileDownloadUrl(tenant!.nidBackImageId!),
    enabled: !!tenant?.nidBackImageId,
  });

  const handleEndAgreement = async (agreementId: string) => {
    try {
      setEndingAgreementId(agreementId);
      await apiClient.post(`/rental-agreements/${agreementId}/end`);
      toast.success(isEn ? 'Agreement ended successfully.' : 'চুক্তি সফলভাবে সমাপ্ত হয়েছে।');
      await refetch();
    } catch (error) {
      console.error('Failed to end agreement:', error);
      toast.error(
        isEn ? 'Failed to end agreement. Please try again.' : 'চুক্তি সমাপ্ত করা যায়নি। আবার চেষ্টা করুন।'
      );
    } finally {
      setEndingAgreementId(null);
      setConfirmEndAgreementId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title={isEn ? 'Something went wrong' : 'কিছু একটা ভুল হয়েছে'}
        description={
          isEn
            ? "We couldn't load this tenant's details. Please try again."
            : 'এই ভাড়াটিয়ার তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।'
        }
        actionLabel={isEn ? 'Retry' : 'আবার চেষ্টা করুন'}
        onAction={() => refetch()}
      />
    );
  }

  if (!tenant) {
    return (
      <EmptyState
        icon={User}
        title={t.noTenantsFound}
        actionLabel={isEn ? 'Back to Tenants' : 'সকল ভাড়াটিয়াদের তালিকায় ফিরুন'}
        onAction={() => router.push('/tenants')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tenants">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-4 min-w-0">
          {/* Profile Picture */}
          <div className="relative shrink-0">
            {profilePictureUrl ? (
              <button
                onClick={() => openPreview(profilePictureUrl, t.profilePicture)}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 border-emerald-200 bg-slate-100 hover:border-emerald-300 transition-colors cursor-pointer"
                aria-label={isEn ? 'View profile picture' : 'প্রোফাইল ছবি দেখুন'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profilePictureUrl}
                  alt={`${tenant.name} ${t.profilePicture}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl sm:text-3xl border-2 border-emerald-200">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Tenant Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">{tenant.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-600">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {tenant.phone}
              </span>
              {tenant.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {tenant.email}
                </span>
              )}
              {tenant.occupation && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {tenant.occupation}
                </span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            className="gap-1.5 shrink-0 self-start sm:self-center"
          >
            <Edit className="w-3.5 h-3.5" />
            {t.editTenant}
          </Button>
        </div>
      </div>

      {/* Personal & Contact Information */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            {t.personalContact}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">{t.tenantName}</span>
              <span className="font-medium text-slate-900 block">{tenant.name}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">{t.phone}</span>
              <span className="font-medium text-slate-900 block">{tenant.phone}</span>
            </div>
            {tenant.email && (
              <div className="space-y-1">
                <span className="text-xs text-slate-500 block">{t.email}</span>
                <span className="font-medium text-slate-900 block">{tenant.email}</span>
              </div>
            )}
            {tenant.occupation && (
              <div className="space-y-1">
                <span className="text-xs text-slate-500 block">{t.occupation}</span>
                <span className="font-medium text-slate-900 block">{tenant.occupation}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1">
            <span className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {t.address}
            </span>
            <p className="text-sm font-medium text-slate-900 whitespace-pre-wrap">
              {tenant.permanentAddress || (isEn ? 'Not provided' : 'প্রদান করা হয়নি')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Documents — horizontal row */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            {t.documents}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenant.nidFrontImageId && (
              <div>
                {nidFrontUrl ? (
                  <DocumentThumbnail
                    url={nidFrontUrl}
                    label={t.nidFront}
                    alt={`${tenant.name} ${t.nidFront}`}
                    emptyLabel={isEn ? 'No NID front image' : 'এনআইডি সামনের ছবি নেই'}
                    viewLabel={t.view}
                    onView={() => openPreview(nidFrontUrl ?? null, t.nidFront)}
                  />
                ) : (
                  <DocumentThumbnailError label={t.nidFront} isEn={isEn} />
                )}
              </div>
            )}

            {tenant.nidBackImageId && (
              <div>
                {nidBackUrl ? (
                  <DocumentThumbnail
                    url={nidBackUrl}
                    label={t.nidBack}
                    alt={`${tenant.name} ${t.nidBack}`}
                    emptyLabel={isEn ? 'No NID back image' : 'এনআইডি পেছনের ছবি নেই'}
                    viewLabel={t.view}
                    onView={() => openPreview(nidBackUrl ?? null, t.nidBack)}
                  />
                ) : (
                  <DocumentThumbnailError label={t.nidBack} isEn={isEn} />
                )}
              </div>
            )}

            {!tenant.nidFrontImageId && !tenant.nidBackImageId && (
              <div className="col-span-full text-center py-4 text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">{isEn ? 'No documents uploaded' : 'কোনো ডকুমেন্ট আপলোড করা হয়নি'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            {t.emergencyContactSection}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">{isEn ? 'Contact Person' : 'ব্যক্তির নাম'}</span>
              <span className="font-medium text-slate-900 block">{tenant.emergencyContactName || (isEn ? 'Not provided' : 'প্রদান করা হয়নি')}</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-500 block">{isEn ? 'Emergency Phone' : 'জরুরি ফোন'}</span>
              <span className="font-medium text-slate-900 block">{tenant.emergencyContactPhone || (isEn ? 'Not provided' : 'প্রদান করা হয়নি')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rental Agreements */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {isEn ? 'Rental Agreements' : 'ভাড়া চুক্তিসমূহ'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tenant.agreements && tenant.agreements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100/80 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="pb-3 px-4">{t.unitNumber}</th>
                    <th className="pb-3 px-4">{t.baseRent}</th>
                    <th className="pb-3 px-4">{t.serviceFee}</th>
                    <th className="pb-3 px-4">{t.securityDeposit}</th>
                    <th className="pb-3 px-4">{t.startDate}</th>
                    <th className="pb-3 px-4">{t.endDate}</th>
                    <th className="pb-3 px-4">{t.status}</th>
                    <th className="pb-3 px-4 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenant.agreements.map((agr) => {
                    const isEndingThisRow = endingAgreementId === agr.id;
                    return (
                      <tr key={agr.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{agr.unit?.unitNumber}</div>
                          {agr.unit?.property?.name && (
                            <div className="text-xs text-slate-500 truncate max-w-xs">{agr.unit.property.name}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          {formatCurrency(agr.monthlyRent, language)}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {formatCurrency(agr.serviceFee, language)}
                        </td>
                        <td className="py-3 px-4 text-emerald-700 font-medium whitespace-nowrap">
                          {formatCurrency(agr.securityDeposit, language)}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {formatBnDate(agr.startDate, language)}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {agr.endDate ? formatBnDate(agr.endDate, language) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={agr.status} lang={language} />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/agreements/${agr.id}`)}
                              className="h-8 px-3 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1.5 border border-emerald-200"
                              title={t.view}
                              aria-label={`${t.view} — ${agr.unit?.unitNumber ?? ''}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t.view}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/agreements/${agr.id}/edit`)}
                              className="h-8 px-3 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1.5 border border-blue-200"
                              title={t.edit}
                              aria-label={`${t.edit} — ${agr.unit?.unitNumber ?? ''}`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{t.edit}</span>
                            </Button>
                            {agr.status === 'ACTIVE' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmEndAgreementId(agr.id)}
                                disabled={isEndingThisRow}
                                className="h-8 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1.5 border border-rose-200"
                                title={t.endAgreement}
                                aria-label={`${t.endAgreement} — ${agr.unit?.unitNumber ?? ''}`}
                              >
                                {isEndingThisRow ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Ban className="w-3.5 h-3.5" />
                                )}
                                <span className="hidden sm:inline">{t.endAgreement}</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-5 text-center">
              {isEn ? 'No rental agreements found for this tenant.' : 'এই ভাড়াটিয়ার কোনো সক্রিয় বা পূর্বের চুক্তি পাওয়া যায়নি।'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tenant Edit Dialog */}
      <TenantFormDialog
        tenant={tenant}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={refetch}
      />

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        imageUrl={previewImageUrl}
        title={previewTitle}
      />

      {/* End Agreement Confirmation Dialog (replaces native confirm()) */}
      <Dialog
        open={!!confirmEndAgreementId}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && endingAgreementId === null) {
            setConfirmEndAgreementId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <Ban className="w-5 h-5" />
              {t.endAgreement}
            </DialogTitle>
            <DialogDescription>
              {isEn
                ? `End agreement for ${tenant.name}? This cannot be undone.`
                : `${tenant.name}-এর চুক্তি সমাপ্ত করবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmEndAgreementId(null)}
              disabled={endingAgreementId !== null}
            >
              {t.cancel}
            </Button>
            <Button
              size="sm"
              onClick={() => confirmEndAgreementId && handleEndAgreement(confirmEndAgreementId)}
              disabled={endingAgreementId !== null}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
            >
              {endingAgreementId ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {isEn ? 'End Agreement' : 'চুক্তি সমাপ্ত করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}