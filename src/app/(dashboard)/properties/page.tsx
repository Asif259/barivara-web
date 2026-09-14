'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Property, ApiResponse } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { PropertyFormDialog } from '@/components/properties/property-form-dialog';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Home,
  Layers,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export default function PropertiesPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [search, setSearch] = useState('');
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const {
    data: properties,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['properties-list', search],
    queryFn: async () => {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await apiClient.get<ApiResponse<Property[]>>(`/properties?limit=50${searchParam}`);
      return res.data?.data || [];
    },
  });

  const handleEdit = (p: Property) => {
    setEditingProperty(p);
    setPropertyDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProperty(null);
    setPropertyDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(isEn ? `Are you sure you want to delete "${name}"?` : `আপনি কি নিশ্চিতভাবে "${name}" মুছে ফেলতে চান?`)) {
      return;
    }
    try {
      await apiClient.delete(`/properties/${id}`);
      toast.success(isEn ? 'Property deleted successfully' : 'বাড়ি মুছে ফেলা হয়েছে');
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
        title={t.properties}
        description={isEn ? 'Manage buildings, addresses, and units from one place.' : 'বাড়ি, ঠিকানা এবং ইউনিট এক জায়গা থেকে পরিচালনা করুন।'}
        action={
          <Button onClick={handleCreate} className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            {t.addNewProperty}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#9CA3AF]" />
          <Input
            placeholder={isEn ? 'Search by name, address, or city' : 'নাম, ঠিকানা বা শহর দিয়ে খুঁজুন'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-[#6B7280]">
          {properties ? `${properties.length} ${isEn ? 'properties' : 'টি বাড়ি'}` : ''}
        </p>
      </div>

      {isLoading ? (
        <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
          <CardContent className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </CardContent>
        </Card>
      ) : properties && properties.length > 0 ? (
        <Card className="rounded-[10px] border-[#E5E7EB] shadow-none">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[240px]">{isEn ? 'Property' : 'বাড়ি'}</TableHead>
                  <TableHead className="min-w-[250px]">{isEn ? 'Address' : 'ঠিকানা'}</TableHead>
                  <TableHead className="w-[120px]">{t.units}</TableHead>
                  <TableHead className="w-[120px]">{t.floor}</TableHead>
                  <TableHead className="w-[150px]">{t.status}</TableHead>
                  <TableHead className="w-[180px] text-right">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => {
                  const unitCount = property._count?.units || 0;
                  return (
                    <TableRow key={property.id}>
                      <TableCell data-label={isEn ? 'Property' : 'বাড়ি'} className="min-w-[240px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F3EF] text-[#12664F]">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-[#171717]">{property.name}</p>
                            {property.description && <p className="mt-0.5 truncate text-xs text-[#6B7280]">{property.description}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-label={isEn ? 'Address' : 'ঠিকানা'} className="min-w-[250px]">
                        <div className="flex items-start gap-2 text-[#6B7280]">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9CA3AF]" />
                          <span>{property.address}{property.city ? `, ${property.city}` : ''}</span>
                        </div>
                      </TableCell>
                      <TableCell data-label={t.units}>
                        <span className="inline-flex items-center gap-1.5 font-medium text-[#374151]"><Home className="h-3.5 w-3.5 text-[#6B7280]" />{unitCount}</span>
                      </TableCell>
                      <TableCell data-label={t.floor}>
                        <span className="inline-flex items-center gap-1.5 text-[#6B7280]"><Layers className="h-3.5 w-3.5 text-[#9CA3AF]" />{property.totalFloors}</span>
                      </TableCell>
                      <TableCell data-label={t.status}>
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-[#15803D]"><span className="h-1.5 w-1.5 rounded-full bg-[#15803D]" />{isEn ? 'Active' : 'সক্রিয়'}</span>
                      </TableCell>
                      <TableCell data-label={t.actions} className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(property)} className="h-8 w-8 text-[#6B7280] hover:text-[#171717]" title={t.edit}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(property.id, property.name)} className="h-8 w-8 text-[#DC2626] hover:bg-[#FEF2F2]" title={t.delete}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Link href={`/properties/${property.id}`}>
                            <Button size="sm" variant="outline" className="h-8 gap-1.5 whitespace-nowrap text-xs">
                              {isEn ? 'Manage units' : 'ইউনিট দেখুন'} <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Building2}
          title={t.noPropertiesFound}
          description={t.addFirstProperty}
          actionLabel={t.addNewProperty}
          onAction={handleCreate}
        />
      )}

      <PropertyFormDialog property={editingProperty} open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen} onSuccess={refetch} />
    </div>
  );
}