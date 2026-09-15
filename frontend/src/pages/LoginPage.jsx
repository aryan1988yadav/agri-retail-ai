import React, { useState } from 'react';
import { 
  Sprout, Store, TrendingUp, Sparkles, ArrowRight, CheckCircle2, 
  Mail, Lock, UserPlus, KeyRound, ShieldCheck, MapPin, Building2, 
  User, Check, Eye, EyeOff
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../utils/translations';

const INDIAN_STATES = [
  'Haryana', 'Punjab', 'Uttar Pradesh', 'Madhya Pradesh', 
  'Rajasthan', 'Maharashtra', 'Gujarat', 'Bihar', 'West Bengal'
];

const LoginPage = () => {
  const { loginAs, loginWithEmail, registerUser, language, toggleLanguage } = useUser();
  const { t } = useTranslation(language);

  // Tab State: 'demo' | 'email' | 'register'
  const [activeTab, setActiveTab] = useState('demo');

  // Email Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Registration Form State
  const [regRole, setRegRole] = useState('farmer'); // 'farmer' or 'retailer'
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    state: 'Haryana',
    district: 'Karnal',
    village: '',
    landArea: '4.0',
    cropFocus: 'Wheat & Mustard',
    storeName: '',
    gstin: ''
  });
  const [regSuccess, setRegSuccess] = useState(false);

  // Handle Email login flow
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    if (!email.trim()) {
      setLoginError(language === 'hi' ? 'कृपया मान्य ईमेल आईडी दर्ज करें।' : 'Please enter your email address.');
      return;
    }
    const result = loginWithEmail(email, password);
    if (!result.success) {
      setLoginError(result.message);
    }
  };

  // Fast autofill for demo testing
  const autofillDemoEmail = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('kisan123');
    setLoginError('');
  };

  // Handle User Registration
  const handleRegister = (e) => {
    e.preventDefault();
    if (!regForm.name.trim() || !regForm.email.trim()) {
      alert('Please fill in your name and email address.');
      return;
    }
    setRegSuccess(true);
    setTimeout(() => {
      registerUser({
        ...regForm,
        role: regRole
      });
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5] font-sans selection:bg-emerald-100 selection:text-emerald-900 animate-in fade-in duration-300">
      
      {/* Left Brand Showcase (Widescreen Laptop Section) */}
      <div className="lg:w-5/12 bg-gradient-to-br from-[#082817] via-[#0E3B22] to-[#041B0E] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden border-r border-emerald-900/40">
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-900/50">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">AgriRetail</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  AI OS
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/70 font-medium uppercase tracking-wider">
                {language === 'hi' ? 'भारतीय कृषि का डिजिटल ऑपरेटिंग सिस्टम' : 'Phygital Operating System for Indian Agriculture'}
              </p>
            </div>
          </div>

          {/* Core Value Proposition */}
          <div className="mt-10 space-y-3 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 backdrop-blur-md text-emerald-300 text-xs font-bold border border-emerald-700/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'दुकानदार व किसान का साझा मंच' : 'Integrated Kisan Portal & Counter POS'}</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight">
              {language === 'hi' 
                ? 'खाद, बीज, व फसल की संपूर्ण डिजिटल व्यवस्था।' 
                : 'Smart Agri-Input Retail, Soil AI & Direct Mandi Trading.'}
            </h1>

            <p className="text-emerald-100/80 text-xs leading-relaxed">
              {language === 'hi'
                ? 'दुकानदार के लिए 10-सेकंड की POS बिलिंग और किसान के लिए सरकारी सब्सिडी दरें, मृदा परीक्षण AI व फसल बेचने की मंडी।'
                : 'Built for rural Indian commerce: instant POS billing, certified seed catalog with Govt subsidy tags, soil-calibrated ML recommendations, and zero-commission harvest trading.'}
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="mt-8 space-y-2.5 max-w-md">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-emerald-600/20 hover:border-emerald-500/40 transition-colors">
              <Store className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">
                  {language === 'hi' ? 'दुकानदार POS काउंटर' : 'In-Store POS Counter'}
                </div>
                <div className="text-[11px] text-emerald-200/70">
                  {language === 'hi' ? 'बारकोड बिलिंग, ऑटो UPI QR व ग्रामीण उधार बही-खाता' : 'Barcode billing, dynamic UPI QR & farmer credit ledger'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-emerald-600/20 hover:border-emerald-500/40 transition-colors">
              <Sprout className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">
                  {language === 'hi' ? 'मृदा स्वास्थ्य व फसल AI' : 'Soil Health & Crop AI'}
                </div>
                <div className="text-[11px] text-emerald-200/70">
                  {language === 'hi' ? 'NPK मिट्टी जांच, मौसम व यूरिया-DAP की सही खुराक' : 'NPK soil testing, weather insights & optimal dosage'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-emerald-600/20 hover:border-emerald-500/40 transition-colors">
              <TrendingUp className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">
                  {language === 'hi' ? 'किसान मंडी ट्रेडिंग' : 'Kisan Mandi Marketplace'}
                </div>
                <div className="text-[11px] text-emerald-200/70">
                  {language === 'hi' ? 'सीधे फसल बेचें और पुराना खाद का उधार स्वतः चुकता करें' : 'Sell direct at MSP benchmarks and auto-settle fertilizer credit'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-6 border-t border-emerald-800/50 text-[11px] text-emerald-300/60 flex justify-between items-center">
          <span>FastAPI 8000 • React Vite 5173</span>
          <span className="text-emerald-300">v2.5 Email Auth Ready</span>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* Right Screen: Auth Modes (Demo Profiles | Email Login | Create Account) */}
      <div className="flex-1 p-6 lg:p-12 flex flex-col justify-between max-w-2xl mx-auto w-full">
        
        {/* Top Language Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            {language === 'hi' ? 'सुरक्षित प्रवेश पोर्टल' : 'Access Gateway'}
          </span>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200/80 bg-white hover:bg-emerald-50/50 text-xs font-bold text-stone-700 shadow-2xs transition-all cursor-pointer"
          >
            <span className="text-emerald-600 font-bold">🌐</span>
            <span className={language === 'en' ? 'text-emerald-800 font-black bg-emerald-100/70 px-1.5 py-0.5 rounded-md border border-emerald-300/60' : 'text-stone-400'}>English</span>
            <span className="text-stone-300">/</span>
            <span className={language === 'hi' ? 'text-emerald-800 font-black bg-emerald-100/70 px-1.5 py-0.5 rounded-md border border-emerald-300/60' : 'text-stone-400'}>Hinglish</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="my-auto py-6 space-y-6">
          
          {/* 3 Main Action Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#EDE9E3] rounded-2xl border border-stone-300/60">
            <button
              onClick={() => {
                setActiveTab('demo');
                setLoginError('');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'demo'
                  ? 'bg-white text-emerald-950 shadow-xs font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>⚡ 1-Click Demo</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('email');
                setLoginError('');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white text-emerald-950 shadow-xs font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              <span>Email Login</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('register');
                setLoginError('');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-emerald-950 shadow-xs font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Create Account</span>
            </button>
          </div>

          {/* TAB 1: 1-Click Demo Profiles */}
          {activeTab === 'demo' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl lg:text-2xl font-black text-stone-900 tracking-tight">
                  {language === 'hi' ? 'प्रवेश हेतु अपनी भूमिका चुनें' : 'Choose Your Demo Profile'}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5 font-medium">
                  {language === 'hi' 
                    ? 'किसान अथवा दुकानदार पोर्टल में 1-क्लिक में सीधे प्रवेश करें।' 
                    : '1-click instant login to test either Farmer Portal or Retailer POS.'}
                </p>
              </div>

              <div className="space-y-3">
                {/* 1. Ramesh Kumar (Farmer) */}
                <div
                  onClick={() => loginAs('ramesh')}
                  className="p-4 rounded-2xl border-2 border-amber-200/80 bg-[#FFFDF9] hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      👨‍🌾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                          Ramesh Kumar <span className="font-normal text-stone-500 text-xs">({language === 'hi' ? 'रमेश कुमार' : 'Farmer'})</span>
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                          {language === 'hi' ? 'किसान' : 'Farmer'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                        <span className="text-emerald-700 font-bold">ramesh@agriretail.in</span>
                        <span>•</span>
                        <span>📍 Karnal, Haryana (Wheat/Mustard)</span>
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* 2. Sunita Devi (Farmer) */}
                <div
                  onClick={() => loginAs('sunita')}
                  className="p-4 rounded-2xl border-2 border-emerald-200/80 bg-[#F0FDF4]/50 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      👩‍🌾
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                          Sunita Devi <span className="font-normal text-stone-500 text-xs">({language === 'hi' ? 'सुनीता देवी' : 'Farmer'})</span>
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {language === 'hi' ? 'किसान' : 'Farmer'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                        <span className="text-emerald-700 font-bold">sunita@agriretail.in</span>
                        <span>•</span>
                        <span>📍 Indore, MP (Soybean/Cotton)</span>
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>

                {/* 3. Rajendra Sharma (Retailer) */}
                <div
                  onClick={() => loginAs('rajendra')}
                  className="p-4 rounded-2xl border-2 border-sky-200/80 bg-[#F0F9FF]/50 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      🏪
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                          Rajendra Sharma <span className="font-normal text-stone-500 text-xs">({language === 'hi' ? 'राजेन्द्र शर्मा' : 'Store Owner'})</span>
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-900 border border-sky-300">
                          {language === 'hi' ? 'दुकानदार POS' : 'Retailer POS'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                        <span className="text-emerald-700 font-bold">rajendra@agriretail.in</span>
                        <span>•</span>
                        <span>🏪 Sharma Krishi Seva Kendra, Karnal</span>
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Email & Password Login */}
          {activeTab === 'email' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-200/70 shadow-sm space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-700" />
                  <span>{language === 'hi' ? 'ईमेल से लॉगिन करें' : 'Sign In with Email'}</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {language === 'hi' 
                    ? 'अपनी ईमेल आईडी और पासवर्ड दर्ज करें अथवा नीचे दिए गए त्वरित डेमो खाते चुनें।' 
                    : 'Enter your email address and password, or click a quick demo account below.'}
                </p>
              </div>

              {/* Quick autofill helper chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Quick Demo Autofill:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => autofillDemoEmail('ramesh@agriretail.in')}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#FEF9C3]/80 hover:bg-[#FEF3C7] text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                  >
                    👨‍🌾 ramesh@agriretail.in
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillDemoEmail('sunita@agriretail.in')}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#ECFDF5] hover:bg-[#D1FAE5] text-emerald-900 border border-emerald-300 transition-colors cursor-pointer"
                  >
                    👩‍🌾 sunita@agriretail.in
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillDemoEmail('rajendra@agriretail.in')}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#F0F9FF] hover:bg-[#E0F2FE] text-sky-900 border border-sky-300 transition-colors cursor-pointer"
                  >
                    🏪 rajendra@agriretail.in
                  </button>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                    {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ramesh@agriretail.in"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                    {language === 'hi' ? 'पासवर्ड' : 'Password'} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{language === 'hi' ? 'ईमेल से प्रवेश करें' : 'Sign In with Email'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-xs text-emerald-700 hover:underline font-bold"
                  >
                    {language === 'hi' ? 'खाता नहीं है? नया खाता बनाएं →' : "Don't have an account? Create one now →"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Create New Account (Register New User) */}
          {activeTab === 'register' && (
            <div className="bg-white p-6 rounded-3xl border border-emerald-200/70 shadow-sm space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-700" />
                  <span>{language === 'hi' ? 'नया खाता बनाएं' : 'Create New Account'}</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  {language === 'hi' 
                    ? 'किसान अथवा केंद्र संचालक के रूप में ईमेल से तुरंत पंजीकरण करें।' 
                    : 'Register as a Farmer or Kendra Retailer with your email.'}
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* 1. Choose Account Role */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    1. Select Role *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => setRegRole('farmer')}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        regRole === 'farmer'
                          ? 'border-emerald-600 bg-[#ECFDF5] shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-[#FAF8F5]'
                      }`}
                    >
                      <span className="text-2xl">👨‍🌾</span>
                      <div>
                        <div className="font-bold text-xs text-stone-900">Farmer (किसान)</div>
                        <div className="text-[10px] text-stone-500">Shop seeds & soil AI</div>
                      </div>
                    </div>

                    <div
                      onClick={() => setRegRole('retailer')}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        regRole === 'retailer'
                          ? 'border-sky-600 bg-[#F0F9FF] shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-[#FAF8F5]'
                      }`}
                    >
                      <span className="text-2xl">🏪</span>
                      <div>
                        <div className="font-bold text-xs text-stone-900">Retailer (दुकानदार)</div>
                        <div className="text-[10px] text-stone-500">Counter POS & catalog</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Personal & Email Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      placeholder={regRole === 'farmer' ? "e.g. Vikram Singh" : "e.g. Arjun Patel"}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="vikram@agriretail.in"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                    Set Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                  />
                </div>

                {/* 3. Location Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                      State (राज्य)
                    </label>
                    <select
                      value={regForm.state}
                      onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                      District (जिला)
                    </label>
                    <input
                      type="text"
                      value={regForm.district}
                      onChange={(e) => setRegForm({ ...regForm, district: e.target.value })}
                      placeholder="e.g. Karnal"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                {/* 4. Role-Specific Fields */}
                {regRole === 'farmer' ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                        Land Area (Acres)
                      </label>
                      <input
                        type="text"
                        value={regForm.landArea}
                        onChange={(e) => setRegForm({ ...regForm, landArea: e.target.value })}
                        placeholder="e.g. 5.0"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                        Main Crops
                      </label>
                      <input
                        type="text"
                        value={regForm.cropFocus}
                        onChange={(e) => setRegForm({ ...regForm, cropFocus: e.target.value })}
                        placeholder="e.g. Wheat & Paddy"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                        Kendra / Store Name
                      </label>
                      <input
                        type="text"
                        value={regForm.storeName}
                        onChange={(e) => setRegForm({ ...regForm, storeName: e.target.value })}
                        placeholder="e.g. Kisan Seva Kendra"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                        GSTIN / License (Optional)
                      </label>
                      <input
                        type="text"
                        value={regForm.gstin}
                        onChange={(e) => setRegForm({ ...regForm, gstin: e.target.value })}
                        placeholder="06AAACS1234K1Z5"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-[#FAF8F5]"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={regSuccess}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {regSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Account Created! Launching Portal...</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'hi' ? 'खाता बनाएं व पोर्टल शुरू करें' : 'Create Account & Launch Portal'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Bottom Switch Note */}
        <div className="text-center text-xs text-stone-400">
          🔒 Secured with Email-Based Role Access • Local & Cloud Sync
        </div>

      </div>

    </div>
  );
};

export default LoginPage;
