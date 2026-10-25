'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiResponse, Payment } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { getFileDownloadUrl } from '@/lib/file-upload';
import {
  buildReceiptWhatsAppText,
  canShareFilesCapability,
  getWhatsAppShareUrl,
  openWhatsAppUrl,
  validateAndNormalizePhone,
} from '@/lib/whatsapp-receipt';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Download,
  Loader2,
  Copy,
  Check,
  Share2,
  Printer,
  AlertCircle,
  ExternalLink,
  Info,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import {
  RentDocument,
  CANONICAL_DOCUMENT_WIDTH,
  waitForRenderReady,
  printImage,
} from '@/components/documents/rent-document';

export const CANONICAL_RECEIPT_WIDTH = CANONICAL_DOCUMENT_WIDTH;

/** Some devices report file-sharing support in general but reject a specific file. */
function canShareFile(file: File): boolean {
  return typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] });
}

const emptySubscribe = () => () => {};

/**
 * Clean SVG icon for WhatsApp branding
 */
export function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.02 2.61c.13.17 1.77 2.7 4.29 3.78.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29" />
    </svg>
  );
}

interface ReceiptImage {
  dataUrl: string;
  blob: Blob;
  file: File;
  filename: string;
}

interface PaymentReceiptDialogProps {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


export function PaymentReceiptDialog({
  payment,
  open,
  onOpenChange,
}: PaymentReceiptDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isSharing, setIsSharing] = React.useState(false);
  const [isPrinting, setIsPrinting] = React.useState(false);

  const [fallbackOpen, setFallbackOpen] = React.useState(false);
  const [fallbackData, setFallbackData] = React.useState<{
    waUrl: string;
    messageText: string;
    phone: string;
    tenantName: string;
    popupBlocked?: boolean;
  } | null>(null);

  // Detect Web Share API file-sharing support without cascading renders or hydration mismatch.
  const canShareImageNatively = React.useSyncExternalStore(
    emptySubscribe,
    () => canShareFilesCapability(),
    () => false
  );

  const [scale, setScale] = React.useState(1);
  const [receiptHeight, setReceiptHeight] = React.useState<number | null>(null);

  // DOM nodes are held in state (via callback refs) instead of useRef so effects re-run
  // the moment Radix mounts the dialog content into its portal.
  const [receiptNode, setReceiptNode] = React.useState<HTMLDivElement | null>(null);
  const [containerNode, setContainerNode] = React.useState<HTMLDivElement | null>(null);

  // Receipt image generated ahead of time so navigator.share() can run synchronously
  // inside the click handler (keeps the user gesture alive on Safari/iOS).
  const [preparedReceipt, setPreparedReceipt] = React.useState<ReceiptImage | null>(null);
  const [prepareFailed, setPrepareFailed] = React.useState(false);

  const detailsQuery = useQuery({
    queryKey: ['payment-receipt-details', payment?.id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${payment!.id}`);
      return response.data.data;
    },
    enabled: open && !!payment?.id,
  });
  const paymentDetails = detailsQuery.data;

  const effectivePayment = paymentDetails || payment;
  // Prioritize the immutable signature snapshot made at payment time for historical audit consistency
  const currentSignatureId =
    effectivePayment?.ownerSignatureSnapshotId ??
    effectivePayment?.owner?.signatureFileId ??
    null;

  const signatureQuery = useQuery({
    queryKey: ['payment-signature-url', effectivePayment?.id, currentSignatureId],
    queryFn: () => getFileDownloadUrl(currentSignatureId!),
    enabled: open && !!currentSignatureId,
    retry: false,
  });
  const signatureUrl = signatureQuery.data;

  // The receipt is only exportable once the full payment record and (if the owner has one)
  // the signature URL have settled; otherwise the image could be captured without them.
  const detailsSettled = detailsQuery.isSuccess || detailsQuery.isError;
  const signatureSettled =
    !currentSignatureId || signatureQuery.isSuccess || signatureQuery.isError;
  const isReceiptDataReady = open && detailsSettled && signatureSettled;

  // Native share needs a pre-built image; true while it is still being generated.
  const isPreparing =
    canShareImageNatively && isReceiptDataReady && !preparedReceipt && !prepareFailed;

  // Measure available container width and calculate scale factor for responsive preview.
  // Depends on the actual DOM nodes rather than just `open`: Radix mounts dialog content
  // through a portal AFTER the first commit, so with plain refs this effect could run while
  // both nodes were still null and never attach its observers (scale would stay at 1).
  React.useLayoutEffect(() => {
    if (!open || !containerNode || !receiptNode) return;

    const updateDimensions = () => {
      const containerWidth = containerNode.clientWidth;
      if (containerWidth > 0) {
        setScale(Math.min(1, containerWidth / CANONICAL_RECEIPT_WIDTH));
      }
      setReceiptHeight(receiptNode.offsetHeight);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerNode);
    resizeObserver.observe(receiptNode);
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [open, containerNode, receiptNode]);

  const monthlyRent = effectivePayment?.monthlyRent;
  const agreement = monthlyRent?.agreement;
  const tenant = agreement?.tenant;
  const unit = agreement?.unit;
  const property = unit?.property;

  const unitNumber = unit?.unitNumber;
  const rentMonth = monthlyRent?.month;
  const rentYear = monthlyRent?.year;

  /**
   * Generates a high-res PNG image from the receipt DOM element
   */
  const generateReceiptImage = React.useCallback(async (): Promise<ReceiptImage> => {
    if (!receiptNode) {
      throw new Error('Receipt DOM element not found');
    }

    await waitForRenderReady(receiptNode);

    const dataUrl = await toPng(receiptNode, {
      quality: 1,
      pixelRatio: 2, // Crisp 2x retina export
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true, // Prevents SecurityError from cross-origin Google Fonts CSS
    });

    const unitNum = unitNumber || 'Rent';
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'];
    const monthNum = rentMonth;
    const monthStr = typeof monthNum === 'number' && monthNum >= 1 && monthNum <= 12
      ? monthNames[monthNum - 1]
      : (monthNum || 'Month');
    const year = rentYear || 'Year';
    const filename = `BariVara_Receipt_${unitNum}_${monthStr}_${year}.png`;

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: 'image/png' });

    return { dataUrl, blob, file, filename };
  }, [receiptNode, unitNumber, rentMonth, rentYear]);

  // Pre-generate the receipt image for native sharing once everything it shows has loaded.
  // Re-runs (and discards the old image in cleanup) whenever the receipt content could change.
  React.useEffect(() => {
    if (!canShareImageNatively || !isReceiptDataReady || !receiptNode) return;

    let cancelled = false;
    generateReceiptImage()
      .then((image) => {
        if (!cancelled) {
          setPreparedReceipt(image);
          setPrepareFailed(false);
        }
      })
      .catch((error) => {
        console.error('Failed to pre-generate receipt image:', error);
        if (!cancelled) {
          setPreparedReceipt(null);
          setPrepareFailed(true);
        }
      });

    return () => {
      cancelled = true;
      setPreparedReceipt(null);
      setPrepareFailed(false);
    };
  }, [
    canShareImageNatively,
    isReceiptDataReady,
    receiptNode,
    generateReceiptImage,
    effectivePayment,
    signatureUrl,
    language,
  ]);

  if (!payment || !effectivePayment) return null;

  const tenantName = tenant?.name?.trim() || '';
  const rawPhone = tenant?.phone || '';
  const phoneResult = validateAndNormalizePhone(rawPhone);
  const hasValidPhone = phoneResult.isValid;


  /**
   * Prints the exact exported image (see printImage)
   */
  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const { dataUrl } = preparedReceipt ?? (await generateReceiptImage());
      await printImage(dataUrl);
    } catch (error) {
      console.error('Failed to print receipt:', error);
      toast.error(isEn ? 'Failed to print receipt' : 'রশিদ প্রিন্ট করতে ব্যর্থ হয়েছে');
    } finally {
      setIsPrinting(false);
    }
  };

  /**
   * Downloads receipt image to client
   */
  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);
      const { dataUrl, filename } = preparedReceipt ?? (await generateReceiptImage());

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toast.success(
        t.receiptDownloadedForWhatsapp ||
          (isEn
            ? 'Receipt image downloaded. Please attach the image in WhatsApp and send.'
            : 'রশিদ ইমেজ ডাউনলোড হয়েছে। হোয়াটসঅ্যাপ চ্যাটে রশিদটি যুক্ত করে পাঠিয়ে দিন।')
      );
    } catch (error) {
      console.error('Failed to export receipt image:', error);
      toast.error(t.receiptGenFailed || (isEn ? 'Failed to download receipt image' : 'রশিদ ইমেজ ডাউনলোড ব্যর্থ হয়েছে'));
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * PRIMARY: "Send to WhatsApp"
   *
   * Opens the EXACT tenant WhatsApp chat via wa.me deep-link.
   * NO navigator.share() — no Android "Send to..." sheet.
   * Works the same on mobile and desktop.
   *
   * Mobile: WhatsApp app opens to the specific tenant chat.
   * Desktop: WhatsApp Web opens to the specific tenant chat.
   *
   * NOTE: This does NOT attach the receipt image. The browser cannot
   * reliably attach a locally generated image AND open a specific
   * WhatsApp chat simultaneously. Use the "Share Image" button for
   * image sharing via the native share sheet.
   */
  const buildCurrentReceiptMessage = () => {
    return buildReceiptWhatsAppText({
      tenantName,
      unitNumber: unit?.unitNumber || '',
      propertyName: property?.name || '',
      month: monthlyRent?.month,
      year: monthlyRent?.year,
      amount: effectivePayment.amount,
      receiptId: (effectivePayment.id || '').substring(0, 8).toUpperCase(),
      paymentDate: effectivePayment.paymentDate,
      paymentMethod: effectivePayment.paymentMethod,
      transactionId: effectivePayment.transactionId,
      totalAmount: monthlyRent?.totalAmount,
      remainingAmount: monthlyRent?.remainingAmount,
      isEn,
    });
  };

  /**
   * Opens the tenant WhatsApp chat via wa.me deep-link with prefilled text.
   * On mobile: opens native WhatsApp.
   * On desktop: opens WhatsApp Web.
   * Handles missing or invalid phone numbers gracefully by falling back to contact selection.
   */
  const handleSendToWhatsApp = () => {
    const messageText = buildCurrentReceiptMessage();
    const targetPhone = hasValidPhone ? phoneResult.normalizedPhone : '';
    const waUrl = getWhatsAppShareUrl(targetPhone, messageText);

    const { popupBlocked } = openWhatsAppUrl(waUrl);

    if (popupBlocked) {
      // Popup was blocked — show fallback dialog with manual "Open WhatsApp" button
      setFallbackData({
        waUrl,
        messageText,
        phone: targetPhone,
        tenantName: tenantName || (isEn ? 'Tenant' : 'ভাড়াটিয়া'),
        popupBlocked: true,
      });
      setFallbackOpen(true);
    } else {
      if (hasValidPhone) {
        toast.success(
          isEn
            ? `WhatsApp chat opened for ${tenantName || targetPhone}`
            : `${tenantName || targetPhone}-এর হোয়াটসঅ্যাপ চ্যাট খোলা হয়েছে`
        );
      } else {
        toast.info(
          isEn
            ? 'Tenant has no phone number recorded. Opening WhatsApp contact selector...'
            : 'ভাড়াটিয়ার ফোন নম্বর নেই। কন্টাক্ট নির্বাচন করতে হোয়াটসঅ্যাপ খোলা হচ্ছে...'
        );
      }
    }
  };

  /**
   * Combined "Share Receipt" flow:
   * 1. If native file-sharing is supported (mobile devices), share the crisp PNG image with the receipt text.
   * 2. On desktop or if sharing fails (non-abort), fall back to the text-only wa.me deep link.
   */
  const handleSendReceipt = async () => {
    const notifyTextOnly = () =>
      toast.info(
        isEn
          ? "Couldn't attach the receipt image. Opening WhatsApp with the message only."
          : 'রশিদের ছবি যুক্ত করা যায়নি। শুধু বার্তা দিয়ে হোয়াটসঅ্যাপ খোলা হচ্ছে।'
      );

    if (canShareImageNatively) {
      if (preparedReceipt && canShareFile(preparedReceipt.file)) {
        try {
          setIsSharing(true);

          const messageText = buildCurrentReceiptMessage();

          await navigator.share({
            files: [preparedReceipt.file],
            title: isEn ? 'Rent Payment Receipt' : 'ভাড়া পরিশোধের রশিদ',
            text: messageText,
          });

          return; // Success
        } catch (err: unknown) {
          if ((err as Error)?.name === 'AbortError') return;
          console.error('Failed to share receipt natively, falling back to text:', err);
          notifyTextOnly();
          // fall through to wa.me on failure
        } finally {
          setIsSharing(false);
        }
      } else {
        notifyTextOnly();
      }
    }

    // Fallback: text-only wa.me deep link
    handleSendToWhatsApp();
  };

  // Button Label
  const getButtonText = () => {
    if (isSharing || isPreparing) {
      return t.sendingReceipt || (isEn ? 'Preparing...' : 'প্রস্তুত হচ্ছে...');
    }
    if (canShareImageNatively) {
      return isEn ? 'Share Receipt' : 'রশিদ শেয়ার করুন';
    }
    if (hasValidPhone && tenantName) {
      return isEn ? `Send to ${tenantName}` : `${tenantName}-কে পাঠান`;
    }
    if (!hasValidPhone) {
      return isEn ? 'Choose WhatsApp Contact' : 'হোয়াটসঅ্যাপে পাঠান';
    }
    return isEn ? 'Send in WhatsApp' : 'হোয়াটসঅ্যাপে পাঠান';
  };

  const actionsDisabled = isDownloading || isSharing || isPrinting || !isReceiptDataReady;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl p-0 bg-white max-h-[92vh] flex flex-col overflow-hidden rounded-xl shadow-2xl border border-stone-300">
          {/* Scrollable Receipt Body — overflow-y-auto and overflow-x-hidden to avoid horizontal scrollbar */}
          <div className="overflow-y-auto overflow-x-hidden flex-1 bg-stone-100/70 p-4 sm:p-7">
            {/* Invisible measurement anchor to get available container width without being distorted by 600px receipt */}
            <div ref={setContainerNode} className="w-full h-0 pointer-events-none" />

            {/* Scaled Preview Wrapper & Centering Box */}
            <div className="flex justify-center w-full min-h-full items-start">
              <div
                className="relative shrink-0 transition-all duration-75"
                style={{
                  width: Math.min(CANONICAL_RECEIPT_WIDTH, CANONICAL_RECEIPT_WIDTH * scale),
                  height: receiptHeight ? receiptHeight * scale : 'auto',
                  overflow: 'hidden',
                }}
              >
                {/* 
                 * Scale transformation wrapper.
                 * Keeps the child element fixed at 600px width while scaling it visually.
                 */}
                <div
                  style={{
                    width: CANONICAL_RECEIPT_WIDTH,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <RentDocument
                    ref={setReceiptNode}
                    mode="payment-receipt"
                    property={property}
                    unit={unit}
                    tenantName={tenantName}
                    tenantPhone={rawPhone}
                    owner={effectivePayment.owner}
                    signatureUrl={signatureUrl}
                    language={language}
                    receiptId={effectivePayment.id}
                    paymentDate={effectivePayment.paymentDate}
                    paymentMethod={effectivePayment.paymentMethod}
                    transactionId={effectivePayment.transactionId}
                    amountPaid={effectivePayment.amount}
                    month={monthlyRent?.month}
                    year={monthlyRent?.year}
                    baseRent={monthlyRent?.rent}
                    serviceFee={monthlyRent?.serviceFee}
                    parkingFee={monthlyRent?.parkingFee}
                    extraCharge={monthlyRent?.extraCharge}
                    discount={monthlyRent?.discount}
                    totalAmount={monthlyRent?.totalAmount}
                    remainingAmount={monthlyRent?.remainingAmount}
                    note={effectivePayment.note}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Action Buttons Footer */}
          <DialogFooter className="p-3.5 px-4 sm:px-6 bg-stone-50 border-t border-stone-300 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {t.cancel}
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
              {/* Print: prints the exact exported image */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={actionsDisabled}
                className="gap-1.5 shadow-xs font-medium text-slate-700 hover:text-slate-900 border-stone-300 flex-1 sm:flex-none cursor-pointer"
              >
                {isPrinting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <Printer className="w-4 h-4 text-slate-600" />
                )}
                {isEn ? 'Print' : 'প্রিন্ট'}
              </Button>

              {/* Download: generates and saves the receipt image */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadImage}
                disabled={actionsDisabled}
                className="gap-1.5 shadow-xs font-medium text-slate-700 hover:text-slate-900 border-stone-300 flex-1 sm:flex-none cursor-pointer"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <Download className="w-4 h-4 text-slate-600" />
                )}
                {isEn ? 'Download' : 'ডাউনলোড'}
              </Button>

              {/* Primary Action: Share / Send to WhatsApp */}
              <div className="flex flex-col items-center flex-1 sm:flex-none">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSendReceipt}
                  disabled={actionsDisabled || isPreparing}
                  className="gap-2 shadow-xs font-semibold bg-[#25D366] hover:bg-[#20ba59] text-white border-0 transition-colors w-full cursor-pointer"
                  title={
                    canShareImageNatively
                      ? (isEn ? 'Share receipt image via native share sheet' : 'শেয়ার শিট দিয়ে রশিদ শেয়ার করুন')
                      : (hasValidPhone
                        ? `WhatsApp: ${phoneResult.normalizedPhone}`
                        : (isEn ? 'No WhatsApp number for this tenant' : 'ভাড়াটিয়ার হোয়াটসঅ্যাপ নম্বর নেই'))
                  }
                >
                  {isSharing || isPreparing ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-white" />
                  ) : canShareImageNatively ? (
                    <Share2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{getButtonText()}</span>
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Share Guidance & Fallback Dialog */}
      <WhatsAppShareFallbackDialog
        open={fallbackOpen}
        onOpenChange={setFallbackOpen}
        data={fallbackData}
        isEn={isEn}
      />
    </>
  );
}

interface WhatsAppShareFallbackProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Only populated when a popup was blocked on desktop.
   * The fallback dialog shows a manual "Open WhatsApp" button.
   */
  data: {
    waUrl: string;
    messageText: string;
    phone: string;
    tenantName: string;
    popupBlocked?: boolean;
  } | null;
  isEn: boolean;
}

/**
 * Shown only when window.open() is blocked by the browser.
 * Provides a manual "Open WhatsApp" button and shows the prefilled message.
 */
function WhatsAppShareFallbackDialog({
  open,
  onOpenChange,
  data,
  isEn,
}: WhatsAppShareFallbackProps) {
  const [copiedText, setCopiedText] = React.useState(false);
  const copyTimerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(copyTimerRef.current), []);

  if (!data) return null;

  const handleCopyText = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(data.messageText);
        setCopiedText(true);
        window.clearTimeout(copyTimerRef.current);
        copyTimerRef.current = window.setTimeout(() => setCopiedText(false), 2500);
      }
    } catch (error) {
      console.error('Failed to copy message text:', error);
      toast.error(isEn ? 'Could not copy the message' : 'বার্তা কপি করা যায়নি');
    }
  };

  const handleOpenWhatsApp = () => {
    openWhatsAppUrl(data.waUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-5 bg-white rounded-2xl shadow-2xl border border-slate-200">
        <DialogHeader className="space-y-1.5 pb-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] shrink-0">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
                {isEn ? `Send to ${data.tenantName}` : `${data.tenantName}-কে পাঠান`}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {data.phone
                  ? (isEn ? `WhatsApp: ${data.phone}` : `নম্বর: ${data.phone}`)
                  : (isEn ? 'Choose contact in WhatsApp' : 'হোয়াটসঅ্যাপে কন্টাক্ট নির্বাচন করুন')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Popup blocked warning */}
        {data.popupBlocked && (
          <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">
                {isEn ? 'Pop-up blocked by browser' : 'ব্রাউজার পপ-আপ ব্লক করেছে'}
              </span>
              <p className="text-[11px] text-amber-800">
                {isEn
                  ? 'Click "Open WhatsApp" below to continue to the chat.'
                  : 'নিচের "হোয়াটসঅ্যাপ খুলুন" বাটনে চাপ দিয়ে সরাসরি চ্যাট খুলুন।'}
              </p>
            </div>
          </div>
        )}

        {/* Desktop Attachment Instruction Hint */}
        <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-normal">
            {isEn
              ? 'Due to browser security restrictions, WhatsApp Web cannot automatically attach files. Download the receipt image and drag or attach it into the opened chat.'
              : 'ব্রাউজার সিকিউরিটির কারণে ওয়েব ব্রাউজার স্বয়ংক্রিয়ভাবে হোয়াটসঅ্যাপে ফাইল যুক্ত করতে পারে না। রশিদটি ডাউনলোড করে হোয়াটসঅ্যাপ চ্যাটে ড্র্যাগ বা অ্যাটাচ করুন।'}
          </p>
        </div>

        {/* Prefilled message preview */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
            <span>{isEn ? 'Prefilled message:' : 'প্রি-ফিলড মেসেজ:'}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyText}
              className="h-6 px-2 text-[11px] gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">{isEn ? 'Copied' : 'কপি হয়েছে'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Copy' : 'কপি'}</span>
                </>
              )}
            </Button>
          </div>
          <pre className="text-[11px] font-sans bg-slate-100 p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap text-slate-800 leading-relaxed max-h-48 overflow-y-auto">
            {data.messageText}
          </pre>
        </div>

        <DialogFooter className="pt-2 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {isEn ? 'Close' : 'বন্ধ করুন'}
          </Button>
          <Button
            size="sm"
            onClick={handleOpenWhatsApp}
            className="gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            {isEn ? 'Open WhatsApp' : 'হোয়াটসঅ্যাপ খুলুন'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}