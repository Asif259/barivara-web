import assert from 'node:assert';
import {
  validateAndNormalizePhone,
  formatWhatsAppPhone,
  translatePaymentMethod,
  buildReceiptWhatsAppText,
  buildNoticeWhatsAppText,
  getWhatsAppShareUrl,
} from './whatsapp-receipt';

console.log('🧪 Starting WhatsApp sharing audit & verification tests...\n');

// -------------------------------------------------------------
// Test Suite 1: Phone Normalization & Validation
// -------------------------------------------------------------
console.log('Test Suite 1: Phone Normalization & Validation');

// 1.1 Local Bangladesh mobile (11 digits: 01[3-9]XXXXXXXX)
const localBD = validateAndNormalizePhone('01712345678');
assert.strictEqual(localBD.isValid, true);
assert.strictEqual(localBD.normalizedPhone, '8801712345678');
assert.strictEqual(formatWhatsAppPhone('01712345678'), '8801712345678');
assert.strictEqual(formatWhatsAppPhone('invalid-num'), '');

// 1.2 BD mobile with international prefix and plus
const intlPlusBD = validateAndNormalizePhone('+8801712345678');
assert.strictEqual(intlPlusBD.isValid, true);
assert.strictEqual(intlPlusBD.normalizedPhone, '8801712345678');

// 1.3 BD mobile with international prefix without plus
const intlBD = validateAndNormalizePhone('8801812345678');
assert.strictEqual(intlBD.isValid, true);
assert.strictEqual(intlBD.normalizedPhone, '8801812345678');

// 1.4 BD mobile with leading double zero
const doubleZeroBD = validateAndNormalizePhone('008801912345678');
assert.strictEqual(doubleZeroBD.isValid, true);
assert.strictEqual(doubleZeroBD.normalizedPhone, '8801912345678');

// 1.5 Formatting characters: spaces, hyphens, parentheses
const formattedBD = validateAndNormalizePhone('+88 (017) 12-345-678');
assert.strictEqual(formattedBD.isValid, true);
assert.strictEqual(formattedBD.normalizedPhone, '8801712345678');

// 1.6 Bengali numerals
const bengaliBD = validateAndNormalizePhone('০১৭১২৩৪৫৬৭৮');
assert.strictEqual(bengaliBD.isValid, true);
assert.strictEqual(bengaliBD.normalizedPhone, '8801712345678');

// 1.7 International non-BD number (e.g. US +1 415 555 2671)
const usPhone = validateAndNormalizePhone('+1 (415) 555-2671');
assert.strictEqual(usPhone.isValid, true);
assert.strictEqual(usPhone.normalizedPhone, '14155552671');

// 1.8 Invalid & missing numbers
const emptyPhone = validateAndNormalizePhone('');
assert.strictEqual(emptyPhone.isValid, false);
assert.strictEqual(emptyPhone.normalizedPhone, '');

const nullPhone = validateAndNormalizePhone(null);
assert.strictEqual(nullPhone.isValid, false);
assert.strictEqual(nullPhone.normalizedPhone, '');

const invalidPhone = validateAndNormalizePhone('012345');
assert.strictEqual(invalidPhone.isValid, false);
assert.strictEqual(invalidPhone.normalizedPhone, '');

const alphaPhone = validateAndNormalizePhone('not-a-phone');
assert.strictEqual(alphaPhone.isValid, false);
assert.strictEqual(alphaPhone.normalizedPhone, '');

console.log('✅ Phone validation & normalization passed all 10 edge-cases.');

// -------------------------------------------------------------
// Test Suite 2: Payment Method Translation
// -------------------------------------------------------------
console.log('\nTest Suite 2: Payment Method Translation');
assert.strictEqual(translatePaymentMethod('BKASH', true), 'bKash');
assert.strictEqual(translatePaymentMethod('BKASH', false), 'বিকাশ (bKash)');
assert.strictEqual(translatePaymentMethod('CASH', true), 'Cash');
assert.strictEqual(translatePaymentMethod('CASH', false), 'ক্যাশ (নগদ)');
assert.strictEqual(translatePaymentMethod('NAGAD', true), 'Nagad');
assert.strictEqual(translatePaymentMethod('NAGAD', false), 'নগদ (Nagad)');
assert.strictEqual(translatePaymentMethod('BANK', true), 'Bank Transfer');
assert.strictEqual(translatePaymentMethod('BANK_TRANSFER', false), 'ব্যাংক ট্রান্সফার');
console.log('✅ Payment method translations verified.');

// -------------------------------------------------------------
// Test Suite 3: Workflow 1 & 2 - Rent Notice WhatsApp Message
// -------------------------------------------------------------
console.log('\nTest Suite 3: Workflow 1 & 2 (Rent Notice WhatsApp Message)');

const noticeEn = buildNoticeWhatsAppText({
  tenantName: 'Rahim Ahmed',
  unitNumber: 'Flat 4B',
  propertyName: 'Green Villa',
  month: 10,
  year: 2026,
  totalAmount: 25000,
  paidAmount: 5000,
  remainingAmount: 20000,
  dueDate: '2026-10-10T00:00:00.000Z',
  isEn: true,
});

assert.match(noticeEn, /BariVara Rent Payment Notice \/ Request/);
assert.match(noticeEn, /Tenant: Rahim Ahmed/);
assert.match(noticeEn, /Unit: Flat 4B \(Green Villa\)/);
assert.match(noticeEn, /Rent Month: October 2026/);
assert.match(noticeEn, /Total Rent: ৳25,000/);
assert.match(noticeEn, /Paid: ৳5,000/);
assert.match(noticeEn, /Outstanding Due: ৳20,000/);
assert.match(noticeEn, /Payment Due Date: 10 October 2026/);

const noticeBn = buildNoticeWhatsAppText({
  tenantName: 'মোঃ রাকিব হাসান',
  unitNumber: '৪বি',
  propertyName: 'সবুজ ভিলা',
  month: 10,
  year: 2026,
  totalAmount: 25000,
  paidAmount: 0,
  remainingAmount: 25000,
  dueDate: '2026-10-10T00:00:00.000Z',
  isEn: false,
});

assert.match(noticeBn, /ভাড়া পরিশোধের অনুরোধ \/ বাড়িভাড়া নোটিশ/);
assert.match(noticeBn, /ভাড়াটিয়া: মোঃ রাকিব হাসান/);
assert.match(noticeBn, /ফ্ল্যাট: ৪বি \(সবুজ ভিলা\)/);
assert.match(noticeBn, /ভাড়ার মাস: অক্টোবর ২০২৬/);
assert.match(noticeBn, /মোট ভাড়া: ৳২৫,০০০/);
assert.match(noticeBn, /বর্তমান বকেয়া: ৳২৫,০০০/);
assert.match(noticeBn, /পরিশোধের শেষ তারিখ: ১০ অক্টোবর, ২০২৬|পরিশোধের শেষ তারিখ: ১০ অক্টোবর ২০২৬/);

console.log('✅ Rent notice message templates verified in English & Bangla.');

// -------------------------------------------------------------
// Test Suite 4: Workflow 3 - Payment Receipt WhatsApp Message
// -------------------------------------------------------------
console.log('\nTest Suite 4: Workflow 3 (Payment Receipt WhatsApp Message)');

const receiptEn = buildReceiptWhatsAppText({
  tenantName: 'Rahim Ahmed',
  unitNumber: 'Flat 4B',
  propertyName: 'Green Villa',
  month: 10,
  year: 2026,
  amount: 25500,
  receiptId: '6ED6FEF3',
  paymentDate: '2026-10-25T12:00:00.000Z',
  paymentMethod: 'BKASH',
  transactionId: 'BKASH-TX-987123',
  remainingAmount: 0,
  isEn: true,
});

assert.match(receiptEn, /BariVara Rent Payment Receipt/);
assert.match(receiptEn, /Tenant: Rahim Ahmed/);
assert.match(receiptEn, /Unit: Flat 4B \(Green Villa\)/);
assert.match(receiptEn, /Receipt No: #6ED6FEF3/);
assert.match(receiptEn, /Rent Month: October 2026/);
assert.match(receiptEn, /Amount Paid: ৳25,500/);
assert.match(receiptEn, /Payment Date: 25 October 2026/);
assert.match(receiptEn, /Payment Method: bKash/);
assert.match(receiptEn, /Transaction ID: BKASH-TX-987123/);
assert.match(receiptEn, /Thank you for your payment\./);

// Verify partial payment with remaining balance
const receiptPartialEn = buildReceiptWhatsAppText({
  tenantName: 'Rahim Ahmed',
  unitNumber: 'Flat 4B',
  propertyName: 'Green Villa',
  month: 10,
  year: 2026,
  amount: 15000,
  receiptId: '7FA12C44',
  paymentDate: '2026-10-25T12:00:00.000Z',
  paymentMethod: 'CASH',
  remainingAmount: 10500,
  isEn: true,
});
assert.match(receiptPartialEn, /Remaining Due: ৳10,500/);

const receiptBn = buildReceiptWhatsAppText({
  tenantName: 'মোঃ রাকিব হাসান',
  unitNumber: '৪বি',
  propertyName: 'সবুজ ভিলা',
  month: 10,
  year: 2026,
  amount: 25500,
  receiptId: '6ED6FEF3',
  paymentDate: '2026-10-25T12:00:00.000Z',
  paymentMethod: 'BKASH',
  transactionId: 'BKASH-TX-987123',
  remainingAmount: 0,
  isEn: false,
});

assert.match(receiptBn, /বাড়িভাড়া — মানি রিসিট \(পেমেন্ট নিশ্চিতকরণ\)/);
assert.match(receiptBn, /ভাড়াটিয়া: মোঃ রাকিব হাসান/);
assert.match(receiptBn, /ফ্ল্যাট: ৪বি \(সবুজ ভিলা\)/);
assert.match(receiptBn, /রশিদ নং: #6ED6FEF3/);
assert.match(receiptBn, /ভাড়ার মাস: অক্টোবর ২০২৬/);
assert.match(receiptBn, /পরিশোধিত পরিমাণ: ৳২৫,৫০০/);
assert.match(receiptBn, /পরিশোধের তারিখ: ২৫ অক্টোবর ২০২৬/);
assert.match(receiptBn, /পেমেন্ট মাধ্যম: বিকাশ \(bKash\)/);
assert.match(receiptBn, /ট্রানজেকশন আইডি: BKASH-TX-987123/);
assert.match(receiptBn, /সময়মত ভাড়া পরিশোধের জন্য ধন্যবাদ।/);

console.log('✅ Payment receipt message templates verified in English & Bangla with full fields.');

// -------------------------------------------------------------
// Test Suite 5: Deep Link Formatting & URL Encoding
// -------------------------------------------------------------
console.log('\nTest Suite 5: Deep Link Formatting & URL Encoding');

const urlWithPhone = getWhatsAppShareUrl('01712345678', receiptEn);
assert.ok(urlWithPhone.startsWith('https://wa.me/8801712345678?text='));
assert.ok(!urlWithPhone.includes('+8801712345678'));
assert.ok(!urlWithPhone.includes(' ')); // All spaces must be URL-encoded (%20)
assert.ok(urlWithPhone.includes(encodeURIComponent('BariVara Rent Payment Receipt')));
assert.ok(urlWithPhone.includes(encodeURIComponent('Receipt No: #6ED6FEF3')));
assert.ok(urlWithPhone.includes(encodeURIComponent('Amount Paid: ৳25,500')));

const urlWithoutPhone = getWhatsAppShareUrl(null, noticeEn);
assert.ok(urlWithoutPhone.startsWith('https://wa.me/?text='));
assert.ok(urlWithoutPhone.includes(encodeURIComponent('Tenant: Rahim Ahmed')));

console.log('✅ Deep link URL structure and URL encoding verified.');

console.log('\n🎉 ALL 5 TEST SUITES PASSED SUCCESSFULLY!');
