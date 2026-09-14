'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TenantFormDialog } from '@/components/tenants/tenant-form-dialog';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import { getFileDownloadUrl } from '@/lib/file-upload';
import { Users, UserPlus, Search, Phone, Mail, Edit, Trash2, ExternalLink, Briefcase } from 'lucide-react';

export default function TenantsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';
  const [search, setSearch] = useState('');
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
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

  // Preserve signed URL resolution through the existing media architecture.
  const { data: profilePictureUrls } = useQuery({
    queryKey: ['tenant-profile-pictures', tenants?.map(t => t.profilePictureId).filter(Boolean)],
    queryFn: async () => {
      if (!tenants) return {};
      const ids = tenants.map(t => t.profilePictureId).filter(Boolean) as string[];
      if (ids.length === 0) return {};
      const urls = await Promise.all(ids.map(async (id) => {
        try {
          const url = await getFileDownloadUrl(id);
          return { id, url };
        } catch {
          return { id, url: null };
        }
      }));
      return Object.fromEntries(urls.map(u => [u.id, u.url]));
    },
    enabled: !!tenants && tenants.some(t => t.profilePictureId),
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

      <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-5"><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /><Skeleton className="h-11 w-full" /></div>
          ) : tenants && tenants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">{t.tenantName}</TableHead>
                  <TableHead className="min-w-[170px]">{t.phone}</TableHead>
                  <TableHead className="min-w-[220px]">{t.email}</TableHead>
                  <TableHead className="min-w-[150px]">{t.occupation}</TableHead>
                  <TableHead className="w-[140px]">{isEn ? 'Added On' : 'যুক্ত করার তারিখ'}</TableHead>
                  <TableHead className="w-[190px] text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => {
                  const imageUrl = profilePictureUrls?.[tenant.profilePictureId || ''] || null;
                  return (
                    <TableRow key={tenant.id}>
                      <TableCell data-label={t.tenantName} className="min-w-[250px]">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openPreview(imageUrl, tenant.name)} disabled={!imageUrl} className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#CDE4DA] bg-[#E8F3EF] text-sm font-semibold text-[#12664F] disabled:cursor-default" aria-label={isEn ? 'View profile picture' : 'প্রোফাইল ছবি দেখুন'}>
                            {imageUrl ? (
                              // Signed media URLs are resolved at runtime and cannot use Next image optimization.
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={imageUrl} alt={tenant.name} className="h-full w-full object-cover" />
                            ) : tenant.name.charAt(0).toUpperCase()}
                          </button>
                          <div className="min-w-0"><p className="truncate font-medium text-[#171717]">{tenant.name}</p><p className="mt-0.5 text-xs text-[#6B7280]">{tenant.phone || (isEn ? 'No phone number' : 'ফোন নম্বর নেই')}</p></div>
                        </div>
                      </TableCell>
                      <TableCell data-label={t.phone} className="font-medium text-[#374151]"><span className="inline-flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[#9CA3AF]" />{tenant.phone || '-'}</span></TableCell>
                      <TableCell data-label={t.email} className="text-sm text-[#6B7280]"><span className="inline-flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-[#9CA3AF]" />{tenant.email || '-'}</span></TableCell>
                      <TableCell data-label={t.occupation} className="text-sm text-[#6B7280]"><span className="inline-flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-[#9CA3AF]" />{tenant.occupation || '-'}</span></TableCell>
                      <TableCell data-label={isEn ? 'Added On' : 'যুক্ত করার তারিখ'} className="text-xs text-[#6B7280]">{formatBnDate(tenant.createdAt, language)}</TableCell>
                      <TableCell data-label={t.actions} className="text-right"><div className="flex items-center justify-end gap-1"><Link href={`/tenants/${tenant.id}`}><Button size="sm" variant="outline" className="h-8 gap-1.5 whitespace-nowrap text-xs">{isEn ? 'Profile' : 'প্রোফাইল'}<ExternalLink className="h-3.5 w-3.5" /></Button></Link><Button size="icon" variant="ghost" onClick={() => handleEdit(tenant)} className="h-8 w-8 text-[#6B7280] hover:text-[#171717]" title={t.edit}><Edit className="h-3.5 w-3.5" /></Button><Button size="icon" variant="ghost" onClick={() => handleDelete(tenant.id, tenant.name)} className="h-8 w-8 text-[#DC2626] hover:bg-[#FEF2F2]" title={t.delete}><Trash2 className="h-3.5 w-3.5" /></Button></div></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <EmptyState icon={Users} title={t.noTenantsFound} description={isEn ? 'Add your tenants to assign them to flats and record rent' : 'ভাড়াটিয়া যুক্ত করে ফ্ল্যাটে চুক্তি সম্পন্ন করুন'} actionLabel={t.addNewTenant} onAction={handleCreate} />
          )}
        </CardContent>
      </Card>

      <TenantFormDialog tenant={editingTenant} open={tenantDialogOpen} onOpenChange={setTenantDialogOpen} onSuccess={refetch} />
      <ImagePreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} imageUrl={previewImageUrl} title={previewTitle} />
    </div>
  );
}