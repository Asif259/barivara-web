'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiResponse, MonthlyRent } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { formatCurrency, formatBnDate } from '@/lib/utils';
import { getFileDownloadUrl } from '@/lib/file-upload';
import {
  buildNoticeWhatsAppText,
  canShareFilesCapability,
  getWhatsAppShareUrl,
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
} from 'lucide-react';
import Image from 'next/image';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

export const CANONICAL_NOTICE_WIDTH = 600;

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

interface NoticeImage {
  dataUrl: string;
  blob: Blob;
  file: File;
  filename: string;
}

/**
 * Waits until web fonts and every <img> inside `node` (logo, owner signature) are
 * loaded and decoded, so the capture never contains a half-loaded image.
 *
 * Uses addEventListener (not img.onload = ...) so handlers installed by next/image
 * are not overwritten, and gives up after a few seconds so a lazy or stalled image
 * can never leave the dialog stuck in a "preparing" state.
 */
async function waitForRenderReady(node: HTMLElement): Promise<void> {
  try {
    if ('fonts' in document) await document.fonts.ready;
  } catch (error) {
    console.warn('Font loading check failed:', error);
  }

  const images = Array.from(node.querySelectorAll('img'));
  const imagesReady = Promise.all(
    images.map((img) => {
      if (img.complete) {
        return img.decode ? img.decode().catch(() => undefined) : Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      });
    }),
  );

  await Promise.race([
    imagesReady,
    new Promise<void>((resolve) => window.setTimeout(resolve, 4000)),
  ]);
}

/**
 * Prints the exported notice image through a hidden iframe.
 *
 * Printing the exported PNG (instead of window.print() on the page) guarantees
 * print === preview === download, and avoids the fixed-position dialog, the app
 * behind it, and any missing global @media print rules leaking into the printout.
 */
function printImage(dataUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';

    const remove = () => iframe.parentNode?.removeChild(iframe);

    iframe.onload = () => {
      const win = iframe.contentWindow;
      if (!win) {
        remove();
        reject(new Error('Print frame is unavailable'));
        return;
      }
      win.onafterprint = remove;
      window.setTimeout(remove, 60000); // safety net if afterprint never fires
      win.focus();
      win.print();
      resolve();
    };

    iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title></title><style>
      @page { size: auto; margin: 12mm; }
      html, body { margin: 0; padding: 0; background: #fff; }
      img { display: block; width: 100%; max-height: 250mm; object-fit: contain; object-position: top center; }
    </style></head><body><img src="${dataUrl}" alt=""></body></html>`;

    document.body.appendChild(iframe);
  });
}

/** Some devices report file-sharing support in general but reject a specific file. */
function canShareFile(file: File): boolean {
  return typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] });
}

const emptySubscribe = () => () => {};

interface RentNoticeDialogProps {
  rent: MonthlyRent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ChargeTone = 'normal' | 'late' | 'discount';

interface ChargeRow {
  key: string;
  show: boolean;
  label: string;
  amount: string;
  tone: ChargeTone;
}

export function RentNoticeDialog({
  rent,
  open,
  onOpenChange,
}: RentNoticeDialogProps) {
  const { language } = useLanguageStore();
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
  const [noticeHeight, setNoticeHeight] = React.useState<number | null>(null);

  // DOM nodes are held in state (via callback refs) instead of useRef so effects re-run
  // the moment Radix mounts the dialog content into its portal.
  const [noticeNode, setNoticeNode] = React.useState<HTMLDivElement | null>(null);
  const [containerNode, setContainerNode] = React.useState<HTMLDivElement | null>(null);

  // Notice image generated ahead of time so navigator.share() can run synchronously
  // inside the click handler (keeps the user gesture alive on Safari/iOS).
  const [preparedNotice, setPreparedNotice] = React.useState<NoticeImage | null>(null);
  const [prepareFailed, setPrepareFailed] = React.useState(false);

  // Fetch complete details when the dialog is open
  const detailsQuery = useQuery({
    queryKey: ['rent-notice-details', rent?.id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MonthlyRent>>(`/monthly-rents/${rent!.id}`);
      return res.data?.data;
    },
    enabled: open && !!rent?.id,
  });
  const rentDetails = detailsQuery.data;

  const effectiveRent = rentDetails || rent;
  const agreement = effectiveRent?.agreement;
  const tenant = agreement?.tenant;
  const unit = agreement?.unit;
  const property = unit?.property;
  const owner = property?.owner;
  const signatureFileId = owner?.signatureFileId ?? null;

  const signatureQuery = useQuery({
    queryKey: ['rent-owner-signature-url', signatureFileId],
    queryFn: () => getFileDownloadUrl(signatureFileId!),
    enabled: open && !!signatureFileId,
    retry: false,
  });
  const signatureUrl = signatureQuery.data;

  // The notice is only exportable once the full rent record and (if the owner has one)
  // the signature URL have settled; otherwise the image could be captured without them.
  const detailsSettled = detailsQuery.isSuccess || detailsQuery.isError;
  const signatureSettled =
    !signatureFileId || signatureQuery.isSuccess || signatureQuery.isError;
  const isNoticeDataReady = open && detailsSettled && signatureSettled;

  // Native share needs a pre-built image; true while it is still being generated.
  const isPreparing =
    canShareImageNatively && isNoticeDataReady && !preparedNotice && !prepareFailed;

  // Measure available container width and calculate scale factor for responsive preview.
  // Depends on the actual DOM nodes rather than just `open`: Radix mounts dialog content
  // through a portal AFTER the first commit, so with plain refs this effect could run while
  // both nodes were still null and never attach its observers (scale would stay at 1).
  React.useLayoutEffect(() => {
    if (!open || !containerNode || !noticeNode) return;

    const updateDimensions = () => {
      const containerWidth = containerNode.clientWidth;
      if (containerWidth > 0) {
        setScale(Math.min(1, containerWidth / CANONICAL_NOTICE_WIDTH));
      }
      setNoticeHeight(noticeNode.offsetHeight);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerNode);
    resizeObserver.observe(noticeNode);
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [open, containerNode, noticeNode]);

  const unitNumber = unit?.unitNumber;
  const rentMonth = effectiveRent?.month;
  const rentYear = effectiveRent?.year;

  /**
   * Generates a high-res PNG image from the notice DOM element
   */
  const generateNoticeImage = React.useCallback(async (): Promise<NoticeImage> => {
    if (!noticeNode) {
      throw new Error('Notice DOM element not found');
    }

    await waitForRenderReady(noticeNode);

    const dataUrl = await toPng(noticeNode, {
      pixelRatio: 2, // Crisp 2x retina export
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipFonts: true, // Prevents SecurityError from cross-origin font CSS
    });

    const cleanUnit = String(unitNumber || 'unit').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `rent-notice-${cleanUnit}-${rentMonth}-${rentYear}.png`;

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], filename, { type: 'image/png' });

    return { dataUrl, blob, file, filename };
  }, [noticeNode, unitNumber, rentMonth, rentYear]);

  // Pre-generate the notice image for native sharing once everything it shows has loaded.
  // Re-runs (and discards the old image in cleanup) whenever the notice content could change.
  React.useEffect(() => {
    if (!canShareImageNatively || !isNoticeDataReady || !noticeNode) return;

    let cancelled = false;
    generateNoticeImage()
      .then((image) => {
        if (!cancelled) {
          setPreparedNotice(image);
          setPrepareFailed(false);
        }
      })
      .catch((error) => {
        console.error('Failed to pre-generate notice image:', error);
        if (!cancelled) {
          setPreparedNotice(null);
          setPrepareFailed(true);
        }
      });

    return () => {
      cancelled = true;
      setPreparedNotice(null);
      setPrepareFailed(false);
    };
  }, [
    canShareImageNatively,
    isNoticeDataReady,
    noticeNode,
    generateNoticeImage,
    effectiveRent,
    signatureUrl,
    language,
  ]);

  if (!rent || !effectiveRent) return null;

  const tenantName = tenant?.name?.trim() || '';
  const rawPhone = tenant?.phone || '';
  const phoneResult = validateAndNormalizePhone(rawPhone);
  const hasValidPhone = phoneResult.isValid;

  const toNum = (value: unknown) => Number(value) || 0;
  const remainingNum = toNum(effectiveRent.remainingAmount);
  const paidNum = toNum(effectiveRent.paidAmount);
  const isFullyPaid = remainingNum <= 0;

  const toBnNum = (num: number | string) => {
    if (isEn) return num.toString();
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (d) => bnDigits[parseInt(d)]);
  };

  const getMonthLabel = (m: number, y: number) => {
    const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthsBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    if (!Number.isInteger(m) || m < 1 || m > 12) return `${toBnNum(m)}/${toBnNum(y)}`;
    return isEn ? `${monthsEn[m - 1]} ${y}` : `${monthsBn[m - 1]} ${toBnNum(y)}`;
  };

  const chargeRows: ChargeRow[] = [
    {
      key: 'rent',
      show: true,
      label: isEn ? 'Monthly Base Rent' : 'মাসিক মূল ভাড়া',
      amount: formatCurrency(effectiveRent.rent, language),
      tone: 'normal',
    },
    {
      key: 'service',
      show: toNum(effectiveRent.serviceFee) > 0,
      label: isEn ? 'Service Fee' : 'সার্ভিস চার্জ',
      amount: formatCurrency(effectiveRent.serviceFee, language),
      tone: 'normal',
    },
    {
      key: 'parking',
      show: toNum(effectiveRent.parkingFee) > 0,
      label: isEn ? 'Parking Fee' : 'পার্কিং ফি',
      amount: formatCurrency(effectiveRent.parkingFee, language),
      tone: 'normal',
    },
    {
      key: 'extra',
      show: toNum(effectiveRent.extraCharge) > 0,
      label: isEn ? 'Extra Charges' : 'অন্যান্য চার্জ',
      amount: formatCurrency(effectiveRent.extraCharge, language),
      tone: 'normal',
    },
    {
      key: 'late',
      show: toNum(effectiveRent.lateFee) > 0,
      label: isEn ? 'Late Fee' : 'বিলম্ব ফি',
      amount: formatCurrency(effectiveRent.lateFee, language),
      tone: 'late',
    },
    {
      key: 'discount',
      show: toNum(effectiveRent.discount) > 0,
      label: isEn ? 'Discount' : 'ডিসকাউন্ট',
      amount: formatCurrency(effectiveRent.discount, language),
      tone: 'discount',
    },
  ];

  const chargeToneClass: Record<ChargeTone, string> = {
    normal: 'text-slate-700',
    late: 'text-rose-700',
    discount: 'text-emerald-800',
  };
  const chargeAmountClass: Record<ChargeTone, string> = {
    normal: 'font-medium text-slate-900',
    late: 'font-medium',
    discount: 'font-medium',
  };
  const chargePrefix: Record<ChargeTone, string> = {
    normal: '',
    late: '+ ',
    discount: '- ',
  };

  // Status colours are inline hex (not only Tailwind classes) so the exported PNG renders
  // them identically on every browser, matching the payment receipt.
  const accentColor = isFullyPaid ? '#065f46' : '#b45309';
  const settlementBg = isFullyPaid ? '#ecfdf5' : '#fffbeb';
  const settlementText = isFullyPaid ? '#064e3b' : '#78350f';

  const buildMessageText = () =>
    buildNoticeWhatsAppText({
      tenantName,
      unitNumber: unit?.unitNumber,
      propertyName: property?.name,
      month: effectiveRent.month,
      year: effectiveRent.year,
      totalAmount: effectiveRent.totalAmount,
      paidAmount: effectiveRent.paidAmount,
      remainingAmount: effectiveRent.remainingAmount,
      dueDate: effectiveRent.dueDate,
      isEn,
    });

  /**
   * Downloads notice image to client
   */
  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const { dataUrl, filename } = preparedNotice ?? (await generateNoticeImage());

      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toast.success(isEn ? 'Rent notice downloaded successfully' : 'ভাড়ার নোটিশ সফলভাবে ডাউনলোড হয়েছে');
    } catch (error) {
      console.error('Failed to export notice image:', error);
      toast.error(isEn ? 'Failed to download notice' : 'নোটিশ ডাউনলোড করতে ব্যর্থ হয়েছে');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Prints the exact exported image (see printImage)
   */
  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const { dataUrl } = preparedNotice ?? (await generateNoticeImage());
      await printImage(dataUrl);
    } catch (error) {
      console.error('Failed to print notice:', error);
      toast.error(isEn ? 'Failed to print notice' : 'নোটিশ প্রিন্ট করতে ব্যর্থ হয়েছে');
    } finally {
      setIsPrinting(false);
    }
  };

  /**
   * Opens the EXACT tenant WhatsApp chat via wa.me deep-link (text only).
   * Mobile: WhatsApp app opens to the tenant chat. Desktop: WhatsApp Web does.
   * The notice image is NOT attached here — browsers can't attach a locally generated
   * image and open a specific chat at once. Native share (below) covers the image case.
   */
  const handleSendToWhatsApp = () => {
    if (!hasValidPhone) {
      toast.error(
        isEn
          ? 'Tenant does not have a WhatsApp number.'
          : 'ভাড়াটিয়ার কোনো হোয়াটসঅ্যাপ নম্বর নেই।'
      );
      return;
    }

    const messageText = buildMessageText();
    const waUrl = getWhatsAppShareUrl(phoneResult.normalizedPhone, messageText);

    let opened: Window | null = null;
    try {
      // No "noopener" in the features string: it makes window.open() ALWAYS return null,
      // which is indistinguishable from a blocked popup. Detach the opener manually instead.
      opened = window.open(waUrl, '_blank');
      if (opened) opened.opener = null;
    } catch (error) {
      console.warn('[WhatsApp] window.open failed:', error);
    }

    const popupBlocked = !opened || opened.closed;

    if (popupBlocked) {
      // Popup was blocked — show fallback dialog with manual "Open WhatsApp" button
      setFallbackData({
        waUrl,
        messageText,
        phone: phoneResult.normalizedPhone,
        tenantName: tenantName || (isEn ? 'Tenant' : 'ভাড়াটিয়া'),
        popupBlocked: true,
      });
      setFallbackOpen(true);
    } else {
      toast.success(
        isEn
          ? `WhatsApp chat opened for ${tenantName || phoneResult.normalizedPhone}`
          : `${tenantName || phoneResult.normalizedPhone}-এর হোয়াটসঅ্যাপ চ্যাট খোলা হয়েছে`
      );
    }
  };

  /**
   * Combined "Share Notice" flow:
   * 1. If the notice image was pre-generated, open the native share sheet with it.
   *    navigator.share() is called synchronously (before any await) so the click's
   *    user activation is still valid — Safari/iOS rejects it otherwise.
   * 2. If native sharing is unavailable, the image isn't ready, or sharing fails
   *    (non-abort), fall back to the text-only exact-contact wa.me link.
   */
  const handleSendNotice = async () => {
    const notifyTextOnly = () =>
      toast.info(
        isEn
          ? "Couldn't attach the notice image. Opening WhatsApp with the message only."
          : 'নোটিশের ছবি যুক্ত করা যায়নি। শুধু বার্তা দিয়ে হোয়াটসঅ্যাপ খোলা হচ্ছে।'
      );

    if (canShareImageNatively) {
      if (preparedNotice && canShareFile(preparedNotice.file)) {
        try {
          setIsSharing(true);

          await navigator.share({
            files: [preparedNotice.file],
            title: isEn ? 'Rent Payment Notice' : 'ভাড়ার নোটিশ',
            text: buildMessageText(),
          });

          toast.success(isEn ? 'Shared via device' : 'সফলভাবে শেয়ার করা হয়েছে');
          return; // Success
        } catch (err: unknown) {
          if ((err as Error)?.name === 'AbortError') return;
          console.error('Failed to share notice natively, falling back to text:', err);
          notifyTextOnly();
          // fall through to wa.me on failure
        } finally {
          setIsSharing(false);
        }
      } else {
        // The button is disabled while the image is being prepared, so reaching here
        // means pre-generation failed or this device rejects the file.
        notifyTextOnly();
      }
    }

    // Fallback: text-only deep link to exact contact
    handleSendToWhatsApp();
  };

  // Share button label
  const getShareButtonText = () => {
    if (isPreparing) return isEn ? 'Preparing...' : 'প্রস্তুত হচ্ছে...';
    if (isSharing) return isEn ? 'Sharing...' : 'শেয়ার হচ্ছে...';
    if (canShareImageNatively) return isEn ? 'Share Notice' : 'নোটিশ শেয়ার করুন';
    if (hasValidPhone && tenantName) {
      return isEn ? `Send to ${tenantName}` : `${tenantName}-কে পাঠান`;
    }
    return isEn ? 'Send in WhatsApp' : 'হোয়াটসঅ্যাপে পাঠান';
  };

  const actionsDisabled = isDownloading || isSharing || isPrinting || !isNoticeDataReady;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg md:max-w-2xl p-0 bg-white max-h-[92vh] flex flex-col overflow-hidden rounded-xl shadow-2xl border border-stone-300">
          {/* Screen-reader title/description (required by Radix; the notice itself carries the visible heading) */}
          <DialogHeader className="sr-only">
            <DialogTitle>
              {isEn ? 'Monthly Rent Payment Notice' : 'মাসিক ভাড়ার নোটিশ ও পেমেন্ট অনুরোধ'}
            </DialogTitle>
            <DialogDescription>
              {isEn
                ? 'Official payment request notice for the tenant. Does not record payment or alter ledger balances.'
                : 'ভাড়াটিয়ার জন্য আনুষ্ঠানিক ভাড়া পরিশোধের অনুরোধ। এটি কোনো রশিদ নয় এবং এতে কোনো নতুন পেমেন্ট রেকর্ড হবে না।'}
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Notice Body — overflow-y-auto and overflow-x-hidden to avoid horizontal scrollbar */}
          <div className="overflow-y-auto overflow-x-hidden flex-1 bg-stone-100/70 p-4 sm:p-7">
            {/* Invisible measurement anchor to get available container width without being distorted by the 600px notice */}
            <div ref={setContainerNode} className="w-full h-0 pointer-events-none" />

            {/* Scaled Preview Wrapper & Centering Box */}
            <div className="flex justify-center w-full min-h-full items-start">
              <div
                className="relative shrink-0 transition-all duration-75"
                style={{
                  width: Math.min(CANONICAL_NOTICE_WIDTH, CANONICAL_NOTICE_WIDTH * scale),
                  height: noticeHeight ? Math.ceil(noticeHeight * scale) + 2 : 'auto',
                  overflow: 'hidden',
                }}
              >
                {/*
                 * Scale transformation wrapper.
                 * Keeps the child element fixed at 600px width while scaling it visually.
                 */}
                <div
                  style={{
                    width: CANONICAL_NOTICE_WIDTH,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {/*
                   * CANONICAL NOTICE ELEMENT
                   * Fixed width at all times so preview === download === print === WhatsApp image.
                   * No responsive (sm:) or print: classes inside this element.
                   */}
                  <div
                    ref={setNoticeNode}
                    id="canonical-rent-notice"
                    className="space-y-5 bg-white border border-stone-300 shadow-sm select-none"
                    style={{ width: CANONICAL_NOTICE_WIDTH, padding: '28px' }}
                  >
                    {/* Header */}
                    <div className="border-y-[3px] border-emerald-800 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded">
                            <Image
                              src="/logo.png"
                              alt="BariVara"
                              width={44}
                              height={44}
                              unoptimized
                              loading="eager"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h2 className="font-serif text-[22px] font-bold text-slate-950 tracking-tight leading-tight">
                              {property?.name || 'বাড়িভাড়া (BariVara)'}
                            </h2>
                            {property?.address && (
                              <p className="text-[11px] text-slate-600 leading-tight mt-1">{property.address}</p>
                            )}
                            {owner?.name && (
                              <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                                {isEn ? 'Landlord' : 'মালিক'}: {owner.name}
                                {owner.phone ? ` (${toBnNum(owner.phone)})` : ''}
                              </p>
                            )}
                            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-[0.18em] mt-1.5">
                              {isEn ? 'Rent Payment Notice' : 'ভাড়া পরিশোধের নোটিশ'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className="inline-block text-[10px] px-2 py-1 font-bold tracking-[0.14em]"
                            style={{ backgroundColor: accentColor, color: '#ffffff' }}
                          >
                            {isFullyPaid
                              ? (isEn ? 'FULLY PAID' : 'সম্পূর্ণ পরিশোধিত')
                              : (isEn ? 'PAYMENT DUE' : 'পরিশোধযোগ্য')}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-2 font-mono">
                            {isEn ? 'Notice No.' : 'নোটিশ নং'} #{String(effectiveRent.id).substring(0, 8).toUpperCase()}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {isEn ? 'Issued' : 'ইস্যুর তারিখ'}:{' '}
                            {effectiveRent.createdAt ? formatBnDate(effectiveRent.createdAt, language) : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Rent period, due date, tenant and unit details */}
                    <div className="border-y border-stone-300 divide-y divide-stone-300 text-xs">
                      <div className="grid grid-cols-2 divide-x divide-stone-300">
                        <div className="space-y-1 py-3 pr-4">
                          <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.12em] block">
                            {isEn ? 'Rent Month:' : 'ভাড়ার মাস:'}
                          </span>
                          <span className="font-semibold text-slate-950 text-sm block">
                            {getMonthLabel(effectiveRent.month, effectiveRent.year)}
                          </span>
                        </div>
                        <div className="text-right space-y-1 py-3 pl-4">
                          <span className="font-bold text-[10px] uppercase tracking-[0.12em] block" style={{ color: '#be123c' }}>
                            {isEn ? 'Payment Due Date:' : 'পরিশোধের শেষ তারিখ:'}
                          </span>
                          <span className="font-semibold text-sm block" style={{ color: '#9f1239' }}>
                            {effectiveRent.dueDate ? formatBnDate(effectiveRent.dueDate, language) : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 divide-x divide-stone-300">
                        <div className="space-y-1 py-3 pr-4">
                          <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.12em] block">
                            {isEn ? 'Billed To (Tenant):' : 'ভাড়াটিয়া:'}
                          </span>
                          <span className="font-semibold text-slate-950 text-sm block">
                            {tenantName || (isEn ? 'Tenant' : 'ভাড়াটিয়া')}
                          </span>
                          <span className="text-slate-600 text-[11px] block">
                            {rawPhone ? toBnNum(rawPhone) : '-'}
                          </span>
                        </div>
                        <div className="text-right space-y-1 py-3 pl-4">
                          <span className="text-emerald-800 font-bold text-[10px] uppercase tracking-[0.12em] block">
                            {isEn ? 'Unit & Property:' : 'ইউনিট ও বাড়ি:'}
                          </span>
                          <span className="font-semibold text-slate-950 text-sm block">
                            {unit ? `${isEn ? 'Unit' : 'ইউনিট'} ${toBnNum(unit.unitNumber)}` : '-'}
                          </span>
                          <span className="text-slate-600 text-[11px] block">
                            {property?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Itemized Charges Table */}
                    <div className="border border-stone-300 overflow-hidden text-xs">
                      <div className="bg-stone-100 px-4 py-2.5 border-b border-stone-300 flex justify-between items-center text-[10px] font-bold text-stone-700 uppercase tracking-[0.16em]">
                        <span>{isEn ? 'Itemized Charges' : 'ভাড়ার হিসাব ও বিবরণী'}</span>
                        <span>{isEn ? 'Amount' : 'পরিমাণ'}</span>
                      </div>

                      <div className="divide-y divide-stone-200 bg-white">
                        {chargeRows
                          .filter((row) => row.show)
                          .map((row) => (
                            <div
                              key={row.key}
                              className={`px-4 py-2 flex justify-between ${chargeToneClass[row.tone]}`}
                            >
                              <span>{row.label}:</span>
                              <span className={chargeAmountClass[row.tone]}>
                                {chargePrefix[row.tone]}
                                {row.amount}
                              </span>
                            </div>
                          ))}

                        <div className="px-4 py-2.5 flex justify-between font-semibold text-slate-950 bg-stone-100">
                          <span>{isEn ? 'Total Bill for Month' : 'এই মাসের মোট বিল'}:</span>
                          <span>{formatCurrency(effectiveRent.totalAmount, language)}</span>
                        </div>

                        {paidNum > 0 && (
                          <div className="px-4 py-2 flex justify-between text-emerald-800 font-medium">
                            <span>{isEn ? 'Paid So Far' : 'পূর্বে পরিশোধিত ভাড়া'}:</span>
                            <span>- {formatCurrency(effectiveRent.paidAmount, language)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Settlement — balance due on the left, owner signature on the right */}
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{ backgroundColor: settlementBg }}
                    >
                      <div>
                        <span
                          className="text-[10px] block font-bold uppercase tracking-[0.16em]"
                          style={{ color: settlementText }}
                        >
                          {isEn ? 'Total Balance Due' : 'সর্বমোট প্রদেয় বকেয়া'}
                        </span>
                        <span className="text-2xl font-bold block" style={{ color: settlementText }}>
                          {formatCurrency(effectiveRent.remainingAmount, language)}
                        </span>
                        <span className="text-[11px] block mt-0.5" style={{ color: accentColor }}>
                          {isFullyPaid
                            ? (isEn ? 'Fully paid. No payment required.' : 'সম্পূর্ণ পরিশোধিত। কোনো বকেয়া নেই।')
                            : (isEn ? 'Please pay before the due date.' : 'অনুগ্রহ করে শেষ তারিখের মধ্যে পরিশোধ করুন।')}
                        </span>
                      </div>

                      <div className="text-right text-xs text-slate-600 space-y-1 shrink-0">
                        {signatureUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={signatureUrl}
                            alt={isEn ? 'Owner Signature' : 'মালিকের স্বাক্ষর'}
                            crossOrigin="anonymous"
                            className="h-7 ml-auto object-contain"
                            style={{ maxWidth: '9rem' }}
                          />
                        ) : null}
                        <div className="border-t border-stone-400 w-24 ml-auto" />
                        <span className="font-medium text-[11px] text-slate-800 block">
                          {owner?.name || (isEn ? 'Landlord' : 'বাড়িওয়ালা')}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {isEn ? 'Authorized Signatory' : 'অনুরোধকারী / বাড়িওয়ালা'}
                        </span>
                      </div>
                    </div>

                    {!isFullyPaid && (
                      <div className="text-xs bg-stone-50 px-3 py-2.5 border-l-2 border-stone-300 text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {isEn ? 'Payment Instructions' : 'পেমেন্ট নির্দেশিকা'}:
                        </span>{' '}
                        {isEn
                          ? 'Please pay via Cash, bKash, Nagad, or Bank Transfer to the landlord directly before the deadline.'
                          : 'নির্ধারিত শেষ তারিখের মধ্যে ক্যাশ, বিকাশ, নগদ অথবা ব্যাংক ট্রান্সফারের মাধ্যমে বাড়িওয়ালার নিকট ভাড়া পরিশোধ করুন।'}
                      </div>
                    )}

                    {/* Footer Note */}
                    <div className="border-t border-stone-200 pt-3 text-center text-[10px] text-slate-500">
                      {isEn
                        ? 'This is an electronic payment notice, not a receipt.'
                        : 'এটি একটি ইলেকট্রনিক ভাড়ার নোটিশ, রশিদ নয়।'}
                    </div>
                  </div>
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
              {isEn ? 'Close' : 'বন্ধ করুন'}
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

              {/* Download: saves the notice image */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownload}
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
                  onClick={handleSendNotice}
                  disabled={actionsDisabled || isPreparing}
                  className="gap-2 shadow-xs font-semibold bg-[#25D366] hover:bg-[#20ba59] text-white border-0 transition-colors w-full cursor-pointer"
                  title={
                    canShareImageNatively
                      ? (isEn ? 'Share notice image via native share sheet' : 'শেয়ার শিট দিয়ে নোটিশ শেয়ার করুন')
                      : (hasValidPhone
                        ? `WhatsApp: ${phoneResult.normalizedPhone}`
                        : (isEn ? 'No WhatsApp number for this tenant' : 'ভাড়াটিয়ার হোয়াটসঅ্যাপ নম্বর নেই'))
                  }
                >
                  {isSharing || isPreparing ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-white" />
                  ) : canShareImageNatively ? (
                    <Share2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{getShareButtonText()}</span>
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
   * Only populated when a popup was blocked.
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
      await navigator.clipboard.writeText(data.messageText);
      setCopiedText(true);
      window.clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopiedText(false), 2500);
    } catch (error) {
      console.error('Failed to copy message text:', error);
      toast.error(isEn ? 'Could not copy the message' : 'বার্তা কপি করা যায়নি');
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(data.waUrl, '_blank', 'noopener,noreferrer');
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
                {isEn ? `WhatsApp: ${data.phone}` : `নম্বর: ${data.phone}`}
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
                  ? 'Click "Open WhatsApp" below to open the exact tenant chat.'
                  : 'নিচের "হোয়াটসঅ্যাপ খুলুন" বাটনে চাপ দিয়ে সরাসরি চ্যাট খুলুন।'}
              </p>
            </div>
          </div>
        )}

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
          <pre className="text-[11px] font-sans bg-slate-100 p-2.5 rounded-lg border border-slate-200 whitespace-pre-wrap text-slate-800 leading-relaxed">
            {data.messageText}
          </pre>
        </div>

        <DialogFooter className="pt-2 flex items-center justify-between gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {isEn ? 'Close' : 'বন্ধ করুন'}
          </Button>
          <Button
            type="button"
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