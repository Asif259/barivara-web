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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { TenantFormDialog } from '@/components/tenants/tenant-form-dialog';
import { FileUploader } from '@/components/ui/file-uploader';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Briefcase,
  Shield,
  Edit,
  FileText,
  Home,
  CheckCircle2,
} from 'lucide-react';

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.id as string;

  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // 1. Fetch Tenant Profile & Statements
  const {
    data: tenant,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tenant-details', tenantId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Tenant>>(`/tenants/${tenantId}`);
      return res.data?.data;
    },
    enabled: !!tenantId,
  });

  // 2. Fetch Tenant Financial Statement
  const { data: statementData } = useQuery({
    queryKey: ['tenant-statement', tenantId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<any>>(`/reports/tenants/${tenantId}/statement`);
      return res.data?.data;
    },
    enabled: !!tenantId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <EmptyState
        icon={User}
        title={t.noTenantsFound}
        actionLabel={isEn ? 'Back to Tenants' : 'সকল ভাড়াটিয়াদের তালিকায় ফিরুন'}
        onAction={() => router.push('/tenants')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/tenants">
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
              {tenant.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{tenant.name}</h1>
              <p className="text-xs text-slate-500">{tenant.phone} {tenant.email ? `&bull; ${tenant.email}` : ''}</p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)} className="gap-1.5">
          <Edit className="w-3.5 h-3.5" />
          {t.editTenant}
        </Button>
      </div>

      {/* Tenant Profile Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              {isEn ? 'Contact Info' : 'যোগাযোগের তথ্য'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">{t.phone}:</span>
              <span className="font-semibold text-slate-900">{tenant.phone}</span>
            </div>
            {tenant.email && (
              <div>
                <span className="text-slate-500 block">{t.email}:</span>
                <span className="font-semibold text-slate-900">{tenant.email}</span>
              </div>
            )}
            {tenant.occupation && (
              <div>
                <span className="text-slate-500 block">{t.occupation}:</span>
                <span className="font-semibold text-slate-900">{tenant.occupation}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Identification & Address */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              {isEn ? 'Identification & Address' : 'এনআইডি ও ঠিকানা'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">{t.permanentAddress}:</span>
              <span className="font-semibold text-slate-900">{tenant.permanentAddress || '-'}</span>
            </div>
            {tenant.nidFrontImageId && (
              <div className="pt-2 border-t border-slate-100">
                <FileUploader
                  category="TENANT_FRONT_NID"
                  value={tenant.nidFrontImageId}
                  disabled
                  label={isEn ? 'NID — Front Side' : 'এনআইডি — সামনের পাশ'}
                />
              </div>
            )}
            {tenant.nidBackImageId && (
              <div className="pt-2 border-t border-slate-100">
                <FileUploader
                  category="TENANT_BACK_NID"
                  value={tenant.nidBackImageId}
                  disabled
                  label={isEn ? 'NID — Back Side' : 'এনআইডি — পেছনের পাশ'}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="border-slate-200/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              {isEn ? 'Emergency Contact' : 'জরুরি যোগাযোগ'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block">{isEn ? 'Contact Person' : 'ব্যক্তির নাম'}:</span>
              <span className="font-semibold text-slate-900">{tenant.emergencyContactName || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">{isEn ? 'Emergency Phone' : 'জরুরি ফোন'}:</span>
              <span className="font-semibold text-slate-900">{tenant.emergencyContactPhone || '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agreements Section */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {isEn ? 'Rental Agreements' : 'ভাড়া চুক্তিসমূহ'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tenant.agreements && tenant.agreements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.unitNumber}</TableHead>
                  <TableHead>{t.baseRent}</TableHead>
                  <TableHead>{t.serviceFee}</TableHead>
                  <TableHead>{t.securityDeposit}</TableHead>
                  <TableHead>{t.startDate}</TableHead>
                  <TableHead>{t.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenant.agreements.map((agr) => (
                  <TableRow key={agr.id}>
                    <TableCell data-label={t.unitNumber} className="font-bold text-slate-900">
                      {agr.unit?.unitNumber} ({agr.unit?.property?.name})
                    </TableCell>
                    <TableCell data-label={t.baseRent} className="font-semibold text-slate-900">
                      {formatCurrency(agr.monthlyRent, language)}
                    </TableCell>
                    <TableCell data-label={t.serviceFee} className="text-slate-600">
                      {formatCurrency(agr.serviceFee, language)}
                    </TableCell>
                    <TableCell data-label={t.securityDeposit} className="text-emerald-700 font-medium">
                      {formatCurrency(agr.securityDeposit, language)}
                    </TableCell>
                    <TableCell data-label={t.startDate} className="text-xs text-slate-600">
                      {formatBnDate(agr.startDate, language)}
                    </TableCell>
                    <TableCell data-label={t.status}>
                      <StatusBadge status={agr.status} lang={language} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-slate-500 py-4 text-center">
              {isEn ? 'No rental agreements found for this tenant.' : 'এই ভাড়াটিয়ার কোনো সক্রিয় বা পূর্বের চুক্তি পাওয়া যায়নি।'}
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
    </div>
  );
}
