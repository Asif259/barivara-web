'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiResponse, MonthlyRent } from '@/lib/types';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { getFileDownloadUrl } from '@/lib/file-upload';
import {
  buildNoticeWhatsAppText,
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
  WhatsAppIcon,
} from '@/components/documents/rent-document';

export const CANONICAL_NOTICE_WIDTH = CANONICAL_DOCUMENT_WIDTH;
export { WhatsAppIcon };

interface NoticeImage {
  dataUrl: string;
  blob: Blob;
  file: File;
  filename: string;
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
  const paidNum = toNum(effectiveRent.paidAmount);

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
      const downloadPromise = (async () => {
        const { dataUrl, filename } = preparedNotice ?? (await generateNoticeImage());
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
        return filename;
      })();

      toast.promise(downloadPromise, {
        loading: isEn ? 'Generating notice image...' : 'নোটিশ ইমেজ প্রস্তুত করা হচ্ছে...',
        success: isEn
          ? 'Rent notice downloaded. Attach the image in WhatsApp if needed.'
          : 'ভাড়ার নোটিশ ডাউনলোড হয়েছে। হোয়াটসঅ্যাপে প্রয়োজন অনুযায়ী ছবিটি যুক্ত করে দিন।',
        error: isEn ? 'Failed to download notice' : 'নোটিশ ডাউনলোড করতে ব্যর্থ হয়েছে',
      });

      await downloadPromise;
    } catch (error) {
      console.error('Failed to export notice image:', error);
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
   * Opens the tenant WhatsApp chat via wa.me deep-link with prefilled notice text.
   * On mobile: WhatsApp app opens directly to the tenant's chat.
   * On desktop: WhatsApp Web opens to the tenant's chat.
   * Gracefully handles missing or unformatted phone numbers.
   */
  const handleSendToWhatsApp = () => {
    const messageText = buildMessageText();
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
        toast.warning(
          isEn
            ? 'Tenant has no phone number recorded. Opening WhatsApp contact selector...'
            : 'ভাড়াটিয়ার ফোন নম্বর নেই। কন্টাক্ট নির্বাচন করতে হোয়াটসঅ্যাপ খোলা হচ্ছে...'
        );
      }
    }
  };

  /**
   * Combined "Share Notice" flow:
   * 1. If the notice image was pre-generated and native sharing is available, open the native share sheet.
   * 2. If native sharing is unavailable or fails (non-abort), fall back to the text-only wa.me deep link.
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
    if (!hasValidPhone) {
      return isEn ? 'Choose WhatsApp Contact' : 'কন্টাক্ট নির্বাচন করুন';
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
                  <RentDocument
                    ref={setNoticeNode}
                    mode="notice"
                    noticeId={effectiveRent.id}
                    createdAt={effectiveRent.createdAt}
                    month={effectiveRent.month}
                    year={effectiveRent.year}
                    dueDate={effectiveRent.dueDate}
                    property={property}
                    unit={unit}
                    tenantName={tenantName}
                    tenantPhone={rawPhone}
                    owner={owner}
                    signatureUrl={signatureUrl}
                    language={language}
                    baseRent={effectiveRent.rent}
                    serviceFee={toNum(effectiveRent.serviceFee)}
                    parkingFee={toNum(effectiveRent.parkingFee)}
                    extraCharge={toNum(effectiveRent.extraCharge)}
                    lateFee={toNum(effectiveRent.lateFee)}
                    discount={toNum(effectiveRent.discount)}
                    totalAmount={effectiveRent.totalAmount}
                    paidAmount={paidNum}
                    remainingAmount={effectiveRent.remainingAmount}
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
              ? 'Due to browser security restrictions, WhatsApp Web cannot automatically attach files. Download the notice image and drag or attach it into the opened chat.'
              : 'ব্রাউজার সিকিউরিটির কারণে ওয়েব ব্রাউজার স্বয়ংক্রিয়ভাবে হোয়াটসঅ্যাপে ফাইল যুক্ত করতে পারে না। নোটিশটি ডাউনলোড করে হোয়াটসঅ্যাপ চ্যাটে ড্র্যাগ বা অ্যাটাচ করুন।'}
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