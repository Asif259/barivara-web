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
      <TableCell className="min-w-[220px]">
        <div className="flex items-center gap-2.5">
          <TenantAvatar
            profilePictureId={tenant.profilePictureId}
            name={tenant.name}
            size="sm"
            onClick={() => onPreview(imageUrl || null, tenant.name)}
            ariaLabel={isEn ? 'View profile picture' : 'প্রোফাইল ছবি দেখুন'}
          />
          <div className="min-w-0 max-w-[170px]">
            <p className="truncate font-medium text-[#0F172A] text-sm" title={tenant.name}>
              {tenant.name}
            </p>
            <p className="truncate text-xs text-[#64748B]" title={tenant.phone || ''}>
              {tenant.phone || '—'}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell align="left" className="text-xs text-[#334155] whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-[#94A3B8]" />
          <span>{tenant.phone || '—'}</span>
        </span>
      </TableCell>
      <TableCell align="left" className="text-xs text-[#64748B]">
        <span className="inline-flex items-center gap-1.5 truncate max-w-[200px]" title={tenant.email || ''}>
          <Mail className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
          <span className="truncate">{tenant.email || '—'}</span>
        </span>
      </TableCell>
      <TableCell align="left" className="text-xs text-[#64748B]">
        <span className="inline-flex items-center gap-1.5 truncate max-w-[160px]" title={tenant.occupation || ''}>
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-[#94A3B8]" />
          <span className="truncate">{tenant.occupation || '—'}</span>
        </span>
      </TableCell>
      <TableCell align="left" className="text-xs text-[#64748B] whitespace-nowrap">
        {formatBnDate(tenant.createdAt, language)}
      </TableCell>
      <TableCell align="right">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/tenants/${tenant.id}`}>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 whitespace-nowrap text-xs px-2.5">
              {isEn ? 'Profile' : 'প্রোফাইল'}<ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(tenant)}
            className="h-8 w-8 text-[#64748B] hover:text-[#0F172A]"
            title={isEn ? 'Edit' : 'সম্পাদনা'}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(tenant.id, tenant.name)}
            className="h-8 w-8 text-[#DC2626] hover:bg-[#FEF2F2]"
            title={isEn ? 'Delete' : 'মুছুন'}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}