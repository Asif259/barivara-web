'use client';

import React from 'react';
import Link from 'next/link';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TenantAvatar } from '@/components/ui/tenant-avatar';
import { useFileDownloadUrl } from '@/hooks/use-file-download-url';
import { Tenant } from '@/lib/types';
import { formatBnDate } from '@/lib/utils';
import { Phone, Mail, Briefcase, Edit, Trash2, ExternalLink } from 'lucide-react';

interface TenantRowProps {
  tenant: Tenant;
  language: 'bn' | 'en';
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: string, name: string) => void;
  onPreview: (url: string | null, title: string) => void;
}

export function TenantRow({ tenant, language, onEdit, onDelete, onPreview }: TenantRowProps) {
  const isEn = language === 'en';
  const { data: imageUrl } = useFileDownloadUrl(tenant.profilePictureId);

  return (
    <TableRow>
      <TableCell data-label={isEn ? 'Tenant Name' : 'ভাড়াটিয়ার নাম'} className="min-w-[250px]">
        <div className="flex items-center gap-3">
          <TenantAvatar
            profilePictureId={tenant.profilePictureId}
            name={tenant.name}
            size="md"
            onClick={() => onPreview(imageUrl || null, tenant.name)}
            ariaLabel={isEn ? 'View profile picture' : 'প্রোফাইল ছবি দেখুন'}
          />
          <div className="min-w-0">
            <p className="truncate font-medium text-[#171717]">{tenant.name}</p>
            <p className="mt-0.5 text-xs text-[#6B7280]">{tenant.phone || (isEn ? 'No phone number' : 'ফোন নম্বর নেই')}</p>
          </div>
        </div>
      </TableCell>
      <TableCell data-label={isEn ? 'Phone' : 'ফোন'} className="font-medium text-[#374151]">
        <span className="inline-flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[#9CA3AF]" />{tenant.phone || '-'}</span>
      </TableCell>
      <TableCell data-label={isEn ? 'Email' : 'ইমেইল'} className="text-sm text-[#6B7280]">
        <span className="inline-flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-[#9CA3AF]" />{tenant.email || '-'}</span>
      </TableCell>
      <TableCell data-label={isEn ? 'Occupation' : 'পেশা'} className="text-sm text-[#6B7280]">
        <span className="inline-flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-[#9CA3AF]" />{tenant.occupation || '-'}</span>
      </TableCell>
      <TableCell data-label={isEn ? 'Added On' : 'যোগে করার তারিখ'} className="text-xs text-[#6B7280]">
        {formatBnDate(tenant.createdAt, language)}
      </TableCell>
      <TableCell data-label={isEn ? 'Actions' : 'কর্ম'} className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/tenants/${tenant.id}`}>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 whitespace-nowrap text-xs">
              {isEn ? 'Profile' : 'প্রোফাইল'}<ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button size="icon" variant="ghost" onClick={() => onEdit(tenant)} className="h-8 w-8 text-[#6B7280] hover:text-[#171717]" title={isEn ? 'Edit' : 'সম্পাদনা'}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(tenant.id, tenant.name)} className="h-8 w-8 text-[#DC2626] hover:bg-[#FEF2F2]" title={isEn ? 'Delete' : 'মুছুন'}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}