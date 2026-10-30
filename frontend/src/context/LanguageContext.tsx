'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language, BilingualText } from '@/types';

type Dictionary = Record<string, { en: string; am: string }>;

const translations: Dictionary = {
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
  spiceLevel: { en: 'Spice Level', am: 'የበርበብሬ መጠን' },
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
  back: { en: 'Back', am: 'ተመለስ' },
  home: { en: 'Home', am: 'ዋና ገጽ' },
  dashboard: { en: 'Dashboard', am: 'ዳሽቦርድ' },
  orders: { en: 'Orders', am: 'ትዕዛዞች' },
  staff: { en: 'Staff', am: 'ሰራተኞች' },
  settings: { en: 'Settings', am: 'ቅንብሮች' },
  analytics: { en: 'Analytics', am: 'ትንታኔ' },
  signOut: { en: 'Sign Out', am: 'ውጣ' },
  floorPlan: { en: 'Floor Plan', am: 'የወለል እቅድ' },
  stockControl: { en: 'Stock Control', am: 'የክምችት ቁጥጥር' },
  voids: { en: 'Voids & Refunds', am: 'ስረዛ እና ተመላሽ' },
  activeOrders: { en: 'Active Orders', am: 'ንቁ ትዕዛዞች' },
  pendingApproval: { en: 'Pending Approval', am: 'ማረጋገጫ የሚጠብቁ' },
  readyToServe: { en: 'Ready to Serve', am: 'ለማቅረብ ዝግጁ' },
  markServed: { en: 'Mark Served', am: 'ተቀብሏል' },
  approveOrder: { en: 'Approve & Send to Kitchen', am: 'አረጋግጥ እና ወደ ኩሽና ላክ' },
  manualOrder: { en: 'Manual Order', am: 'በእጅ ትዕዛዝ' },
  tableStatus: { en: 'Table Status', am: 'የጠረጴዛ ሁኔታ' },
  available: { en: 'Available', am: 'ነጻ' },
  occupied: { en: 'Dining', am: 'በመመገብ ላይ' },
  billRequested: { en: 'Bill Requested', am: 'ሒሳብ ተጠይቋል' },
  callWaiterStatus: { en: 'Calling Waiter', am: 'አስተናጋጅ እየጠራ' },
  emptyBasket: { en: 'Basket is empty', am: 'ጋሪው ባዶ ነው' },
  sendToKitchen: { en: 'Send to Kitchen', am: 'ወደ ኩሽና ላክ' },
  games: { en: 'Tic-Tac-Toe', am: 'ቲክ-ታክ-ቶ' },
  playAgain: { en: 'Play Again', am: 'እንደገና ተጫወት' },
  yourTurn: { en: 'Your turn', am: 'የእርስዎ ተራ' },
  soloPlay: { en: 'Play Solo', am: 'ብቻዎን ተጫወት' },
  twoPlayers: { en: 'Two Players', am: 'ሁለት ተጫዋቾች' },
  sameTable: { en: 'Play with the person at your table', am: 'በጠረጴዛዎ ላይ ካለው ሰው ጋር ይጫወቱ' },
  vsComputer: { en: 'Play against the computer', am: 'ከኮምፒውተር ጋር ይጫወቱ' },
  chooseMode: { en: 'Choose how you want to play', am: 'እንዴት መጫወት እንደሚፈልጉ ይምረጡ' },
  changeMode: { en: 'Change mode', am: 'ዓይነት ቀይር' },
  computerThinking: { en: 'Computer is thinking…', am: 'ኮምፒውተር እያሰበ ነው…' },
  youWin: { en: 'You win!', am: 'አሸነፉ!' },
  computerWins: { en: 'Computer wins!', am: 'ኮምፒውተር አሸነፈ!' },
  draw: { en: "It's a draw!", am: 'አቻ ሆነ!' },
  playerX: { en: 'Player X', am: 'ተጫዋች X' },
  playerO: { en: 'Player O', am: 'ተጫዋች O' },
  you: { en: 'You', am: 'እርስዎ' },
  computer: { en: 'Computer', am: 'ኮምፒውተር' },
  wins: { en: 'wins', am: 'አሸነፈ' },
  orderStatus: { en: 'Order Status', am: 'የትዕዛዝ ሁኔታ' },
  approved: { en: 'Approved', am: 'ጸድቋል' },
  pending: { en: 'Pending', am: 'በመጠባበቅ' },
  preparing: { en: 'Cooking', am: 'እየተዘጋጀ' },
  ready: { en: 'Ready', am: 'ዝግጁ' },
  served: { en: 'Served', am: 'ተቀብሏል' },
  outForDelivery: { en: 'Out for Delivery', am: 'በመንገድ ላይ' },
  delivered: { en: 'Delivered', am: 'ደርሷል' },
  settled: { en: 'Settled', am: 'ተከፍሏል' },
  cancelled: { en: 'Cancelled', am: 'ተሰርዟል' },
  payment: { en: 'Payment', am: 'ክፍያ' },
  splitBill: { en: 'Split Bill', am: 'ሒሳብ መከፋፈል' },
  addGuest: { en: 'Add Guest', am: 'እንግዳ ጨምር' },
  guest: { en: 'Guest', am: 'እንግዳ' },
  amount: { en: 'Amount', am: 'መጠን' },
  print: { en: 'Print', am: 'አትም' },
  subtotal: { en: 'Subtotal', am: 'ንዑስ ድምር' },
  item: { en: 'Item', am: 'ዕቃ' },
  qty: { en: 'Qty', am: 'ብዛት' },
  notes: { en: 'Notes', am: 'ማስታወሻ' },
  specialInstructions: { en: 'Special instructions', am: 'ልዩ መመሪያ' },
  trackOrder: { en: 'Track Order', am: 'ትዕዛዝ ተከታተል' },
  orderPlaced: { en: 'Order Placed', am: 'ትዕዛዝ ተሰጥቷል' },
  viewMenu: { en: 'View Menu', am: 'ምናሌ ይመልከቱ' },
  addToCart: { en: 'Add to Cart', am: 'ወደ ጋሪ ጨምር' },
  deliveryAddress: { en: 'Delivery Address', am: 'የደሊቨሪ አድራሻ' },
  phone: { en: 'Phone', am: 'ስልክ' },
  fullName: { en: 'Full Name', am: 'ሙሉ ስም' },
  orderType: { en: 'Order Type', am: 'የትዕዛዝ ዓይነት' },
  liveTracking: { en: 'Live Tracking', am: 'ቀጥታ ክትትል' },
  driverOnWay: { en: 'Driver is on the way', am: 'ሹፌሩ በመንገድ ላይ ነው' },
  call: { en: 'Call', am: 'ደውል' },
  loading: { en: 'Loading…', am: 'በመጫን ላይ…' },
  noOrders: { en: 'No orders yet', am: 'እስካሁን ትዕዛዝ የለም' },
  clearTable: { en: 'Clear Table', am: 'ጠረጴዛ አጽዳ' },
  outOfStock: { en: 'Out of Stock', am: 'ከክምችት ውጪ' },
  inStock: { en: 'In Stock', am: 'በክምችት ውስጥ' },
  save: { en: 'Save', am: 'አስቀምጥ' },
  cancel: { en: 'Cancel', am: 'ሰርዝ' },
  search: { en: 'Search', am: 'ፈልግ' },
  all: { en: 'All', am: 'ሁሉም' },
  today: { en: 'Today', am: 'ዛሬ' },
  week: { en: 'This Week', am: 'በዚህ ሳምንት' },
  revenue: { en: 'Revenue', am: 'ገቢ' },
  topDishes: { en: 'Top Selling Dishes', am: 'በብዛት የተሸጡ ምግቦች' },
  paymentBreakdown: { en: 'Revenue by Payment Method', am: 'ገቢ በክፍያ ዘዴ' },
  restaurantName: { en: 'Restaurant Name', am: 'የሬስቶራንት ስም' },
  bankDetails: { en: 'Bank Details', am: 'የባንክ ዝርዝር' },
  merchantCode: { en: 'Merchant Code', am: 'የነጋዴ ኮድ' },
  wifiName: { en: 'WiFi Name', am: 'የዋይፋይ ስም' },
  wifiPassword: { en: 'WiFi Password', am: 'የዋይፋይ የይለፍ ቃል' },
  addStaff: { en: 'Add Staff', am: 'ሰራተኛ ጨምር' },
  addDish: { en: 'Add Dish', am: 'ምግብ ጨምር' },
  editDish: { en: 'Edit Dish', am: 'ምግብ አስተካክል' },
  delete: { en: 'Delete', am: 'ሰርዝ' },
  edit: { en: 'Edit', am: 'አስተካክል' },
  approveVoid: { en: 'Approve Void', am: 'ስረዛ አጽድቅ' },
  voidOrder: { en: 'Void Order', am: 'ትዕዛዝ ስርዝ' },
  markReady: { en: 'Mark Ready', am: 'ዝግጁ አድርግ' },
  startPrep: { en: 'Start Prep', am: 'ማዘጋጀት ጀምር' },
  incomingTickets: { en: 'Incoming Tickets', am: 'የገቡ ትእዛዞች' },
  cooking: { en: 'Cooking', am: 'በማዘጋጀት ላይ' },
  neededNow: { en: 'Needed Now', am: 'አሁን የሚያስፈልግ' },
  assigned: { en: 'Assigned', am: 'ተመድቧል' },
  pickup: { en: 'Pickup Food', am: 'ምግብ ተቀበል' },
  onTheWay: { en: 'On the Way', am: 'በመንገድ ላይ' },
  markDelivered: { en: 'Mark Delivered', am: 'ደርሷል' },
  callCustomer: { en: 'Call Customer', am: 'ደንበኛ ደውል' },
  gpsActive: { en: 'Live GPS Active', am: 'GPS ንቁ ነው' },
  gpsWaiting: { en: 'Acquiring GPS…', am: 'GPS በመፈለግ ላይ…' },
  activeBills: { en: 'Active Bills', am: 'ንቁ ሒሳቦች' },
  verifyReference: { en: 'Enter the exact transaction reference from the customer', am: 'የደንበኛውን ትክክለኛ የግብይት ማረጋገጫ ቁጥር ያስገቡ' },
  fiscalReceipt: { en: 'Official Fiscal Receipt', am: 'ይፋዊ የግብር ደረሰኝ' },
  noTransactions: { en: 'No transactions yet', am: 'እስካሁን ግብይት የለም' },
  selectBill: { en: 'Select an active bill to settle', am: 'ለመክፈል ንቁ ሒሳብ ይምረጡ' },
  confirmPayment: { en: 'Confirm Payment', am: 'ክፍያ አረጋግጥ' },
  orderNumber: { en: 'Order Number', am: 'የትዕዛዝ ቁጥር' },
  customer: { en: 'Customer', am: 'ደንበኛ' },
  address: { en: 'Address', am: 'አድራሻ' },
  optional: { en: 'Optional', am: 'አማራጭ' },
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
    const saved = window.localStorage.getItem('app_lang');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === 'en' || saved === 'am') setLanguageState(saved);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem('app_lang', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => {
      const next = current === 'en' ? 'am' : 'en';
      window.localStorage.setItem('app_lang', next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: string): string => translations[key]?.[language] || translations[key]?.en || key,
    [language]
  );

  const getText = useCallback(
    (item?: Partial<BilingualText> | null): string => {
      if (!item) return '';
      return (language === 'am' ? item.am : item.en) || item.en || item.am || '';
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t, getText }),
    [language, setLanguage, toggleLanguage, t, getText]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
