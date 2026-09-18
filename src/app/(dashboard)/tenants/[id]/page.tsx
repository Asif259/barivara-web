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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
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
      <span className="text-[13px] text-[#6B7280] block font-medium">{label}</span>
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
      <span className="text-[13px] text-[#6B7280] block font-medium">{label}</span>
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
      <div className="space-y-8 pb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-[10px]" />
        <Skeleton className="h-80 w-full rounded-[10px]" />
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
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-[#E5E7EB] pb-6 sm:flex-row sm:items-center">
        <Link href="/tenants">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center min-w-0">
          {/* Profile Picture */}
          <div className="relative shrink-0">
            {profilePictureUrl ? (
              <button
                onClick={() => openPreview(profilePictureUrl, t.profilePicture)}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden border border-[#CDE4DA] bg-[#E8F3EF] hover:border-[#12664F] transition-colors cursor-pointer"
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
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-[#E8F3EF] text-[#12664F] flex items-center justify-center font-semibold text-2xl sm:text-3xl border border-[#CDE4DA]">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Tenant Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[28px] sm:text-[30px] font-semibold leading-tight tracking-tight text-[#171717] truncate">{tenant.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-[#6B7280]">
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
      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-[17px] font-semibold text-[#171717] flex items-center gap-2">
            <User className="w-4 h-4 text-[#307473]" />
            {t.personalContact}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <span className="text-[13px] text-[#6B7280] block">{t.tenantName}</span>
              <span className="font-medium text-[#171717] block">{tenant.name}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[13px] text-[#6B7280] block">{t.phone}</span>
              <span className="font-medium text-[#171717] block">{tenant.phone}</span>
            </div>
            {tenant.email && (
              <div className="space-y-1">
                <span className="text-[13px] text-[#6B7280] block">{t.email}</span>
                <span className="font-medium text-[#171717] block">{tenant.email}</span>
              </div>
            )}
            {tenant.occupation && (
              <div className="space-y-1">
                <span className="text-[13px] text-[#6B7280] block">{t.occupation}</span>
                <span className="font-medium text-[#171717] block">{tenant.occupation}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#F3F4F6] space-y-1">
            <span className="text-[13px] text-[#6B7280] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#307473]" />
              {t.address}
            </span>
            <p className="text-sm font-medium text-[#171717] whitespace-pre-wrap">
              {tenant.permanentAddress || (isEn ? 'Not provided' : 'প্রদান করা হয়নি')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Documents — horizontal row */}
      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-[17px] font-semibold text-[#171717] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#307473]" />
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
              <div className="col-span-full text-center py-4 text-[#6B7280]">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">{isEn ? 'No documents uploaded' : 'কোনো ডকুমেন্ট আপলোড করা হয়নি'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-[17px] font-semibold text-[#171717] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#307473]" />
            {t.emergencyContactSection}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <span className="text-[13px] text-[#6B7280] block">{isEn ? 'Contact Person' : 'ব্যক্তির নাম'}</span>
              <span className="font-medium text-[#171717] block">{tenant.emergencyContactName || (isEn ? 'Not provided' : 'প্রদান করা হয়নি')}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[13px] text-[#6B7280] block">{isEn ? 'Emergency Phone' : 'জরুরি ফোন'}</span>
              <span className="font-medium text-[#171717] block">{tenant.emergencyContactPhone || (isEn ? 'Not provided' : 'প্রদান করা হয়নি')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rental Agreements */}
      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#307473]" />
            {isEn ? 'Rental Agreements' : 'ভাড়া চুক্তিসমূহ'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          {tenant.agreements && tenant.agreements.length > 0 ? (
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[140px]">{t.unitNumber}</TableHead>
                  <TableHead align="right" className="min-w-[105px]">{t.baseRent}</TableHead>
                  <TableHead align="right" className="min-w-[95px]">{t.serviceFee}</TableHead>
                  <TableHead align="right" className="min-w-[105px]">{t.securityDeposit}</TableHead>
                  <TableHead align="left" className="min-w-[100px]">{t.startDate}</TableHead>
                  <TableHead align="left" className="min-w-[100px]">{t.endDate}</TableHead>
                  <TableHead align="center" className="min-w-[95px]">{t.status}</TableHead>
                  <TableHead align="right" className="min-w-[160px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenant.agreements.map((agr) => {
                  const isEndingThisRow = endingAgreementId === agr.id;
                  return (
                    <TableRow key={agr.id}>
                      <TableCell className="min-w-[140px]">
                        <div className="font-semibold text-[#0F172A]">{agr.unit?.unitNumber || '—'}</div>
                        {agr.unit?.property?.name && (
                          <div className="text-xs text-[#64748B] truncate max-w-[160px]" title={agr.unit.property.name}>
                            {agr.unit.property.name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell align="right" className="font-semibold text-[#0F172A] whitespace-nowrap">
                        {formatCurrency(agr.monthlyRent, language)}
                      </TableCell>
                      <TableCell align="right" className="text-[#64748B] whitespace-nowrap">
                        {formatCurrency(agr.serviceFee, language)}
                      </TableCell>
                      <TableCell align="right" className="text-[#059669] font-medium whitespace-nowrap">
                        {formatCurrency(agr.securityDeposit, language)}
                      </TableCell>
                      <TableCell align="left" className="text-xs text-[#64748B] whitespace-nowrap">
                        {formatBnDate(agr.startDate, language)}
                      </TableCell>
                      <TableCell align="left" className="text-xs text-[#64748B] whitespace-nowrap">
                        {agr.endDate ? formatBnDate(agr.endDate, language) : '—'}
                      </TableCell>
                      <TableCell align="center">
                        <StatusBadge status={agr.status} lang={language} />
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/agreements/${agr.id}`)}
                            className="h-8 px-2.5 text-xs text-[#059669] hover:text-[#047857] hover:bg-[#F0FDF4] gap-1.5 border border-[#A7F3D0]"
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
                            className="h-8 px-2.5 text-xs text-[#2563EB] hover:text-[#1D4ED8] hover:bg-[#EFF6FF] gap-1.5 border border-[#BFDBFE]"
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
                              className="h-8 px-2.5 text-xs text-[#DC2626] hover:text-[#B91C1C] hover:bg-[#FEF2F2] gap-1.5 border border-[#FECACA]"
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-[#64748B] py-5 text-center">
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