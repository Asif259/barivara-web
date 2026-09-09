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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { TenantFormDialog } from '@/components/tenants/tenant-form-dialog';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Edit,
  Trash2,
  ExternalLink,
  Briefcase,
} from 'lucide-react';

export default function TenantsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [search, setSearch] = useState('');
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const {
    data: tenants,
    isLoading,
    refetch,
  } = useQuery({
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
    if (!confirm(isEn ? `Are you sure you want to delete "${name}"?` : `আপনি কি নিশ্চিতভাবে "${name}" মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      await apiClient.delete(`/tenants/${id}`);
      toast.success(isEn ? 'Tenant removed' : 'ভাড়াটিয়া মুছে ফেলা হয়েছে');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isEn ? 'Failed to delete' : 'মুছে ফেলা সম্ভব হয়নি'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.tenants}
        description={isEn ? 'Manage tenant directory, profiles, and statements' : 'ভাড়াটিয়াদের প্রোফাইল, তথ্য ও পেমেন্ট হিস্ট্রি পরিচালনা করুন'}
        action={
          <Button onClick={handleCreate} variant="gradient" className="gap-2 shadow-xs">
            <UserPlus className="w-4 h-4" />
            {t.addNewTenant}
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder={isEn ? 'Search by name, phone or NID...' : 'নাম, ফোন বা এনআইডি দিয়ে খুঁজুন...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tenants Table */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : tenants && tenants.length > 0 ? (
            <Table className='p-2'>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.tenantName}</TableHead>
                  <TableHead>{t.phone}</TableHead>
                  <TableHead>{t.email}</TableHead>
                  <TableHead>{t.occupation}</TableHead>
                  <TableHead>{t.nid}</TableHead>
                  <TableHead>{isEn ? 'Added On' : 'যুক্ত করার তারিখ'}</TableHead>
                  <TableHead className="text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell data-label={t.tenantName} className="font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{tenant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell data-label={t.phone} className="font-medium text-slate-700">
                      {tenant.phone}
                    </TableCell>
                    <TableCell data-label={t.email} className="text-slate-500 text-xs">
                      {tenant.email || '-'}
                    </TableCell>
                    <TableCell data-label={t.occupation} className="text-slate-600 text-xs">
                      {tenant.occupation || '-'}
                    </TableCell>
                    <TableCell data-label={t.nid} className="text-slate-500 text-xs font-mono">
                      {tenant.nid || '-'}
                    </TableCell>
                    <TableCell data-label={isEn ? 'Added On' : 'যুক্ত করার তারিখ'} className="text-slate-500 text-xs">
                      {formatBnDate(tenant.createdAt, language)}
                    </TableCell>
                    <TableCell data-label={t.actions} className="text-right">
                      <div className="flex items-center justify-end gap-1 table-actions">
                        <Link href={`/tenants/${tenant.id}`}>
                          <Button size="sm" variant="outline" className="gap-1 text-xs h-8 px-2.5">
                            <span>{isEn ? 'Profile' : 'প্রোফাইল'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(tenant)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(tenant.id, tenant.name)}
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={Users}
              title={t.noTenantsFound}
              description={isEn ? 'Add your tenants to assign them to flats and record rent' : 'ভাড়াটিয়া যুক্ত করে ফ্ল্যাটে চুক্তি সম্পন্ন করুন'}
              actionLabel={t.addNewTenant}
              onAction={handleCreate}
            />
          )}
        </CardContent>
      </Card>

      {/* Tenant Create / Edit Dialog */}
      <TenantFormDialog
        tenant={editingTenant}
        open={tenantDialogOpen}
        onOpenChange={setTenantDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
