/**
 * Complete bilingual copy for the BariVara landing page.
 * Every visible string on "/" comes from this file.
 *
 * Rules baked into this copy:
 * - Only product facts that already exist in BariVara are stated as live.
 * - bKash/Nagad gateway settlement and automated reminders are always
 *   labelled "Coming soon" / "আসছে".
 * - No invented customers, ratings, awards, prices or usage statistics.
 */

const bn = {
  meta: {
    title: 'বাড়িভাড়া (BariVara) — বাড়িওয়ালাদের জন্য বাংলা-প্রথম ভাড়া ব্যবস্থাপনা',
    description:
      'একাধিক বাড়ি ও ইউনিট, ভাড়াটিয়ার প্রোফাইল, ভাড়া চুক্তি, অটোমেটিক মাসিক বিল, পেমেন্ট, প্রিন্ট-রেডি A4 রসিদ, হোয়াটসঅ্যাপ মেসেজ আর খরচের হিসাব—সব এক জায়গায়, বাংলায়।',
    siteName: 'বাড়িভাড়া (BariVara)',
    ogAlt: 'বাড়িভাড়া — বাংলা-প্রথম বাড়ি ও ভাড়া ব্যবস্থাপনা',
  },

  common: {
    appName: 'বাড়িভাড়া',
    appLatinName: 'BariVara',
    sampleData: 'নমুনা তথ্য / Sample data',
    sampleDataShort: 'নমুনা তথ্য',
    comingSoon: 'আসছে',
    taka: '৳',
    skipToContent: 'মূল কনটেন্টে যান',
    openMenu: 'মেনু খুলুন',
    closeMenu: 'মেনু বন্ধ করুন',
    switchLanguage: 'ভাষা পরিবর্তন করুন',
    switchToEnglish: 'ইংরেজিতে দেখুন',
    switchToBangla: 'বাংলায় দেখুন',
    login: 'লগ ইন',
    getStarted: 'শুরু করুন',
    register: 'রেজিস্ট্রেশন',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    backToTop: 'উপরে ফিরুন',
    decorativeCanvas: 'তিন-মাত্রিক ভবনের দৃশ্য',
  },

  nav: {
    features: 'ফিচার',
    comparison: 'তুলনা',
    trust: 'সুরক্ষা',
    howItWorks: 'কীভাবে কাজ করে',
    roadmap: 'রোডম্যাপ',
    lightAccount: 'অ্যাকাউন্ট',
  },

  hero: {
    eyebrow: 'বাংলাদেশের বাড়িওয়ালাদের জন্য',
    title: ['কাগজের খাতা থেকে', 'পরিষ্কার ডিজিটাল খতিয়ানে'],
    lead: 'একাধিক বাড়ি, ইউনিট আর ভাড়াটিয়া—সব এক জায়গায়। চুক্তি, মাসিক ভাড়া, পেমেন্ট আর রসিদ, বাংলায়, আপনার নিজের হাতে।',
    primaryCta: 'শুরু করুন',
    secondaryCta: 'লগ ইন',
    support: 'বাংলা-প্রথম · বাংলা / English · প্রিন্ট-রেডি A4 রসিদ',
    scrollHint: 'স্ক্রল করে ভেতরে আসুন',
    posterAlt: 'সন্ধ্যার আলোয় ছয় তলা ভবন, জানালায় ভাড়ার অবস্থা',
    legend: {
      title: 'জানালার আলো',
      paid: 'পরিশোধিত',
      partial: 'আংশিক',
      pending: 'বাকি',
      overdue: 'মেয়াদোত্তীর্ণ',
      vacant: 'খালি',
    },
  },

  comparison: {
    eyebrow: 'তুলনা',
    title: 'কাগজের খাতা বনাম BariVara',
    lead: 'খাতায় খোঁজ লাগে, হিসাব মেলে না, কে কী বদলাল তা থাকে না। এখানে প্রতিটি টাকা আর প্রতিটি চুক্তি থাকে হিসাবের ভেতরে।',
    paperLabel: 'কাগজের খাতা',
    bariLabel: 'BariVara',
    rows: [
      {
        label: 'মাসিক ভাড়া',
        paper: 'মাস শেষে হাতে খুঁজে লিখতে হয়',
        bari: 'প্রতি ইউনিটে অটোমেটিক মাসিক বিল, ডুপ্লিকেট ছাড়া',
      },
      {
        label: 'আংশিক পেমেন্ট',
        paper: 'আলাদা পাতায়, বাকি টাকার হিসাব আলগা',
        bari: 'বাকি টাকাসহ পুরো বা আংশিক পেমেন্ট রেকর্ড',
      },
      {
        label: 'রসিদ ও নোটিশ',
        paper: 'হাতে লিখে সই, বারবার কপি',
        bari: 'সইসহ প্রিন্ট-রেডি A4, ছবি হিসেবেও ডাউনলোড',
      },
      {
        label: 'খরচ',
        paper: 'খাতার পেছনের পাতায় মিশে যায়',
        bari: 'ক্যাটাগরি অনুযায়ী খরচ আর মাসিক রিপোর্ট',
      },
      {
        label: 'পরিবর্তনের হিসাব',
        paper: 'কে কী বদলাল, কে জানে',
        bari: 'প্রতিটি গুরুত্বপূর্ণ পরিবর্তনের অডিট লগ',
      },
    ],
  },

  story: {
    eyebrow: 'ভেতরে একবার',
    hint: 'স্ক্রল করুন',
    chapterLabel: 'অধ্যায়',
    progressLabel: 'গল্পের অধ্যায়',
    goToChapter: 'এই অধ্যায়ে যান',
    chapters: [
      {
        id: 'hero',
        kicker: 'শুরু',
        title: 'কাগজের খাতা থেকে পরিষ্কার ডিজিটাল খতিয়ানে',
        body: 'আপনার বাড়ি, আপনার হিসাব—প্রথম দিন থেকেই গোছানো।',
      },
      {
        id: 'properties',
        kicker: 'প্রপার্টি ও ইউনিট',
        title: 'প্রতিটি তলা, প্রতিটি ইউনিট',
        body: 'ফ্ল্যাট, অ্যাপার্টমেন্ট, রুম, দোকান, অফিস আর পার্কিং—ভাড়া হয়েছে, খালি, রক্ষণাবেক্ষণে বা নিষ্ক্রিয়, সব এক নজরে।',
      },
      {
        id: 'tenants',
        kicker: 'ভাড়াটিয়া ও চুক্তি',
        title: 'ভাড়াটিয়া আর চুক্তি, পাশাপাশি',
        body: 'ফোন, ইমার্জেন্সি কন্টাক্ট, স্থায়ী ঠিকানা, পেশা আর NID—চুক্তির সাথে যুক্ত। একই ইউনিটে দুটি সক্রিয় চুক্তি আর হবে না।',
      },
      {
        id: 'rent',
        kicker: 'মাসিক ভাড়া',
        title: 'মাসের বিল আগেই তৈরি',
        body: 'প্রতি মাসে ভাড়া তৈরি হয়, এক বিল দুবার নয়। ক্যাশ, ব্যাংক, বিকাশ, নগদ, রকেট বা কার্ডে পেমেন্ট নিন—আপনি লিখবেন শুধু ট্রানজেকশন আইডি।',
      },
      {
        id: 'receipts',
        kicker: 'রসিদ ও হোয়াটসঅ্যাপ',
        title: 'রসিদ প্রিন্ট করুন, হোয়াটসঅ্যাপে পাঠান',
        body: 'সইসহ A4 ভাড়া নোটিশ আর টাকার রসিদ, ছবি হিসেবেও নামানো যায়। যাচাই করা বাংলাদেশি নম্বরে এক ক্লিকে বাংলা বা ইংরেজি মেসেজ।',
      },
      {
        id: 'reports',
        kicker: 'রিপোর্ট',
        title: 'সংখ্যাগুলো এবার মিলবে',
        body: 'কত ইউনিট ভাড়া হয়েছে, প্রত্যাশিত বনাম আদায়, আর খরচের ক্যাটাগরি—মাসিক রিপোর্টে, CSV এক্সপোর্টসহ।',
      },
      {
        id: 'closing',
        kicker: 'শেষ নয়, শুরু',
        title: 'আপনার বাড়ি, আপনার হিসাব, আপনার হাতে',
        body: 'বাংলা-প্রথম। আপনার তথ্য শুধু আপনার। আজই প্রথম বাড়িটা যোগ করুন।',
      },
    ],
  },

  sceneVisuals: {
    unitTags: [
      { name: 'ফ্ল্যাট ৩বি', type: 'ফ্ল্যাট', status: 'ভাড়া হয়েছে', tone: 'occupied' },
      { name: 'দোকান জি১', type: 'দোকান', status: 'ভাড়া হয়েছে', tone: 'occupied' },
      { name: 'পার্কিং ২', type: 'পার্কিং', status: 'খালি', tone: 'vacant' },
    ],
    unitTagNote: '৩টি ইউনিট দেখানো হচ্ছে · মোট ২৪টি',
    tenant: {
      heading: 'ভাড়াটিয়ার প্রোফাইল',
      name: 'রফিকুল ইসলাম',
      role: 'ভাড়াটিয়া',
      phoneLabel: 'মোবাইল',
      phone: '+880 1712-345678',
      emergencyLabel: 'ইমার্জেন্সি কন্টাক্ট',
      emergency: 'নাসরিন আক্তার · 01898-765432',
      addressLabel: 'স্থায়ী ঠিকানা',
      address: 'শিবগঞ্জ, বগুড়া',
      occupationLabel: 'পেশা',
      occupation: 'শিক্ষক',
      nidLabel: 'NID',
      nidValue: 'সামনে ও পেছন আপলোড করা',
      unitLabel: 'ইউনিট',
      unit: 'ফ্ল্যাট ৩বি · ৩য় তলা',
    },
    agreement: {
      heading: 'ভাড়া চুক্তি',
      status: 'সক্রিয়',
      rentLabel: 'মাসিক ভাড়া',
      rent: '৳১২,০০০',
      serviceLabel: 'সার্ভিস চার্জ',
      service: '৳৮০০',
      parkingLabel: 'পার্কিং',
      parking: '৳৫০০',
      depositLabel: 'অগ্রিম জমা',
      deposit: '৳২৪,০০০',
      periodLabel: 'মেয়াদ',
      period: '০১ জানুয়ারি ২০২৬ – ৩১ ডিসেম্বর ২০২৬',
      unitLabel: 'ইউনিট',
      unit: 'ফ্ল্যাট ৩বি',
      note: 'একই ইউনিটে আরেকটি সক্রিয় চুক্তি তৈরি করা যায় না।',
    },
    rent: {
      heading: 'জানুয়ারি ২০২৬',
      subheading: 'মাসিক ভাড়া তালিকা',
      columns: { unit: 'ইউনিট', amount: 'বিল', status: 'অবস্থা' },
      rows: [
        { unit: 'ফ্ল্যাট ১এ', amount: '৳১২,০০০', status: 'পরিশোধিত', tone: 'paid' },
        { unit: 'ফ্ল্যাট ২বি', amount: '৳৮,০০০ / ৳১৩,০০০', status: 'আংশিক', tone: 'partial' },
        { unit: 'ফ্ল্যাট ৩বি', amount: '৳১৩,৩০০', status: 'বাকি', tone: 'pending' },
        { unit: 'দোকান জি১', amount: '৳১৮,০০০', status: 'মেয়াদোত্তীর্ণ', tone: 'overdue' },
      ],
      balanceNote: 'ফ্ল্যাট ২বি · বাকি ৳৫,০০০',
      noDuplicate: 'এক মাসে একটির বেশি বিল তৈরি হয় না।',
      methodsLabel: 'পেমেন্টের মাধ্যম',
      methods: ['ক্যাশ', 'ব্যাংক', 'বিকাশ', 'নগদ', 'রকেট', 'কার্ড'],
      formula: 'ভাড়া + সার্ভিস চার্জ + পার্কিং = মাসিক বিল',
    },
    receipt: {
      heading: 'টাকার রসিদ',
      numberLabel: 'রসিদ নং',
      number: '০০৪২',
      dateLabel: 'তারিখ',
      date: '০৫ জানুয়ারি ২০২৬',
      fromLabel: 'গ্রহণ করা হয়েছে',
      from: 'রফিকুল ইসলাম',
      amountLabel: 'পরিমাণ',
      amount: '৳১২,০০০',
      inWords: 'বারো হাজার টাকা মাত্র',
      forLabel: 'বাবদ',
      forValue: 'জানুয়ারি ২০২৬ মাসের ভাড়া',
      methodLabel: 'মাধ্যম',
      method: 'বিকাশ · TrxID 8N7K2Q1LP',
      signature: 'বাড়িওয়ালার সই',
      printNote: 'প্রিন্ট-রেডি A4 · ছবি ডাউনলোড',
      whatsappLabel: 'হোয়াটসঅ্যাপ',
      whatsappTime: 'দুপুর ২:১৪',
      whatsappMessage:
        'আসসালামু আলাইকুম। জানুয়ারি ২০২৬ মাসের ভাড়া ৳১২,০০০ পেয়েছি। রসিদ সংযুক্ত করলাম। ধন্যবাদ।',
    },



    reports: {
      heading: 'এই মাসের ছবি',
      occupancyLabel: 'ভাড়া হয়েছে',
      occupancyValue: '৭৫%',
      occupancyDetail: '২৪টি ইউনিটের মধ্যে ১৮টি',
      expectedLabel: 'প্রত্যাশিত',
      expectedValue: '৳১,৮৬,০০০',
      collectedLabel: 'আদায়',
      collectedValue: '৳১,৫২,৫০০',
      outstandingLabel: 'বাকি',
      outstandingValue: '৳৩৩,৫০০',
      expenseLabel: 'খরচের ক্যাটাগরি',
      expenses: [
        { label: 'বিদ্যুৎ', value: '৳১২,০০০', percent: 52 },
        { label: 'পানি', value: '৳৩,২০০', percent: 14 },
        { label: 'গ্যাস', value: '৳৪,৮০০', percent: 21 },
        { label: 'রক্ষণাবেক্ষণ', value: '৳৮,৪০০', percent: 36 },
        { label: 'বেতন', value: '৳১০,০০০', percent: 43 },
      ],
      csvNote: 'CSV এক্সপোর্ট',
      expenseNote: 'খরচ ক্যাটাগরি অনুযায়ী ট্র্যাক করা হয়।',
    },
    closing: {
      title: 'আজই প্রথম বাড়িটা যোগ করুন',
      body: 'একটা বাড়ি, কয়েকটা ইউনিট—বাকিটা ধীরে ধীরে। খাতা বন্ধ করার দরকার নেই, পাশে একটা পরিষ্কার হিসাব রাখুন।',
      cta: 'শুরু করুন',
      secondary: 'লগ ইন',
    },
  },

  features: {
    eyebrow: 'ফিচার',
    title: 'যা যা আছে, এক জায়গায়',
    lead: 'বাড়ি যোগ করা থেকে রসিদ পাঠানো পর্যন্ত—দৈনন্দিন কাজগুলো একই জায়গায়, বাংলায়।',
    items: [
      {
        icon: 'building',
        title: 'প্রপার্টি ও ইউনিট',
        body: 'একাধিক বাড়ি ও ইউনিট—ফ্ল্যাট, অ্যাপার্টমেন্ট, রুম, দোকান, অফিস, পার্কিং। একসাথে অনেক ইউনিটও তৈরি করা যায়।',
        tag: 'ভাড়া হয়েছে · খালি · রক্ষণাবেক্ষণ · নিষ্ক্রিয়',
      },
      {
        icon: 'users',
        title: 'ভাড়াটিয়ার প্রোফাইল',
        body: 'মোবাইল, ইমার্জেন্সি কন্টাক্ট, স্থায়ী ঠিকানা, পেশা আর NID-র সামনে-পেছনের ছবি, এক প্রোফাইলে।',
        tag: 'NID সামনে ও পেছন',
      },
      {
        icon: 'signature',
        title: 'ভাড়া চুক্তি',
        body: 'প্রতি ইউনিটে মাসিক ভাড়া, সার্ভিস চার্জ, পার্কিং চার্জ, অগ্রিম জমা আর শুরুর-শেষের তারিখ।',
        tag: 'ওভারল্যাপিং চুক্তি আটকানো',
      },
      {
        icon: 'calendar',
        title: 'মাসিক ভাড়া ইঞ্জিন',
        body: 'প্রতি মাসে বিল নিজে থেকেই তৈরি হয়, একই মাসে দুবার নয়। বিলের অবস্থা: বাকি, আংশিক, পরিশোধিত, মেয়াদোত্তীর্ণ।',
        tag: 'ডুপ্লিকেট বিল নেই',
      },
      {
        icon: 'wallet',
        title: 'পেমেন্ট রেকর্ড',
        body: 'পুরো বা আংশিক পেমেন্ট—ক্যাশ, ব্যাংক, বিকাশ, নগদ, রকেট বা কার্ডে। ট্রানজেকশন আইডি আপনার হাতে।',
        tag: 'পেমেন্ট সম্পাদনা হয় না',
      },
      {
        icon: 'receipt',
        title: 'রসিদ ও নোটিশ',
        body: 'বাড়িওয়ালার সইসহ প্রিন্ট-রেডি A4 ভাড়া নোটিশ আর টাকার রসিদ, ছবি হিসেবেও ডাউনলোড।',
        tag: 'A4 · সই · ছবি',
      },
      {
        icon: 'whatsapp',
        title: 'হোয়াটসঅ্যাপ মেসেজ',
        body: 'যাচাই করা বাংলাদেশি নম্বরে এক ক্লিকে বাংলা বা ইংরেজি মেসেজ—রসিদের তথ্যসহ।',
        tag: 'এক ক্লিক, দুই ভাষা',
      },
      {
        icon: 'expenses',
        title: 'খরচ ট্র্যাকিং',
        body: 'বিদ্যুৎ, পানি, গ্যাস, রক্ষণাবেক্ষণ, মেরামত, নিরাপত্তা, পরিচ্ছন্নতা, বেতন, কর আর অন্যান্য—ক্যাটাগরি অনুযায়ী।',
        tag: '১০টি ক্যাটাগরি',
      },
      {
        icon: 'chart',
        title: 'রিপোর্ট',
        body: 'মাসিক আয়-ব্যয়, দখল ও প্রত্যাশিত বনাম আদায়—এক জায়গায়, CSV এক্সপোর্টসহ।',
        tag: 'CSV এক্সপোর্ট',
      },
      {
        icon: 'audit',
        title: 'অডিট লগ',
        body: 'গুরুত্বপূর্ণ কাজের হিসাব থাকে—কে, কখন, কী বদলেছে। পেমেন্টের ভুল শুধরে নেওয়া হয় অডিটেড রিভার্সালে।',
        tag: 'স্বচ্ছ পরিবর্তনের হিসাব',
      },
    ],
  },

  showcase: {
    eyebrow: 'দুই ভাষা, একই হিসাব',
    title: 'যে ভাষায় আপনি হিসাব রাখেন',
    lead: 'পুরো অ্যাপে বাংলা / English টগল। নোটিশ আর রসিদ A4-তে প্রিন্ট করার জন্য তৈরি, সইয়ের জায়গাসহ—চাইলে ছবি হিসেবেও নামান।',
    languageLabel: 'ভাষা',
    points: [
      { title: 'বাংলা-প্রথম', body: 'মেনু, ফর্ম, তালিকা আর রসিদ—সব বাংলায়, দরকারে ইংরেজিতে।' },
      { title: 'প্রিন্ট-রেডি A4', body: 'ভাড়া নোটিশ আর টাকার রসিদ, সঠিক অনুপাতে।' },
      { title: 'বাড়িওয়ালার সই', body: 'সই আপলোড করে রসিদে ব্যবহার করুন।' },
      { title: 'ছবি ডাউনলোড', body: 'প্রিন্ট ছাড়াও রসিদ ছবি হিসেবে পাঠানো যায়।' },
    ],
    notice: {
      heading: 'ভাড়া নোটিশ',
      period: 'জানুয়ারি ২০২৬',
      landlord: 'বাড়িওয়ালা: মোঃ আনোয়ার হোসেন',
      rows: [
        { label: 'ভাড়াটিয়া', value: 'রফিকুল ইসলাম' },
        { label: 'ইউনিট', value: 'ফ্ল্যাট ৩বি' },
        { label: 'মাসিক ভাড়া', value: '৳১২,০০০' },
        { label: 'সার্ভিস চার্জ', value: '৳৮০০' },
        { label: 'পার্কিং', value: '৳৫০০' },
      ],
      totalLabel: 'মোট',
      total: '৳১৩,৩০০',
      dueLabel: 'পরিশোধের শেষ তারিখ',
      due: '১০ জানুয়ারি ২০২৬',
      signature: 'বাড়িওয়ালার সই',
      sampleNotice: 'নমুনা নোটিশ',
    },
  },

  trust: {
    eyebrow: 'সুরক্ষা',
    title: 'হিসাব পরিষ্কার, তথ্যও আপনার',
    lead: 'বাড়িওয়ালার হিসাব হিসেবে যেটা দরকার—গোপনীয়তা, স্বচ্ছতা আর নির্ভুল টাকার অঙ্ক।',
    items: [
      {
        icon: 'lock',
        title: 'প্রত্যেকের তথ্য আলাদা',
        body: 'প্রতিটি বাড়িওয়ালা কেবল নিজের বাড়ি, ভাড়াটিয়া, পেমেন্ট আর খরচ দেখতে পান।',
      },
      {
        icon: 'reversal',
        title: 'পেমেন্ট কখনো সম্পাদনা হয় না',
        body: 'ভুল হলে পুরোনো এন্ট্রি মুছে ফেলা হয় না—অডিটেড রিভার্সাল দিয়ে শুধরে নেওয়া হয়।',
      },
      {
        icon: 'calculator',
        title: 'নিখুঁত টাকার হিসাব',
        body: '৳ হিসাব হয় ডেসিমাল অ্যারিথমেটিকে, ভাসমান সংখ্যার অনুমানে নয়।',
      },
      {
        icon: 'upload',
        title: 'নিরাপদ ফাইল আপলোড',
        body: 'NID ও ডকুমেন্টের ছবি নিরাপদভাবে সংরক্ষিত, শুধু আপনার অ্যাকাউন্টে।',
      },
    ],
    extra: 'ইমেইলে OTP দিয়ে পাসওয়ার্ড পুনরুদ্ধার—অ্যাকাউন্ট ফিরে পাওয়ার সহজ পথ।',
  },

  roadmap: {
    eyebrow: 'পাইপলাইনে',
    title: 'যা এখনো আসছে',
    lead: 'যেগুলো এখনো লাইভ নয়, সেগুলো এখানে স্পষ্ট করে রাখা হলো। লাইভ হলে এখানেই জানানো হবে।',
    items: [
      {
        title: 'bKash / Nagad গেটওয়ে দিয়ে সরাসরি সেটেলমেন্ট',
        body: 'গেটওয়ে থেকে পেমেন্ট স্বয়ংক্রিয়ভাবে মিলিয়ে নেওয়া। এখন পেমেন্ট ম্যানুয়ালি রেকর্ড করা হয়।',
        badge: 'এখনো লাইভ নয়',
      },
      {
        title: 'স্বয়ংক্রিয় SMS ও WhatsApp রিমাইন্ডার',
        body: 'বিল ও মেয়াদের রিমাইন্ডার নিজে থেকে যাবে। এখন WhatsApp মেসেজ এক ক্লিকে ম্যানুয়ালি পাঠানো হয়।',
        badge: 'এখনো লাইভ নয়',
      },
    ],
    footnote: 'রোডম্যাপের কিছুই এখন লাইভ ফিচার হিসেবে দাবি করা হচ্ছে না।',
  },

  howItWorks: {
    eyebrow: 'কীভাবে কাজ করে',
    title: 'চার ধাপে গোছানো শুরু',
    lead: 'প্রথম বাড়িটা যোগ করতে কয়েক মিনিটই যথেষ্ট।',
    steps: [
      {
        title: 'বাড়ি যোগ করুন',
        body: 'বাড়ি, তলা আর ইউনিট তৈরি করুন—একটা একটা করে বা একসাথে অনেকগুলো।',
      },
      {
        title: 'ভাড়াটিয়া ও চুক্তি',
        body: 'ভাড়াটিয়ার প্রোফাইল আর NID যোগ করুন, তারপর শর্তসহ চুক্তি তৈরি করুন।',
      },
      {
        title: 'মাসিক ভাড়া তৈরি',
        body: 'প্রতি মাসের বিল অটোমেটিক তৈরি হয়—এক মাসে একটির বেশি নয়।',
      },
      {
        title: 'আদায় ও রসিদ',
        body: 'পুরো বা আংশিক পেমেন্ট রেকর্ড করুন, তারপর রসিদ প্রিন্ট করুন বা WhatsApp-এ পাঠান।',
      },
    ],
    ctaNote: 'শুরু করতে আগে থেকে কোনো ইউনিট তৈরি করা লাগে না।',
  },

  finalCta: {
    eyebrow: 'শুরু করার সময়',
    title: 'খাতার পাশে একটা পরিষ্কার হিসাব',
    titleAlt: 'আপনার বাড়ি, আপনার হাতে',
    lead: 'একাধিক বাড়ি হোক বা একটাই—ভাড়া, চুক্তি, পেমেন্ট আর রসিদ এক জায়গায় রাখুন। বাংলায়।',
    primary: 'শুরু করুন',
    secondary: 'লগ ইন',
    note: 'আপনার তথ্য শুধু আপনার অ্যাকাউন্টে দেখা যাবে।',
  },

  footer: {
    tagline: 'বাংলা-প্রথম বাড়ি ও ভাড়া ব্যবস্থাপনা—বাংলাদেশের বাড়িওয়ালাদের জন্য।',
    productLabel: 'প্ল্যাটফর্ম',
    accountLabel: 'অ্যাকাউন্ট',
    links: {
      features: 'ফিচার',
      comparison: 'তুলনা',
      howItWorks: 'কীভাবে কাজ করে',
      trust: 'সুরক্ষা',
      roadmap: 'রোডম্যাপ',
      login: 'লগ ইন',
      register: 'রেজিস্ট্রেশন',
      forgot: 'পাসওয়ার্ড রিসেট',
    },
    sampleDisclosure:
      'এই পেজে দেখানো সব নাম, নম্বর, টাকার অঙ্ক ও ভবন নমুনা তথ্য—কোনো প্রকৃত বাড়িওয়ালা বা ভাড়াটিয়ার তথ্য নয়।',
    rights: 'সর্বস্বত্ব সংরক্ষিত।',
  },
};

const en: typeof bn = {
  meta: {
    title: 'BariVara — Bangla-first rent management for landlords in Bangladesh',
    description:
      'Multiple properties and units, tenant profiles, rental agreements, automatic monthly rent, payments, print-ready A4 receipts, WhatsApp messages and expense tracking—all in one place, in Bangla.',
    siteName: 'BariVara',
    ogAlt: 'BariVara — Bangla-first property and rent management',
  },

  common: {
    appName: 'BariVara',
    appLatinName: 'বাড়িভাড়া',
    sampleData: 'Sample data / নমুনা তথ্য',
    sampleDataShort: 'Sample data',
    comingSoon: 'Coming soon',
    taka: '৳',
    skipToContent: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    switchLanguage: 'Switch language',
    switchToEnglish: 'View in English',
    switchToBangla: 'View in Bangla',
    login: 'Log in',
    getStarted: 'Get started',
    register: 'Register',
    forgotPassword: 'Forgot password?',
    backToTop: 'Back to top',
    decorativeCanvas: 'Three-dimensional view of the building',
  },

  nav: {
    features: 'Features',
    comparison: 'Comparison',
    trust: 'Trust',
    howItWorks: 'How it works',
    roadmap: 'Roadmap',
    lightAccount: 'Account',
  },

  hero: {
    eyebrow: 'For landlords in Bangladesh',
    title: ['From the paper khata', 'to a clear digital ledger'],
    lead: 'Multiple buildings, units and tenants—all in one place. Agreements, monthly rent, payments and receipts, in Bangla, in your own hands.',
    primaryCta: 'Get started',
    secondaryCta: 'Log in',
    support: 'Bangla-first · বাংলা / English · print-ready A4 receipts',
    scrollHint: 'Scroll to step inside',
    posterAlt: 'A six-storey building at dusk with rent status glowing in its windows',
    legend: {
      title: 'Window glow',
      paid: 'Paid',
      partial: 'Partial',
      pending: 'Pending',
      overdue: 'Overdue',
      vacant: 'Vacant',
    },
  },

  comparison: {
    eyebrow: 'Comparison',
    title: 'The paper khata vs BariVara',
    lead: 'A khata needs hunting, totals drift, and nobody knows who changed what. Here every taka and every agreement stays inside the books.',
    paperLabel: 'Paper khata',
    bariLabel: 'BariVara',
    rows: [
      {
        label: 'Monthly rent',
        paper: 'Written by hand at month end, if you remember',
        bari: 'Automatic monthly bills per unit, never duplicated',
      },
      {
        label: 'Partial payments',
        paper: 'Scribbled separately, balance left loose',
        bari: 'Full or partial payments recorded with the balance',
      },
      {
        label: 'Receipts & notices',
        paper: 'Handwritten, signed, copied again and again',
        bari: 'Print-ready A4 with your signature, downloadable as an image',
      },
      {
        label: 'Expenses',
        paper: 'Buried on the back pages',
        bari: 'Tracked by category with monthly reports',
      },
      {
        label: 'Change history',
        paper: 'Nobody knows who changed what',
        bari: 'An audit log for important changes',
      },
    ],
  },

  story: {
    eyebrow: 'Step inside',
    hint: 'Scroll',
    chapterLabel: 'Chapter',
    progressLabel: 'Story chapters',
    goToChapter: 'Go to this chapter',
    chapters: [
      {
        id: 'hero',
        kicker: 'Start',
        title: 'From the paper khata to a clear digital ledger',
        body: 'Your building, your numbers—organised from day one.',
      },
      {
        id: 'properties',
        kicker: 'Properties & units',
        title: 'Every floor. Every unit.',
        body: 'Flat, apartment, room, shop, office and parking—occupied, vacant, under maintenance or inactive, all at a glance.',
      },
      {
        id: 'tenants',
        kicker: 'Tenants & agreements',
        title: 'Tenant and agreement, side by side',
        body: 'Phone, emergency contact, permanent address, occupation and NID live with the agreement. Two active agreements can never overlap on one unit.',
      },
      {
        id: 'rent',
        kicker: 'Monthly rent',
        title: "The month's bills are already there",
        body: 'Rent is generated every month, never twice. Collect by cash, bank, bKash, Nagad, Rocket or card—you only enter the transaction ID.',
      },
      {
        id: 'receipts',
        kicker: 'Receipts & WhatsApp',
        title: 'Print the receipt. Send it on WhatsApp.',
        body: 'A4 rent notices and money receipts with your signature, downloadable as images. One-click Bangla or English messages to validated Bangladesh numbers.',
      },
      {
        id: 'reports',
        kicker: 'Reports',
        title: 'Now the numbers add up',
        body: 'Occupancy, expected versus collected, and expenses by category—in a monthly report with CSV export.',
      },
      {
        id: 'closing',
        kicker: 'Not the end, the start',
        title: 'Your building. Your ledger. Your call.',
        body: 'Bangla-first. Your data stays yours. Add your first building today.',
      },
    ],
  },

  sceneVisuals: {
    unitTags: [
      { name: 'Flat 3B', type: 'Flat', status: 'Occupied', tone: 'occupied' },
      { name: 'Shop G1', type: 'Shop', status: 'Occupied', tone: 'occupied' },
      { name: 'Parking 2', type: 'Parking', status: 'Vacant', tone: 'vacant' },
    ],
    unitTagNote: '3 units shown · 24 in total',
    tenant: {
      heading: 'Tenant profile',
      name: 'Rafiqul Islam',
      role: 'Tenant',
      phoneLabel: 'Mobile',
      phone: '+880 1712-345678',
      emergencyLabel: 'Emergency contact',
      emergency: 'Nasrin Akter · 01898-765432',
      addressLabel: 'Permanent address',
      address: 'Shibganj, Bogura',
      occupationLabel: 'Occupation',
      occupation: 'Teacher',
      nidLabel: 'NID',
      nidValue: 'Front and back uploaded',
      unitLabel: 'Unit',
      unit: 'Flat 3B · 3rd floor',
    },
    agreement: {
      heading: 'Rental agreement',
      status: 'Active',
      rentLabel: 'Monthly rent',
      rent: '৳12,000',
      serviceLabel: 'Service fee',
      service: '৳800',
      parkingLabel: 'Parking',
      parking: '৳500',
      depositLabel: 'Advance deposit',
      deposit: '৳24,000',
      periodLabel: 'Period',
      period: '01 Jan 2026 – 31 Dec 2026',
      unitLabel: 'Unit',
      unit: 'Flat 3B',
      note: 'A second active agreement cannot be created on the same unit.',
    },
    rent: {
      heading: 'January 2026',
      subheading: 'Monthly rent list',
      columns: { unit: 'Unit', amount: 'Bill', status: 'Status' },
      rows: [
        { unit: 'Flat 1A', amount: '৳12,000', status: 'Paid', tone: 'paid' },
        { unit: 'Flat 2B', amount: '৳8,000 / ৳13,000', status: 'Partial', tone: 'partial' },
        { unit: 'Flat 3B', amount: '৳12,300', status: 'Pending', tone: 'pending' },
        { unit: 'Shop G1', amount: '৳18,000', status: 'Overdue', tone: 'overdue' },
      ],
      balanceNote: 'Flat 2B · ৳5,000 still due',
      noDuplicate: 'No more than one bill is generated for a month.',
      methodsLabel: 'Payment methods',
      methods: ['Cash', 'Bank', 'bKash', 'Nagad', 'Rocket', 'Card'],
      formula: 'Rent + service fee + parking = monthly bill',
    },
    receipt: {
      heading: 'Money receipt',
      numberLabel: 'Receipt no.',
      number: '0042',
      dateLabel: 'Date',
      date: '05 January 2026',
      fromLabel: 'Received from',
      from: 'Rafiqul Islam',
      amountLabel: 'Amount',
      amount: '৳12,000',
      inWords: 'BDT twelve thousand only',
      forLabel: 'For',
      forValue: 'Rent for January 2026',
      methodLabel: 'Method',
      method: 'bKash · TrxID 8N7K2Q1LP',
      signature: "Landlord's signature",
      printNote: 'Print-ready A4 · image download',
      whatsappLabel: 'WhatsApp',
      whatsappTime: '2:14 PM',
      whatsappMessage:
        'Assalamu alaikum. I have received ৳12,000 for January 2026 rent. Attaching the receipt. Thank you.',
    },
    reports: {
      heading: 'This month at a glance',
      occupancyLabel: 'Occupancy',
      occupancyValue: '75%',
      occupancyDetail: '18 of 24 units',
      expectedLabel: 'Expected',
      expectedValue: '৳186,000',
      collectedLabel: 'Collected',
      collectedValue: '৳152,500',
      outstandingLabel: 'Outstanding',
      outstandingValue: '৳33,500',
      expenseLabel: 'Expenses by category',
      expenses: [
        { label: 'Electricity', value: '৳12,000', percent: 52 },
        { label: 'Water', value: '৳3,200', percent: 14 },
        { label: 'Gas', value: '৳4,800', percent: 21 },
        { label: 'Maintenance', value: '৳8,400', percent: 36 },
        { label: 'Salary', value: '৳10,000', percent: 43 },
      ],
      csvNote: 'CSV export',
      expenseNote: 'Expenses are tracked by category.',
    },
    closing: {
      title: 'Add your first building today',
      body: 'One building, a few units—the rest can follow. You do not have to retire the khata; just keep a clear ledger beside it.',
      cta: 'Get started',
      secondary: 'Log in',
    },
  },

  features: {
    eyebrow: 'Features',
    title: 'Everything, in one place',
    lead: 'From adding a building to sending a receipt—the everyday work lives in one place, in Bangla.',
    items: [
      {
        icon: 'building',
        title: 'Properties & units',
        body: 'Multiple buildings and units—flat, apartment, room, shop, office, parking. Create many units in bulk.',
        tag: 'Occupied · vacant · maintenance · inactive',
      },
      {
        icon: 'users',
        title: 'Tenant profiles',
        body: 'Mobile, emergency contact, permanent address, occupation and NID front and back, in one profile.',
        tag: 'NID front & back',
      },
      {
        icon: 'signature',
        title: 'Rental agreements',
        body: 'Per unit: monthly rent, service fee, parking charge, advance deposit and start/end dates.',
        tag: 'Overlapping agreements blocked',
      },
      {
        icon: 'calendar',
        title: 'Monthly rent engine',
        body: 'Bills are generated each month, never twice. Statuses: pending, partial, paid, overdue.',
        tag: 'No duplicate bills',
      },
      {
        icon: 'wallet',
        title: 'Payment records',
        body: 'Full or partial payments by cash, bank, bKash, Nagad, Rocket or card. The transaction ID stays with you.',
        tag: 'Payments are never edited',
      },
      {
        icon: 'receipt',
        title: 'Receipts & notices',
        body: 'Print-ready A4 rent notices and money receipts with the landlord signature, downloadable as images.',
        tag: 'A4 · signature · image',
      },
      {
        icon: 'whatsapp',
        title: 'WhatsApp messages',
        body: 'One-click Bangla or English messages to validated Bangladesh numbers, with the receipt details.',
        tag: 'One click, two languages',
      },
      {
        icon: 'expenses',
        title: 'Expense tracking',
        body: 'Electricity, water, gas, maintenance, repair, security, cleaning, salary, tax and other—by category.',
        tag: '10 categories',
      },
      {
        icon: 'chart',
        title: 'Reports',
        body: 'Monthly income and expenses, occupancy and expected versus collected—with CSV export.',
        tag: 'CSV export',
      },
      {
        icon: 'audit',
        title: 'Audit log',
        body: 'Important changes are recorded—who, when, what. Payment mistakes are fixed with an audited reversal.',
        tag: 'Transparent change history',
      },
    ],
  },

  showcase: {
    eyebrow: 'Two languages, one ledger',
    title: 'In the language you keep your books',
    lead: 'A full বাংলা / English toggle across the app. Notices and receipts are laid out for A4 printing with a place for your signature—or download them as images.',
    languageLabel: 'Language',
    points: [
      { title: 'Bangla-first', body: 'Menus, forms, lists and receipts in Bangla, with English when you need it.' },
      { title: 'Print-ready A4', body: 'Rent notices and money receipts at the right proportions.' },
      { title: 'Landlord signature', body: 'Upload your signature and use it on receipts.' },
      { title: 'Image download', body: 'Send a receipt as an image when printing is not an option.' },
    ],
    notice: {
      heading: 'Rent notice',
      period: 'January 2026',
      landlord: 'Landlord: Md. Anwar Hossain',
      rows: [
        { label: 'Tenant', value: 'Rafiqul Islam' },
        { label: 'Unit', value: 'Flat 3B' },
        { label: 'Monthly rent', value: '৳12,000' },
        { label: 'Service fee', value: '৳800' },
        { label: 'Parking', value: '৳500' },
      ],
      totalLabel: 'Total',
      total: '৳13,300',
      dueLabel: 'Due date',
      due: '10 January 2026',
      signature: "Landlord's signature",
      sampleNotice: 'Sample notice',
    },
  },

  trust: {
    eyebrow: 'Trust',
    title: 'Clear books. Your data stays yours.',
    lead: 'What a landlord ledger actually needs: privacy, transparency and exact taka arithmetic.',
    items: [
      {
        icon: 'lock',
        title: 'Private per landlord',
        body: 'Each landlord sees only their own buildings, tenants, payments and expenses.',
      },
      {
        icon: 'reversal',
        title: 'Payments are never edited',
        body: 'Mistakes are not deleted—they are corrected through an audited reversal.',
      },
      {
        icon: 'calculator',
        title: 'Exact taka math',
        body: 'Taka amounts use exact decimal arithmetic, not floating-point guesses.',
      },
      {
        icon: 'upload',
        title: 'Secure file uploads',
        body: 'NID images and documents are stored securely and belong to your account.',
      },
    ],
    extra: 'Email OTP password recovery—a simple way back into your account.',
  },

  roadmap: {
    eyebrow: 'On the roadmap',
    title: 'What is still coming',
    lead: 'Anything that is not live yet is labelled here. When it ships, you will see it here.',
    items: [
      {
        title: 'Direct bKash / Nagad gateway settlement',
        body: 'Reconciling gateway payments automatically. Today payments are recorded manually.',
        badge: 'Not live yet',
      },
      {
        title: 'Automated SMS and WhatsApp reminders',
        body: 'Bills and due dates reminded automatically. Today WhatsApp messages are sent manually with one click.',
        badge: 'Not live yet',
      },
    ],
    footnote: 'Nothing on this roadmap is being claimed as a live feature.',
  },

  howItWorks: {
    eyebrow: 'How it works',
    title: 'Organised in four steps',
    lead: 'Getting the first building in takes a few minutes.',
    steps: [
      {
        title: 'Add a property',
        body: 'Create the building, floors and units—one by one or many at once.',
      },
      {
        title: 'Add tenants and agreements',
        body: 'Add the tenant profile and NID, then create the agreement with its terms.',
      },
      {
        title: 'Generate monthly rent',
        body: 'Each month’s bill is created automatically—never more than one per month.',
      },
      {
        title: 'Collect and send receipts',
        body: 'Record a full or partial payment, then print the receipt or send it on WhatsApp.',
      },
    ],
    ctaNote: 'You do not need any units before you start.',
  },

  finalCta: {
    eyebrow: 'Time to start',
    title: 'A clear ledger beside the khata',
    titleAlt: 'Your building, in your hands',
    lead: 'Whether you have one building or many—keep rent, agreements, payments and receipts in one place. In Bangla.',
    primary: 'Get started',
    secondary: 'Log in',
    note: 'Your data is visible only inside your own account.',
  },

  footer: {
    tagline: 'Bangla-first property and rent management, built for landlords in Bangladesh.',
    productLabel: 'Platform',
    accountLabel: 'Account',
    links: {
      features: 'Features',
      comparison: 'Comparison',
      howItWorks: 'How it works',
      trust: 'Trust',
      roadmap: 'Roadmap',
      login: 'Log in',
      register: 'Register',
      forgot: 'Reset password',
    },
    sampleDisclosure:
      'Every name, phone number, taka amount and building shown on this page is sample data—not a real landlord or tenant.',
    rights: 'All rights reserved.',
  },
};

export const landingCopy = { bn, en };
export type LandingCopy = typeof bn;
export type LandingLang = keyof typeof landingCopy;

export function getLandingCopy(lang: LandingLang): LandingCopy {
  return landingCopy[lang] ?? landingCopy.bn;
}
