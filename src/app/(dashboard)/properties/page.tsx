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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
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
  Building,
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || (isEn ? 'Failed to delete' : 'মুছে ফেলা সম্ভব হয়নি'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.properties}
        description={isEn ? 'Manage your buildings, floors, and flats' : 'আপনার বাড়ি, ভবন ও ইউনিটসমূহ পরিচালনা করুন'}
        action={
          <Button onClick={handleCreate} variant="gradient" className="gap-2 shadow-xs">
            <Plus className="w-4 h-4" />
            {t.addNewProperty}
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder={isEn ? 'Search by property name, address or city...' : 'নাম, ঠিকানা বা শহর দিয়ে খুঁজুন...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : properties && properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="group relative flex flex-col justify-between overflow-hidden border-slate-200/80 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-emerald-700 transition-colors">
                        {property.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {property.address} {property.city ? `, ${property.city}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {property.description && (
                  <p className="text-xs text-slate-600 mb-4 line-clamp-2 bg-slate-50 p-2.5 rounded-xl">
                    {property.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isEn ? 'Floors:' : 'তলা:'} <strong>{property.totalFloors}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl">
                    <Home className="w-4 h-4 text-emerald-600" />
                    <span>
                      {isEn ? 'Units:' : 'ফ্ল্যাট:'} <strong>{property._count?.units || 0}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(property)}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900"
                    title={t.edit}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(property.id, property.name)}
                    className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <Link href={`/properties/${property.id}`}>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold rounded-xl text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                    <span>{isEn ? 'Manage Units' : 'ইউনিট ও ফ্ল্যাট'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title={t.noPropertiesFound}
          description={t.addFirstProperty}
          actionLabel={t.addNewProperty}
          onAction={handleCreate}
        />
      )}

      {/* Create / Edit Modal Dialog */}
      <PropertyFormDialog
        property={editingProperty}
        open={propertyDialogOpen}
        onOpenChange={setPropertyDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
