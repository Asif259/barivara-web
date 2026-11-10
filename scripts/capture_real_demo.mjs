import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/demo');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const mockProperties = {
  success: true,
  data: [
    {
      id: 'prop-1',
      name: 'ধানমন্ডি লেকভিউ রেসিডেন্স',
      address: 'রোড ৮/এ, ধানমন্ডি, ঢাকা ১২০৯',
      propertyType: 'RESIDENTIAL',
      totalFloors: 6,
      totalUnits: 8,
      createdAt: '2024-01-15T00:00:00Z',
      owner: {
        id: 'owner-1',
        name: 'প্রকৌশলী রফিকুল ইসলাম',
        phone: '+880 1700-000000',
      },
    },
    {
      id: 'prop-2',
      name: 'গুলশান গ্রেস অ্যাপার্টমেন্টস',
      address: 'রোড ৪৫, গুলশান-২, ঢাকা ১২১২',
      propertyType: 'RESIDENTIAL',
      totalFloors: 5,
      totalUnits: 6,
      createdAt: '2024-02-10T00:00:00Z',
      owner: {
        id: 'owner-1',
        name: 'প্রকৌশলী রফিকুল ইসলাম',
        phone: '+880 1700-000000',
      },
    },
  ],
};

const mockTenants = {
  success: true,
  data: [
    {
      id: 'ten-1',
      name: 'মো: কামরুল হাসান',
      phone: '+880 1711-234567',
      email: 'kamrul.hasan@gmail.com',
      nidNumber: '19882692015000123',
      permanentAddress: 'গ্রাম: রামপুর, ডাকঘর: কুমিল্লা সদর, কুমিল্লা',
      emergencyContactName: 'আবুল কালাম (পিতা)',
      emergencyContactPhone: '+880 1819-112233',
      occupation: 'সফটওয়্যার ইঞ্জিনিয়ার (Lead Architect)',
      isActive: true,
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z',
      agreements: [
        {
          id: 'agr-1',
          unitId: 'unit-4a',
          monthlyRent: 28000,
          serviceFee: 4000,
          parkingFee: 0,
          extraCharge: 0,
          dueDay: 10,
          securityDeposit: 60000,
          startDate: '2024-06-01T00:00:00Z',
          status: 'ACTIVE',
          unit: {
            id: 'unit-4a',
            unitNumber: '৪/এ (4th Floor)',
            property: mockProperties.data[0],
          },
        },
      ],
    },
    {
      id: 'ten-2',
      name: 'তানভীর আহমেদ',
      phone: '+880 1819-876543',
      email: 'tanvir.ahmed@bank.com.bd',
      nidNumber: '19901592015000456',
      permanentAddress: 'ফেনী সদর, ফেনী',
      emergencyContactName: 'রেহানা পারভীন (স্ত্রী)',
      emergencyContactPhone: '+880 1912-998877',
      occupation: 'ব্যাংক কর্মকর্তা (Senior Principal Officer)',
      isActive: true,
      createdAt: '2024-08-01T00:00:00Z',
      updatedAt: '2024-08-01T00:00:00Z',
      agreements: [
        {
          id: 'agr-2',
          unitId: 'unit-2b',
          monthlyRent: 22000,
          serviceFee: 3000,
          parkingFee: 0,
          extraCharge: 0,
          dueDay: 7,
          securityDeposit: 50000,
          startDate: '2024-08-01T00:00:00Z',
          status: 'ACTIVE',
          unit: {
            id: 'unit-2b',
            unitNumber: '২/বি (2nd Floor)',
            property: mockProperties.data[0],
          },
        },
      ],
    },
    {
      id: 'ten-3',
      name: 'ড. নাসরিন সুলতানা',
      phone: '+880 1911-334455',
      email: 'dr.nasrin@bsmmu.edu.bd',
      nidNumber: '19822692015000789',
      permanentAddress: 'উপশহর, সিলেট',
      emergencyContactName: 'প্রফেসর ডা. এম এ রশিদ (স্বামী)',
      emergencyContactPhone: '+880 1713-445566',
      occupation: 'সহযোগী অধ্যাপক, বিএসএমএমইউ',
      isActive: true,
      createdAt: '2024-03-01T00:00:00Z',
      updatedAt: '2024-03-01T00:00:00Z',
      agreements: [
        {
          id: 'agr-3',
          unitId: 'unit-5c',
          monthlyRent: 35000,
          serviceFee: 5000,
          parkingFee: 2000,
          extraCharge: 0,
          dueDay: 5,
          securityDeposit: 80000,
          startDate: '2024-03-01T00:00:00Z',
          status: 'ACTIVE',
          unit: {
            id: 'unit-5c',
            unitNumber: '৫/সি (5th Floor)',
            property: mockProperties.data[1],
          },
        },
      ],
    },
  ],
};

const mockPaymentItem = {
  id: 'pay-101',
  monthlyRentId: 'rent-101',
  amount: 32000,
  paymentMethod: 'BKASH',
  transactionId: '9J48KL2X1P',
  paymentDate: '2026-11-05T14:30:00Z',
  receivedBy: 'প্রকৌশলী রফিকুল ইসলাম',
  note: 'বিকাশ পেমেন্ট (সম্পূর্ণ পরিশোধ)',
  status: 'COMPLETED',
  createdAt: '2026-11-05T14:30:00Z',
  updatedAt: '2026-11-05T14:30:00Z',
  monthlyRent: {
    id: 'rent-101',
    month: 11,
    year: 2026,
    rent: 28000,
    serviceFee: 4000,
    parkingFee: 0,
    extraCharge: 0,
    lateFee: 0,
    discount: 0,
    totalAmount: 32000,
    paidAmount: 32000,
    remainingAmount: 0,
    dueDate: '2026-11-10T00:00:00Z',
    paidDate: '2026-11-05T00:00:00Z',
    status: 'PAID',
    agreement: {
      id: 'agr-1',
      tenantId: 'ten-1',
      unitId: 'unit-4a',
      monthlyRent: 28000,
      serviceFee: 4000,
      tenant: mockTenants.data[0],
      unit: {
        id: 'unit-4a',
        unitNumber: '৪/এ (4th Floor)',
        property: mockProperties.data[0],
      },
    },
  },
  owner: {
    name: 'প্রকৌশলী রফিকুল ইসলাম',
    phone: '+880 1700-000000',
  },
};

const mockPaymentItem2 = {
  id: 'pay-102',
  monthlyRentId: 'rent-102',
  amount: 25000,
  paymentMethod: 'NAGAD',
  transactionId: '7K29MN5Y8Q',
  paymentDate: '2026-11-06T11:20:00Z',
  receivedBy: 'প্রকৌশলী রফিকুল ইসলাম',
  note: 'নগদ পেমেন্ট (ভাড়া + পানি ও গ্যাস)',
  status: 'COMPLETED',
  createdAt: '2026-11-06T11:20:00Z',
  updatedAt: '2026-11-06T11:20:00Z',
  monthlyRent: {
    id: 'rent-102',
    month: 11,
    year: 2026,
    rent: 22000,
    serviceFee: 3000,
    totalAmount: 25000,
    paidAmount: 25000,
    remainingAmount: 0,
    dueDate: '2026-11-07T00:00:00Z',
    paidDate: '2026-11-06T00:00:00Z',
    status: 'PAID',
    agreement: {
      id: 'agr-2',
      tenantId: 'ten-2',
      unitId: 'unit-2b',
      monthlyRent: 22000,
      serviceFee: 3000,
      tenant: mockTenants.data[1],
      unit: {
        id: 'unit-2b',
        unitNumber: '২/বি (2nd Floor)',
        property: mockProperties.data[0],
      },
    },
  },
  owner: {
    name: 'প্রকৌশলী রফিকুল ইসলাম',
    phone: '+880 1700-000000',
  },
};

const mockPaymentItem3 = {
  id: 'pay-103',
  monthlyRentId: 'rent-103',
  amount: 42000,
  paymentMethod: 'BANK',
  transactionId: 'BRAC-TX-8839201',
  paymentDate: '2026-11-04T10:15:00Z',
  receivedBy: 'প্রকৌশলী রফিকুল ইসলাম',
  note: 'ব্র্যাক ব্যাংক অনলাইন ট্রান্সফার',
  status: 'COMPLETED',
  createdAt: '2026-11-04T10:15:00Z',
  updatedAt: '2026-11-04T10:15:00Z',
  monthlyRent: {
    id: 'rent-103',
    month: 11,
    year: 2026,
    rent: 35000,
    serviceFee: 5000,
    parkingFee: 2000,
    totalAmount: 42000,
    paidAmount: 42000,
    remainingAmount: 0,
    dueDate: '2026-11-05T00:00:00Z',
    paidDate: '2026-11-04T00:00:00Z',
    status: 'PAID',
    agreement: {
      id: 'agr-3',
      tenantId: 'ten-3',
      unitId: 'unit-5c',
      monthlyRent: 35000,
      serviceFee: 5000,
      parkingFee: 2000,
      tenant: mockTenants.data[2],
      unit: {
        id: 'unit-5c',
        unitNumber: '৫/সি (5th Floor)',
        property: mockProperties.data[1],
      },
    },
  },
  owner: {
    name: 'প্রকৌশলী রফিকুল ইসলাম',
    phone: '+880 1700-000000',
  },
};

const mockMonthlyRents = {
  success: true,
  data: [
    mockPaymentItem.monthlyRent,
    mockPaymentItem2.monthlyRent,
    mockPaymentItem3.monthlyRent,
  ],
};

const mockExpenses = {
  success: true,
  data: [
    {
      id: 'exp-1',
      propertyId: 'prop-1',
      category: 'MAINTENANCE',
      amount: 14500,
      description: 'বিল্ডিংয়ের পানির মেইন মোটর সার্ভিসিং ও নতুন ক্যাবল সংযোগ',
      date: '2026-11-03T00:00:00Z',
      paymentMethod: 'CASH',
      paidTo: 'মেসার্স রহমান ইলেকট্রনিক্স',
      property: mockProperties.data[0],
    },
    {
      id: 'exp-2',
      propertyId: 'prop-1',
      category: 'STAFF_SALARY',
      amount: 18000,
      description: 'অক্টোবর মাসের সিকিউরিটি গার্ড ও কেয়ারটেকার বেতন',
      date: '2026-11-01T00:00:00Z',
      paymentMethod: 'BANK',
      paidTo: 'মো: রফিকুল (কেয়ারটেকার)',
      property: mockProperties.data[0],
    },
    {
      id: 'exp-3',
      propertyId: 'prop-2',
      category: 'UTILITY_BILL',
      amount: 8500,
      description: 'কমন স্পেস লিফট ও জেনারেটর ডিজেল ক্রয় (২০০ লিটার)',
      date: '2026-11-04T00:00:00Z',
      paymentMethod: 'BKASH',
      paidTo: 'পদ্মা ফুয়েল পাম্প',
      property: mockProperties.data[1],
    },
    {
      id: 'exp-4',
      propertyId: 'prop-2',
      category: 'REPAIR',
      amount: 6200,
      description: '৩য় তলার করিডোর এবং সিড়ির এলইডি লাইট প্রতিস্থাপন',
      date: '2026-11-07T00:00:00Z',
      paymentMethod: 'CASH',
      paidTo: 'ইকবাল ইলেকট্রিক',
      property: mockProperties.data[1],
    },
  ],
};

async function captureAll() {
  console.log('Launching browser with Chrome for clean product captures...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (!url.includes('/api/v1/')) {
      req.continue();
      return;
    }

    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': '*',
    };

    if (url.includes('/dashboard/overview')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: {
            totalProperties: 2,
            totalUnits: 14,
            occupiedUnits: 13,
            vacantUnits: 1,
            occupancyRate: 92.8,
            totalTenants: 13,
            currentMonth: {
              year: 2026,
              month: 11,
              expected: 345000,
              collected: 285000,
              outstanding: 60000,
              collectionRate: 82.6,
              paidCount: 10,
              partialCount: 2,
              pendingCount: 1,
              overdueCount: 1,
            },
          },
        }),
      });
    } else if (url.includes('/properties')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(mockProperties),
      });
    } else if (url.includes('/tenants')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(mockTenants),
      });
    } else if (url.includes('/payments/pay-101')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: mockPaymentItem }),
      });
    } else if (url.includes('/payments')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: [mockPaymentItem, mockPaymentItem2, mockPaymentItem3],
        }),
      });
    } else if (url.includes('/expenses')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(mockExpenses),
      });
    } else if (url.includes('/monthly-rents')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify(mockMonthlyRents),
      });
    } else if (url.includes('/auth/refresh')) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          data: { accessToken: 'valid-token', refreshToken: 'valid-token' },
        }),
      });
    } else {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: corsHeaders,
        body: JSON.stringify({ success: true, data: [] }),
      });
    }
  });

  // Seed authentication and Bengali language
  await page.goto('http://localhost:3000/dashboard');
  await page.evaluate(() => {
    localStorage.setItem(
      'barivara-auth',
      JSON.stringify({
        state: {
          user: {
            id: 'owner-1',
            name: 'প্রকৌশলী রফিকুল ইসলাম',
            email: 'rafiqul@barivara.com',
            role: 'OWNER',
            phone: '+880 1700-000000',
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'valid-token',
          isAuthenticated: true,
          _hasHydrated: true,
        },
        version: 0,
      })
    );
    localStorage.setItem(
      'barivara-language',
      JSON.stringify({
        state: { language: 'bn' },
        version: 0,
      })
    );
  });

  // 1. Dashboard Overview (/dashboard)
  console.log('Capturing Dashboard Overview (/dashboard)...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, 'demo-dashboard.png') });

  // 2. Tenants Directory (/tenants)
  console.log('Capturing Tenants Directory (/tenants)...');
  await page.goto('http://localhost:3000/tenants', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, 'demo-tenants.png') });

  // 3. Payments Ledger (/payments)
  console.log('Capturing Payments Ledger (/payments)...');
  await page.goto('http://localhost:3000/payments', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, 'demo-payments.png') });

  // 4. Expenses Khata (/expenses)
  console.log('Capturing Expenses Khata (/expenses)...');
  await page.goto('http://localhost:3000/expenses', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, 'demo-expenses.png') });

  // 5. Rents Ledger (/rents)
  console.log('Capturing Rents Ledger (/rents)...');
  await page.goto('http://localhost:3000/rents', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outDir, 'demo-rents.png') });

  // 6. Open Money Receipt / WhatsApp Dialog on /payments
  console.log('Opening Money Receipt / WhatsApp Dialog on /payments...');
  await page.goto('http://localhost:3000/payments', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  const btns = await page.$$('button');
  for (const b of btns) {
    const text = await page.evaluate((el) => el.innerText, b);
    if (text && (text.includes('রিসিট') || text.includes('রশিদ') || text.includes('Receipt'))) {
      console.log('Clicking receipt button:', text);
      await b.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 2000));
  const dialog = await page.$('[role="dialog"]');
  if (dialog) {
    await page.screenshot({ path: path.join(outDir, 'demo-receipt-dialog.png') });
    console.log('Captured demo-receipt-dialog.png with opened modal!');
  } else {
    console.warn('Dialog role not detected, falling back to page screenshot');
    await page.screenshot({ path: path.join(outDir, 'demo-receipt-dialog.png') });
  }

  console.log('All authentic demo screenshots captured successfully into public/demo/ !');
  await browser.close();
}

captureAll().catch(console.error);
