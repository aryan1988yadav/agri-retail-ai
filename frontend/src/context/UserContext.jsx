import React, { createContext, useContext, useState, useEffect } from 'react';

export const PERSONAS = {
  ramesh: {
    id: 'ramesh',
    name: 'Ramesh Kumar',
    email: 'ramesh@agriretail.in',
    hindiName: 'रमेश कुमार',
    role: 'farmer',
    avatar: '👨‍🌾',
    phone: '98123-45670',
    state: 'Haryana',
    district: 'Karnal',
    village: 'Kunjpura',
    landArea: '3.5 Acres',
    activeSeason: 'Rabi',
    cropFocus: 'Wheat & Mustard',
    initialKhata: 4200.0,
    invoices: [
      {
        id: 'INV-241012-K78',
        date: '12 Oct 2024',
        items: '2x IFFCO DAP (50kg), 1x Multiplex Zinc (5kg)',
        amount: 3120,
        type: 'Credit (Udhaar)',
        settled: false
      },
      {
        id: 'INV-241028-R41',
        date: '28 Oct 2024',
        items: '4x IFFCO Neem Coated Urea (45kg)',
        amount: 1080,
        type: 'Credit (Udhaar)',
        settled: false
      }
    ]
  },
  sunita: {
    id: 'sunita',
    name: 'Sunita Devi',
    email: 'sunita@agriretail.in',
    hindiName: 'सुनीता देवी',
    role: 'farmer',
    avatar: '👩‍🌾',
    phone: '98765-01234',
    state: 'Madhya Pradesh',
    district: 'Indore',
    village: 'Sanwer',
    landArea: '8.0 Acres',
    activeSeason: 'Kharif',
    cropFocus: 'Soybean & Cotton',
    initialKhata: 0.0,
    invoices: [
      {
        id: 'INV-240915-S12',
        date: '15 Sep 2024',
        items: '2x Bayer Confidor (100ml), 5x Mahadhan NPK',
        amount: 7930,
        type: 'Paid via UPI',
        settled: true
      }
    ]
  },
  rajendra: {
    id: 'rajendra',
    name: 'Rajendra Sharma',
    email: 'rajendra@agriretail.in',
    hindiName: 'राजेन्द्र शर्मा',
    role: 'retailer',
    avatar: '🏪',
    phone: '98989-89898',
    storeName: 'Sharma Krishi Seva Kendra',
    state: 'Haryana',
    district: 'Karnal',
    village: 'GT Road Market, Karnal',
    gstin: '06AAACS1234K1Z5'
  }
};

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [allPersonas, setAllPersonas] = useState(() => {
    const saved = localStorage.getItem('agri_custom_personas');
    if (saved) {
      try {
        return { ...PERSONAS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error parsing custom personas', e);
      }
    }
    return PERSONAS;
  });

  const [activePersonaId, setActivePersonaId] = useState(() => {
    return localStorage.getItem('agri_persona') || 'ramesh';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agri_lang') || 'en';
  });

  const [rameshKhata, setRameshKhata] = useState(4200.0);
  const [rameshInvoices, setRameshInvoices] = useState(PERSONAS.ramesh.invoices);
  const [khataSettlementToast, setKhataSettlementToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('agri_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('agri_persona', activePersonaId);
  }, [activePersonaId]);

  useEffect(() => {
    localStorage.setItem('agri_lang', language);
  }, [language]);

  const currentPersona = {
    ...(allPersonas[activePersonaId] || allPersonas.ramesh || PERSONAS.ramesh),
    khataBalance: activePersonaId === 'ramesh' ? rameshKhata : 0.0,
    invoices: activePersonaId === 'ramesh' ? rameshInvoices : (allPersonas[activePersonaId]?.invoices || [])
  };

  const isFarmer = currentPersona.role === 'farmer';
  const isRetailer = currentPersona.role === 'retailer';

  const loginAs = (personaId) => {
    if (allPersonas[personaId]) {
      setActivePersonaId(personaId);
      setIsAuthenticated(true);
    }
  };

  const loginWithEmail = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const found = Object.values(allPersonas).find(p => {
      const pEmail = (p.email || '').trim().toLowerCase();
      return pEmail === cleanEmail;
    });

    if (found) {
      setActivePersonaId(found.id);
      setIsAuthenticated(true);
      return { success: true, user: found };
    }
    return { 
      success: false, 
      message: language === 'hi' 
        ? 'इस ईमेल से कोई पंजीकृत खाता नहीं मिला। कृपया मान्य ईमेल दर्ज करें या नया खाता बनाएं।' 
        : 'No registered account found with this email. Please check your credentials or create an account.' 
    };
  };

  const loginWithPhone = (phone) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const found = Object.values(allPersonas).find(p => {
      const pClean = (p.phone || '').replace(/[^0-9]/g, '');
      return pClean === cleanPhone || pClean.endsWith(cleanPhone) || cleanPhone.endsWith(pClean);
    });

    if (found) {
      setActivePersonaId(found.id);
      setIsAuthenticated(true);
      return { success: true, user: found };
    }
    return { 
      success: false, 
      message: language === 'hi' 
        ? 'इस मोबाइल नंबर से कोई खाता नहीं मिला। कृपया नीचे नया खाता बनाएं।' 
        : 'No registered account found with this phone number. Please create an account.' 
    };
  };

  const registerUser = (userData) => {
    const id = `user_${Date.now()}`;
    const cleanEmail = (userData.email || '').trim().toLowerCase() || `${userData.name.toLowerCase().replace(/\s+/g, '')}@agriretail.in`;
    const newPersona = {
      id,
      name: userData.name || 'New Farmer',
      email: cleanEmail,
      hindiName: userData.name || 'नया किसान',
      role: userData.role || 'farmer',
      avatar: userData.role === 'retailer' ? '🏪' : '👨‍🌾',
      phone: userData.phone || '98000-00000',
      state: userData.state || 'Haryana',
      district: userData.district || 'Karnal',
      village: userData.village || 'Gram',
      storeName: userData.role === 'retailer' ? (userData.storeName || `${userData.name} Krishi Seva`) : undefined,
      gstin: userData.role === 'retailer' ? (userData.gstin || '06AAACS0000K1Z0') : undefined,
      landArea: userData.role === 'farmer' ? (userData.landArea ? `${userData.landArea} Acres` : '4.0 Acres') : undefined,
      activeSeason: userData.activeSeason || 'Rabi',
      cropFocus: userData.cropFocus || 'Wheat & Mustard',
      initialKhata: 0.0,
      invoices: []
    };

    const updated = { ...allPersonas, [id]: newPersona };
    setAllPersonas(updated);
    localStorage.setItem('agri_custom_personas', JSON.stringify(updated));
    setActivePersonaId(id);
    setIsAuthenticated(true);
    return newPersona;
  };

  const switchPersona = (personaId) => {
    if (allPersonas[personaId]) {
      setActivePersonaId(personaId);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'hi' : 'en'));
  };

  const settleKhataFromMandi = (cropName, harvestEarnings) => {
    const previousDebt = rameshKhata;
    if (previousDebt <= 0) return { settledAmount: 0, netPayout: harvestEarnings };

    const settledAmount = Math.min(previousDebt, harvestEarnings);
    const remainingDebt = previousDebt - settledAmount;
    const netPayout = harvestEarnings - settledAmount;

    setRameshKhata(remainingDebt);

    const settlementReceipt = {
      id: `SETTLE-MANDI-${Date.now().toString().slice(-4)}`,
      date: 'Today (Mandi Settlement)',
      items: `Direct credit deduction from ${cropName} harvest sale`,
      amount: -settledAmount,
      type: 'Khata Settled (Fasal Se Hisaab)',
      settled: true
    };
    setRameshInvoices(prev => [settlementReceipt, ...prev]);

    setKhataSettlementToast({
      cropName,
      harvestEarnings,
      settledAmount,
      remainingDebt,
      netPayout
    });

    return { settledAmount, netPayout, remainingDebt };
  };

  const addPOSCreditToCustomer = (customerName, amount, itemsList) => {
    if (customerName.toLowerCase().includes('ramesh')) {
      setRameshKhata(prev => prev + amount);
      const newInvoice = {
        id: `INV-POS-${Date.now().toString().slice(-4)}`,
        date: 'Today (POS Counter)',
        items: itemsList,
        amount: amount,
        type: 'Credit (Udhaar)',
        settled: false
      };
      setRameshInvoices(prev => [newInvoice, ...prev]);
    }
  };

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        activePersonaId,
        currentPersona,
        allPersonas,
        language,
        isFarmer,
        isRetailer,
        loginAs,
        loginWithEmail,
        loginWithPhone,
        registerUser,
        switchPersona,
        logout,
        setLanguage,
        toggleLanguage,
        rameshKhata,
        rameshInvoices,
        settleKhataFromMandi,
        addPOSCreditToCustomer,
        khataSettlementToast,
        dismissSettlementToast: () => setKhataSettlementToast(null)
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
