import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, Sprout, Store, LayoutDashboard, ShoppingCart, 
  TrendingUp, BookOpen, User, ShieldCheck, Zap, ChevronDown, 
  LogOut, Globe, Check, ArrowRightLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser, PERSONAS } from '../context/UserContext';
import { useTranslation } from '../utils/translations';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { 
    allPersonas,
    currentPersona, 
    isFarmer, 
    isRetailer, 
    rameshKhata, 
    switchPersona, 
    logout, 
    language, 
    toggleLanguage 
  } = useUser();
  const { t } = useTranslation(language);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clean navigation labels using translation dictionary (no bracket clutter!)
  const farmerNavItems = [
    { id: 'marketplace', label: t.shopInputs, icon: Store },
    { id: 'prediction', label: t.cropDoctor, icon: Sprout },
    { id: 'mandi', label: t.kisanMandi, icon: TrendingUp },
    { 
      id: 'khata', 
      label: t.khataPassbook, 
      icon: BookOpen, 
      badge: currentPersona?.id === 'ramesh' && rameshKhata > 0 ? `₹${rameshKhata.toFixed(0)}` : null 
    },
  ];

  const retailerNavItems = [
    { id: 'pos', label: t.posCounter, icon: ShoppingBag },
    { id: 'dashboard', label: t.analytics, icon: LayoutDashboard },
    { id: 'mandi', label: t.mandiBids, icon: TrendingUp },
    { id: 'marketplace', label: t.godownCatalog, icon: Store },
  ];

  const navItems = isFarmer ? farmerNavItems : retailerNavItems;

  const handlePersonaSwitch = (personaId) => {
    switchPersona(personaId);
    setProfileDropdownOpen(false);
    // If switching roles, set sensible default tab
    if (personaId === 'rajendra') {
      setActiveTab('pos');
    } else {
      setActiveTab('marketplace');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8] shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab(isFarmer ? 'marketplace' : 'pos')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-stone-900">
                  AgriRetail
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-semibold tracking-wider uppercase">
                {isFarmer ? t.kisanPortal : t.counterPOS}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Laptop Ergonomic Pill in Warm Linen) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#EDE8E0] p-1 rounded-2xl border border-stone-300/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-950 shadow-xs border border-[#E0DBD2] font-black'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-[#E5DFD6]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-200 text-amber-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* 1-Tap Clean Language Switcher (English vs Hinglish) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200/90 hover:border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Toggle English / Hinglish"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className={language === 'en' ? 'text-emerald-700 font-black bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200' : 'text-stone-400 hover:text-stone-700'}>English</span>
              <span className="text-stone-300">/</span>
              <span className={language === 'hi' ? 'text-emerald-700 font-black bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200' : 'text-stone-400 hover:text-stone-700'}>Hinglish</span>
            </button>

            {/* Cart Button (Farmers) or New Bill Button (Retailer) */}
            {isFarmer ? (
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 transition-all font-bold text-xs shadow-2xs cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-emerald-700" />
                <span className="hidden sm:inline">{t.cart}</span>
                {totalItems > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black text-white bg-emerald-700 rounded-full shadow-2xs">
                    {totalItems}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('pos')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-2xs cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>+ New Bill</span>
              </button>
            )}

            {/* Profile Pill & Dropdown (Role Switcher + Logout) */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-[#EDE8E0] hover:bg-[#E5DFD6] border border-stone-300/60 text-xs font-bold text-stone-800 transition-all cursor-pointer"
              >
                <span className="text-base leading-none">{currentPersona?.avatar || '👤'}</span>
                <span className="hidden sm:inline max-w-[120px] truncate font-black">
                  {language === 'hi' ? currentPersona?.hindiName || currentPersona?.name : currentPersona?.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FCFAF7] rounded-2xl border border-[#E5DFD5] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Current Active Persona Info */}
                  <div className="px-4 py-2.5 border-b border-stone-100">
                    <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      Logged in as
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="font-black text-stone-900 text-sm">
                        {currentPersona?.name}
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        isFarmer ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {currentPersona?.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      📍 {currentPersona?.district}, {currentPersona?.state}
                    </div>
                  </div>

                  {/* Logout Button (Direct & Clean) */}
                  <div className="pt-2 px-2">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-100 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                  isActive ? 'text-emerald-800 font-black' : 'text-stone-500'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-stone-400'}`} />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
