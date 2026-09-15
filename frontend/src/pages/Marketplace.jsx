import React, { useState, useEffect } from 'react';
import { 
  Search, Mic, MicOff, Sprout, ShoppingBag, 
  TrendingUp, CloudRain, Sun, ChevronRight, 
  Sparkles, RefreshCw, Filter, Layers, Check 
} from 'lucide-react';
import { getProducts, getCategories } from '../services/api';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../utils/translations';
import ProductCard from '../components/ProductCard';
import ProductDetailDrawer from '../components/ProductDetailDrawer';
import KisanMandi from '../components/KisanMandi';

const CROP_SUBFILTERS = {
  all: ['All Crops', 'Wheat', 'Rice', 'Maize', 'Cotton', 'Tomato', 'Sugarcane', 'Chickpea'],
  seeds: ['All Seeds', 'Wheat', 'Rice', 'Cotton', 'Maize', 'Tomato', 'Chickpea'],
  fertilizers: ['All Fertilizers', 'Urea', 'DAP', 'Potash', 'NPK Complex', 'Zinc'],
  protection: ['All Chemicals', 'Insecticide', 'Fungicide', 'Weedicide', 'Stem Borer'],
  bio: ['All Bio', 'Neem Oil', 'Bio-Fertilizer', 'Growth Stimulant']
};

const Marketplace = ({ onNavigateToPrediction }) => {
  const { currentPersona, language } = useUser();
  const { t } = useTranslation(language);

  const [marketplaceMode, setMarketplaceMode] = useState('inputs'); // 'inputs' | 'mandi'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active Category & Subfilters
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const [voiceToast, setVoiceToast] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchFilteredProducts();
  }, [selectedCategory, selectedCrop, searchQuery]);

  const fetchInitialData = async () => {
    try {
      const [catsRes, prodsRes] = await Promise.all([
        getCategories(),
        getProducts()
      ]);
      setCategories(catsRes.data);
      setProducts(prodsRes.data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend server. Make sure FastAPI is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredProducts = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedCrop && !selectedCrop.startsWith('All')) params.crop = selectedCrop;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await getProducts(params);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Browser-native Voice Search ("Bol Kar Khojein")
  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search requires Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceToast(language === 'hi' ? '🎙️ बोलिए... ("यूरिया", "गेहूँ बीज")' : '🎙️ Speak now... ("Urea", "Wheat Seeds")');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setVoiceToast(`✓ ${transcript}`);
        setTimeout(() => setVoiceToast(''), 3000);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceToast(language === 'hi' ? '⚠️ दोबारा बोलें' : '⚠️ Try speaking again');
        setTimeout(() => setVoiceToast(''), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Get active subfilters based on category
  const activeSubfilters = selectedCategory === 2 ? CROP_SUBFILTERS.seeds :
                          selectedCategory === 1 ? CROP_SUBFILTERS.fertilizers :
                          selectedCategory === 3 ? CROP_SUBFILTERS.protection :
                          selectedCategory === 4 ? CROP_SUBFILTERS.bio :
                          CROP_SUBFILTERS.all;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300 font-sans">
      
      {/* 1. Regional Weather & Advisory Banner (Minimalist & Warm) */}
      <div className="bg-gradient-to-r from-[#F0FDF4] via-[#FAF8F5] to-[#FFFDF9] rounded-3xl border border-emerald-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-emerald-800 border border-emerald-300/70 flex items-center justify-center shrink-0 shadow-2xs">
            {currentPersona.state === 'Haryana' ? (
              <CloudRain className="w-6 h-6 text-emerald-700" />
            ) : (
              <Sun className="w-6 h-6 text-amber-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-950 bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-md">
                📍 {currentPersona.district}, {currentPersona.state}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                {currentPersona.state === 'Haryana' ? '21°C • Light Drizzle' : '28°C • Sunny Clear'}
              </span>
            </div>
            <p className="text-xs text-stone-700 font-medium mt-1">
              {currentPersona.state === 'Haryana'
                ? (language === 'hi' 
                    ? '🌾 रबी बुवाई: श्रीराम 303 गेहूँ बीज की बुवाई का सर्वोत्तम समय सक्रिय है। खेत तैयार करें।' 
                    : '🌾 Rabi Sowing Alert: Optimal window for Shriram Super 303 Wheat sowing is active.')
                : (language === 'hi'
                    ? '🌱 सोयाबीन कटाई पूर्ण करें; रबी चना व गेहूँ हेतु खेत तैयार रखें।'
                    : '🌱 Harvest Alert: Complete Soybean threshing. Ready fields for Rabi gram/wheat.')}
            </p>
          </div>
        </div>

        {/* 1-Tap Shortcut to Crop Predictor */}
        <button
          onClick={onNavigateToPrediction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs shadow-xs transition-all shrink-0 cursor-pointer"
        >
          <Sprout className="w-4 h-4 text-emerald-400" />
          <span>{t.cropDoctor}</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        </button>
      </div>

      {/* 2. Top Mode Switcher (Inputs vs Mandi) */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex p-1.5 rounded-2xl bg-[#EDE8E1] border border-stone-300/70">
          <button
            onClick={() => setMarketplaceMode('inputs')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              marketplaceMode === 'inputs'
                ? 'bg-[#FCFAF7] text-emerald-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
            <span>{t.shopInputs}</span>
          </button>
          <button
            onClick={() => setMarketplaceMode('mandi')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              marketplaceMode === 'mandi'
                ? 'bg-[#FCFAF7] text-amber-950 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>{t.kisanMandi}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase">
              MSP
            </span>
          </button>
        </div>

        {/* Search Bar with Voice */}
        {marketplaceMode === 'inputs' && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={language === 'hi' ? 'खोजें "यूरिया", "गेहूँ बीज", "DAP"...' : 'Search "Urea", "Wheat", "DAP"...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2.5 rounded-2xl bg-[#FCFAF7] border border-[#E0DBD2] text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            <button
              onClick={startVoiceSearch}
              disabled={isListening}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
              title="बोल कर खोजें (Voice Search)"
            >
              {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-emerald-700" />}
              <span>{isListening ? '...' : (language === 'hi' ? 'बोलें' : 'Voice')}</span>
            </button>
          </div>
        )}
      </div>

      {voiceToast && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
          <span>{voiceToast}</span>
        </div>
      )}

      {/* 3. Conditional Mandi vs. Laptop Desktop Aisles View */}
      {marketplaceMode === 'mandi' ? (
        <KisanMandi />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR: DESKTOP AISLES (Blinkit Style & Warm Linen) */}
          <div className="lg:col-span-3 bg-[#FAF7F2] rounded-3xl border border-[#E8E3DA] p-4 shadow-xs space-y-1.5 sticky top-20">
            <div className="px-3 py-2 text-xs font-black uppercase tracking-wider text-stone-500 border-b border-stone-200/80 mb-2 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'hi' ? 'दुकान के विभाग (Aisles)' : 'Store Aisles'}</span>
            </div>

            {/* All Inputs Option */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedCrop('All Crops');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                selectedCategory === null
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-700 hover:bg-emerald-50/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span>🛒</span>
                <span>{t.allInputs}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedCategory === null ? 'bg-emerald-950 text-emerald-200' : 'bg-[#EDE8E0] text-stone-600'}`}>
                {products.length}
              </span>
            </button>

            {/* Categories Aisles */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = products.filter(p => p.category_id === cat.id).length;
              const iconEmoji = cat.id === 1 ? '🧪' : cat.id === 2 ? '🌱' : cat.id === 3 ? '🛡️' : cat.id === 4 ? '🌿' : '🔧';

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedCrop('All Crops');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-emerald-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{iconEmoji}</span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${isSelected ? 'bg-emerald-950 text-emerald-200' : 'bg-[#EDE8E0] text-stone-600'}`}>
                    {count || 4}
                  </span>
                </button>
              );
            })}
          </div>

          {/* RIGHT MAIN AREA: SUBFILTERS & CLEAN PRODUCT GRID */}
          <div className="lg:col-span-9 space-y-4">
            
            {/* Top Sub-filters Chips for Selected Aisle */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {activeSubfilters.map((chip, i) => {
                const isActive = selectedCrop === chip || (chip.startsWith('All') && selectedCrop === 'All Crops');
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedCrop(chip)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-[#FCFAF7] text-stone-700 hover:bg-emerald-50/60 border border-[#E8E2D8]'
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="py-24 text-center text-stone-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
                <p className="text-xs font-bold">Loading verified inputs...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-stone-200 p-8">
                <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-stone-800">No products match this aisle</h3>
                <p className="text-xs text-stone-400 mt-1">Try resetting search filters.</p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedCrop('All Crops');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold cursor-pointer"
                >
                  Reset Aisle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Right Slide-Over Product Detail Drawer */}
      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

    </div>
  );
};

export default Marketplace;
