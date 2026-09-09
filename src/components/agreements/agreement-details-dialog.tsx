'use client';

import React from 'react';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { RentalAgreement } from '@/lib/types';
import { formatCurrency, formatBnDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { FileText, User, Home, Calendar, CreditCard, Ban } from 'lucide-react';

interface AgreementDetailsDialogProps {
  agreement: RentalAgreement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEndAgreement?: (id: string, tenantName: string) => void;
}

export function AgreementDetailsDialog({
  agreement,
  open,
  onOpenChange,
  onEndAgreement,
}: AgreementDetailsDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  if (!agreement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                {isEn ? 'Rental Agreement Details' : 'ভাড়া চুক্তির বিস্তারিত'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {isEn ? 'Complete agreement terms & tenant profile' : 'চুক্তির শর্তাবলী ও ভাড়াটিয়ার বিবরণ'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2 text-sm">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-medium text-slate-600">{t.status}:</span>
            <StatusBadge status={agreement.status} lang={language} />
          </div>

          {/* Tenant & Unit Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                {t.tenantName}
              </div>
              <p className="font-bold text-slate-900">{agreement.tenant?.name || '-'}</p>
              <p className="text-xs text-slate-500">{agreement.tenant?.phone || '-'}</p>
              {agreement.tenant?.email && (
                <p className="text-xs text-slate-500">{agreement.tenant.email}</p>
              )}
            </div>

            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Home className="w-3.5 h-3.5 text-emerald-600" />
                {t.unitNumber}
              </div>
              <p className="font-bold text-slate-900">{agreement.unit?.unitNumber || '-'}</p>
              <p className="text-xs text-slate-500">{agreement.unit?.property?.name || '-'}</p>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              {isEn ? 'Financial Terms' : 'অর্থনৈতিক বিবরণ'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="block text-xs text-slate-500">{t.baseRent}</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(agreement.monthlyRent, language)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">{t.serviceFee}</span>
                <span className="font-medium text-slate-700">
                  {formatCurrency(agreement.serviceFee, language)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">{t.securityDeposit}</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(agreement.securityDeposit, language)}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule & Dates */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {isEn ? 'Schedule & Dates' : 'সময়সূচী ও তারিখ'}
            </h4>
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="block text-xs text-slate-500">{t.dueDay}</span>
                <span className="font-medium text-slate-800">
                  {isEn ? `Day ${agreement.dueDay} of each month` : `প্রতি মাসের ${agreement.dueDay} তারিখ`}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">{t.startDate}</span>
                <span className="font-medium text-slate-800">
                  {formatBnDate(agreement.startDate, language)}
                </span>
              </div>
              {agreement.endDate && (
                <div>
                  <span className="block text-xs text-slate-500">{isEn ? 'End Date' : 'সমাপ্তির তারিখ'}</span>
                  <span className="font-medium text-rose-600">
                    {formatBnDate(agreement.endDate, language)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          {agreement.status === 'ACTIVE' && onEndAgreement && (
            <div className="pt-2 flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEndAgreement(agreement.id, agreement.tenant?.name || 'tenant');
                }}
                className="gap-1.5 text-xs bg-rose-600 hover:bg-rose-700"
              >
                <Ban className="w-3.5 h-3.5" />
                {t.endAgreement}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
