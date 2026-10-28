'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, BilingualText } from '@/types';

const translations: Record<string, { en: string; am: string }> = {
  restaurant: { en: 'Restaurant', am: 'ሬስቶራንት' },
  menu: { en: 'Menu', am: 'ምናሌ' },
  cart: { en: 'Cart', am: 'ጋሪ' },
  checkout: { en: 'Checkout', am: 'ክፍያ ይፈጽሙ' },
  table: { en: 'Table', am: 'ጠረጴዛ' },
  tables: { en: 'Tables', am: 'ጠረጴዛዎች' },
  orderNow: { en: 'Order Now', am: 'አሁን ይዘዙ' },
  delivery: { en: 'Delivery', am: 'ደሊቨሪ' },
  dineIn: { en: 'Dine-In', am: 'እዚሁ መመገብ' },
  takeaway: { en: 'Takeaway', am: 'ይዘው የሚሄዱት' },
  callWaiter: { en: 'Call Waiter', am: 'አስተናጋጅ ጥራ' },
  requestBill: { en: 'Request Bill', am: 'ሒሳብ ጠይቅ' },
  wifiInfo: { en: 'WiFi Info', am: 'ዋይፋይ' },
  playGames: { en: 'Games', am: 'ጨዋታዎች' },
  fasting: { en: 'Fasting / Vegan', am: 'የጾም' },
  spiceLevel: { en: 'Spice Level', am: 'የበርበሬ መጠን' },
  price: { en: 'Price', am: 'ዋጋ' },
  etb: { en: 'ETB', am: 'ብር' },
  total: { en: 'Total', am: 'አጠቃላይ' },
  add: { en: 'Add', am: 'ጨምር' },
  emptyCart: { en: 'Your cart is empty', am: 'ጋሪዎ ባዶ ነው' },
  orderSent: { en: 'Order Sent Successfully!', am: 'ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል!' },
  waitingApproval: { en: 'Waiting for waiter confirmation…', am: 'በአስተናጋጅ እስኪረጋገጥ በመጠበቅ ላይ…' },
  kitchenCooking: { en: 'Kitchen is preparing your food', am: 'ምግብዎ በኩሽና እየተዘጋጀ ነው' },
  foodReady: { en: 'Your food is ready to serve!', am: 'ምግብዎ ደርሷል!' },
  staffLogin: { en: 'Staff Portal', am: 'የሰራተኞች መግቢያ' },
  pinPlaceholder: { en: 'Enter 4-digit PIN', am: 'ባለ 4-አሃዝ ፒን ያስገቡ' },
  unlock: { en: 'Unlock', am: 'ግባ' },
  telebirr: { en: 'Telebirr', am: 'ቴሌብር' },
  bankTransfer: { en: 'Bank Transfer', am: 'በባንክ ማስተላለፍ' },
  cash: { en: 'Cash', am: 'በጥሬ ገንዘብ' },
  referenceCode: { en: 'Transaction Ref Code', am: 'የግብይት ማረጋገጫ ቁጥር' },
  verifyPayment: { en: 'Verify & Settle', am: 'አረጋግጥ እና ጨርስ' },
  status: { en: 'Status', am: 'ሁኔታ' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  getText: (item?: Partial<BilingualText> | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang') as Language;
    if (saved === 'en' || saved === 'am') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en;
    }
    return key;
  };

  const getText = (item?: Partial<BilingualText> | null): string => {
    if (!item) return '';
    return (language === 'am' ? item.am : item.en) || item.en || item.am || '';
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, getText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
