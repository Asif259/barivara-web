'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Tenant, ApiResponse } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead } from '@/components/ui/table';
import { TenantFormDialog } from '@/components/tenants/tenant-form-dialog';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import { TenantRow } from '@/components/ui/tenant-row';
import { Users, UserPlus, Search } from 'lucide-react';

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
                  <TableHead className="w-[140px]">{isEn ? 'Added On' : 'যোগে করার তারিখ'}</TableHead>
                  <TableHead className="w-[190px] text-right">{t.actions}</TableHead>
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