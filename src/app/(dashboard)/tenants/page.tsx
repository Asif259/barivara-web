'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Tenant, ApiResponse } from '@/lib/types';
import { formatBnDate } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableSkeleton } from '@/components/ui/table';
import {
  ResponsiveTableContainer,
  MobileDataRow,
  MobileTableSkeleton,
  CompactStatus,
} from '@/components/ui/responsive-table';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
  DetailItem,
} from '@/components/ui/bottom-sheet';
import { TenantFormDialog } from '@/components/tenants/tenant-form-dialog';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import { TenantRow } from '@/components/ui/tenant-row';
import { TenantAvatar } from '@/components/ui/tenant-avatar';
import { Users, UserPlus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function TenantsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const [search, setSearch] = useState('');
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [detailTenant, setDetailTenant] = useState<Tenant | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = (url: string | null, title: string) => {
    if (url) {
      setPreviewImageUrl(url);
      setPreviewTitle(title);
      setPreviewOpen(true);
    }
  };

  const { data: tenants, isLoading, refetch } = useQuery({
    queryKey: ['tenants-list', search],
    queryFn: async () => {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await apiClient.get<ApiResponse<Tenant[]>>(`/tenants?limit=50${searchParam}`);
      return res.data?.data || [];
    },
  });

  const handleCreate = () => {
    setEditingTenant(null);
    setTenantDialogOpen(true);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setTenantDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(isEn ? `Are you sure you want to delete "${name}"?` : `আপনি কি নিশ্চিতভাবে "${name}" মুছে ফেলতে চান?`)) return;
    try {
      await apiClient.delete(`/tenants/${id}`);
      toast.success(isEn ? 'Tenant removed' : 'ভাড়াটিয়া মুছে ফেলা হয়েছে');
      refetch();
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || (isEn ? 'Failed to delete' : 'মুছে ফেলা সম্ভব হয়নি'));
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title={t.tenants}
        description={isEn ? 'Manage tenant profiles, contact details, and rental history.' : 'ভাড়াটিয়ার প্রোফাইল, যোগাযোগের তথ্য ও ভাড়ার ইতিহাস পরিচালনা করুন।'}
        action={<Button onClick={handleCreate} className="h-10 gap-2"><UserPlus className="h-4 w-4" />{t.addNewTenant}</Button>}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9CA3AF]" />
          <Input placeholder={isEn ? 'Search by name, phone, or NID' : 'নাম, ফোন বা এনআইডি দিয়ে খুঁজুন'} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <p className="text-xs text-[#6B7280]">{tenants ? `${tenants.length} ${isEn ? 'tenants' : 'জন ভাড়াটিয়া'}` : ''}</p>
      </div>

      {/* Responsive Tenants Table */}
      {isLoading ? (
        <ResponsiveTableContainer>
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">{t.tenantName}</TableHead>
                  <TableHead align="left" className="min-w-[140px]">{t.phone}</TableHead>
                  <TableHead align="left" className="min-w-[180px]">{t.email}</TableHead>
                  <TableHead align="left" className="min-w-[140px]">{t.occupation}</TableHead>
                  <TableHead align="left" className="min-w-[110px]">{isEn ? 'Added On' : 'যোগে করার তারিখ'}</TableHead>
                  <TableHead align="right" className="min-w-[140px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton columns={6} rows={5} />
              </TableBody>
            </Table>
          </div>
          <div className="block md:hidden">
            <MobileTableSkeleton rows={5} />
          </div>
        </ResponsiveTableContainer>
      ) : tenants && tenants.length > 0 ? (
        <ResponsiveTableContainer>
          {/* Desktop Tabular View */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">{t.tenantName}</TableHead>
                  <TableHead align="left" className="min-w-[140px]">{t.phone}</TableHead>
                  <TableHead align="left" className="min-w-[180px]">{t.email}</TableHead>
                  <TableHead align="left" className="min-w-[140px]">{t.occupation}</TableHead>
                  <TableHead align="left" className="min-w-[110px]">{isEn ? 'Added On' : 'যোগে করার তারিখ'}</TableHead>
                  <TableHead align="right" className="min-w-[140px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TenantRow
                    key={tenant.id}
                    tenant={tenant}
                    language={language}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={openPreview}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile 2-Line Rows */}
          <div className="block md:hidden divide-y divide-[#F1F5F9]">
            {tenants.map((tenant) => (
              <MobileDataRow
                key={tenant.id}
                onClick={() => setDetailTenant(tenant)}
                showChevron
                identity={
                  <div className="flex items-center gap-2 min-w-0">
                    <TenantAvatar
                      profilePictureId={tenant.profilePictureId}
                      name={tenant.name}
                      size="sm"
                    />
                    <span className="truncate font-semibold text-sm text-[#0F172A]">{tenant.name}</span>
                  </div>
                }
                value={tenant.phone || '—'}
                stateAndDetail={
                  <>
                    {tenant.occupation && <span>{tenant.occupation}</span>}
                    {tenant.occupation && tenant.email && <span className="text-slate-300">·</span>}
                    {tenant.email && <span className="truncate max-w-[140px]">{tenant.email}</span>}
                    <span className="text-slate-300">·</span>
                    <span>{formatBnDate(tenant.createdAt, language)}</span>
                  </>
                }
                action={
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/tenants/${tenant.id}`}>
                      <Button size="sm" variant="outline" className="h-8 min-h-[38px] px-2 text-xs border-[#E2E8F0]">
                        {isEn ? 'Profile' : 'প্রোফাইল'}
                      </Button>
                    </Link>
                  </div>
                }
              />
            ))}
          </div>
        </ResponsiveTableContainer>
      ) : (
        <Card className="rounded-[10px] border-[#E2E8F0] shadow-none">
          <CardContent className="p-0">
            <EmptyState
              icon={Users}
              title={t.noTenantsFound}
              description={isEn ? 'Add your tenants to assign them to flats and record rent' : 'ভাড়াটিয়া যুক্ত করে ফ্ল্যাটে চুক্তি সম্পন্ন করুন'}
              actionLabel={t.addNewTenant}
              onAction={handleCreate}
            />
          </CardContent>
        </Card>
      )}

      {/* Row Details Bottom Sheet on Mobile */}
      <BottomSheet open={!!detailTenant} onOpenChange={(open) => !open && setDetailTenant(null)}>
        {detailTenant && (
          <BottomSheetContent>
            <BottomSheetHeader>
              <div className="flex items-center gap-3">
                <TenantAvatar
                  profilePictureId={detailTenant.profilePictureId}
                  name={detailTenant.name}
                  size="md"
                />
                <div>
                  <BottomSheetTitle>{detailTenant.name}</BottomSheetTitle>
                  <BottomSheetDescription>{detailTenant.occupation || (isEn ? 'Tenant' : 'ভাড়াটিয়া')}</BottomSheetDescription>
                </div>
              </div>
            </BottomSheetHeader>

            <div className="py-2">
              <DetailItem
                label={isEn ? 'Phone Number' : 'ফোন নম্বর'}
                value={detailTenant.phone || '—'}
                highlight
              />
              <DetailItem
                label={isEn ? 'Email' : 'ইমেইল'}
                value={detailTenant.email || '—'}
              />
              <DetailItem
                label={isEn ? 'Occupation' : 'পেশা'}
                value={detailTenant.occupation || '—'}
              />
              {detailTenant.permanentAddress && (
                <DetailItem
                  label={isEn ? 'Permanent Address' : 'স্থায়ী ঠিকানা'}
                  value={detailTenant.permanentAddress}
                />
              )}
              {detailTenant.emergencyContactName && (
                <DetailItem
                  label={isEn ? 'Emergency Contact' : 'জরুরি যোগাযোগ'}
                  value={`${detailTenant.emergencyContactName}${detailTenant.emergencyContactPhone ? ` (${detailTenant.emergencyContactPhone})` : ''}`}
                />
              )}
              <DetailItem
                label={isEn ? 'Added On' : 'যোগ করার তারিখ'}
                value={formatBnDate(detailTenant.createdAt, language)}
              />
            </div>

            <BottomSheetFooter>
              <Link href={`/tenants/${detailTenant.id}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] min-h-[44px]">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {isEn ? 'Full Profile' : 'পূর্ণ প্রোফাইল দেখুন'}
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  const tn = detailTenant;
                  setDetailTenant(null);
                  handleEdit(tn);
                }}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEn ? 'Edit' : 'সম্পাদনা'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const id = detailTenant.id;
                  const name = detailTenant.name;
                  setDetailTenant(null);
                  handleDelete(id, name);
                }}
                className="w-full sm:w-auto min-h-[44px] text-[#DC2626] hover:bg-[#FEF2F2] border-[#FCA5A5]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isEn ? 'Delete' : 'মুছুন'}
              </Button>
            </BottomSheetFooter>
          </BottomSheetContent>
        )}
      </BottomSheet>

      <TenantFormDialog tenant={editingTenant} open={tenantDialogOpen} onOpenChange={setTenantDialogOpen} onSuccess={refetch} />
      <ImagePreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} imageUrl={previewImageUrl} title={previewTitle} />
    </div>
  );
}