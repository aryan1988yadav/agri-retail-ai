import React, { useState } from 'react';
import { 
  CheckCircle2, Sparkles, ShoppingCart, Award, Calendar, 
  Droplets, TrendingUp, Info, ArrowRight, ShieldCheck, FileText 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const CROP_THEMES = {
  wheat: {
    name: 'Wheat (Gehun)',
    hindi: 'गेहूँ',
    titleBadge: '🌾 Sunehri Fasal (Golden Harvest) • Rabi Champion',
    gradient: 'from-amber-600 via-amber-500 to-yellow-600',
    ambientBg: 'bg-gradient-to-br from-amber-50 via-yellow-50/60 to-stone-50',
    borderColor: 'border-amber-300',
    accentText: 'text-amber-900',
    accentBg: 'bg-amber-100',
    iconEmoji: '🌾',
    variety: 'Shriram Super 303 / HD-2967',
    seedProduct: {
      id: 6,
      name: 'Shriram Super 303 Wheat Seeds',
      brand: 'Shriram Farm Solutions',
      price: 1650.00,
      unit: '40kg Bag',
      stock_quantity: 50
    },
    sowingWindow: '1 Nov – 25 Nov',
    idealTemp: '15°C – 22°C',
    yieldExpectation: '22 – 25 Quintal / Acre',
    waterNeeds: '4-5 Irrigations (Crown root stage is vital)',
    soilNote: 'Rich alluvial/loamy soil with neutral pH is optimal for high tillering.'
  },
  mustard: {
    name: 'Mustard (Sarson)',
    hindi: 'सरसों',
    titleBadge: '🌼 High-Oil Winter Cash Crop • Low Water Need',
    gradient: 'from-yellow-500 via-amber-400 to-yellow-600',
    ambientBg: 'bg-gradient-to-br from-yellow-50 via-amber-50/50 to-stone-50',
    borderColor: 'border-yellow-300',
    accentText: 'text-yellow-950',
    accentBg: 'bg-yellow-100',
    iconEmoji: '🌼',
    variety: 'Pusa Bold / Pioneer 45S46',
    seedProduct: null,
    sowingWindow: '15 Oct – 31 Oct',
    idealTemp: '15°C – 25°C',
    yieldExpectation: '10 – 14 Quintal / Acre',
    waterNeeds: '2 Irrigations only (Drought tolerant)',
    soilNote: 'Prefers well-drained sandy loam. Protect flowers from early winter aphids.'
  },
  rice: {
    name: 'Rice / Paddy (Dhaan)',
    hindi: 'धान',
    titleBadge: '🌾 High-Yield Monsoon Kharif Staple',
    gradient: 'from-emerald-700 via-teal-700 to-emerald-800',
    ambientBg: 'bg-gradient-to-br from-emerald-50 via-teal-50/60 to-stone-50',
    borderColor: 'border-emerald-300',
    accentText: 'text-emerald-950',
    accentBg: 'bg-emerald-100',
    iconEmoji: '🌾',
    variety: 'Bayer Arize 6444 Gold / PR-126 Basmati',
    seedProduct: {
      id: 7,
      name: 'Bayer Arize 6444 Gold Hybrid Paddy Seeds',
      brand: 'Bayer CropScience',
      price: 920.00,
      unit: '3kg Pack',
      stock_quantity: 38
    },
    sowingWindow: 'Transplant 21-day seedlings in July',
    idealTemp: '25°C – 35°C',
    yieldExpectation: '26 – 32 Quintal / Acre',
    waterNeeds: 'Standing water required during tillering',
    soilNote: 'Heavy clay or clay-loam soils holding moisture give maximum yield.'
  },
  cotton: {
    name: 'Cotton (Kapas)',
    hindi: 'कपास',
    titleBadge: '☁️ Safed Sona (White Gold) • Premium Mandi Cash Crop',
    gradient: 'from-slate-700 via-zinc-700 to-emerald-800',
    ambientBg: 'bg-gradient-to-br from-slate-50 via-stone-50 to-emerald-50/50',
    borderColor: 'border-slate-300',
    accentText: 'text-slate-900',
    accentBg: 'bg-slate-100',
    iconEmoji: '☁️',
    variety: 'Mahyco Bollgard-II (BG-II) Hybrid',
    seedProduct: {
      id: 8,
      name: 'Mahyco Bollgard-II Cotton Seeds',
      brand: 'Mahyco',
      price: 864.00,
      unit: '450g Pack',
      stock_quantity: 30
    },
    sowingWindow: 'May – June (Pre-monsoon sowing)',
    idealTemp: '28°C – 38°C',
    yieldExpectation: '12 – 16 Quintal / Acre',
    waterNeeds: 'Deep rooting, avoid waterlogging',
    soilNote: 'Deep Black Cotton Soils (Regur) with good drainage are ideal.'
  },
  maize: {
    name: 'Maize (Makka)',
    hindi: 'मक्का',
    titleBadge: '🌽 Multi-Purpose High Starch Cereal',
    gradient: 'from-amber-500 via-yellow-500 to-amber-700',
    ambientBg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-stone-50',
    borderColor: 'border-amber-300',
    accentText: 'text-amber-950',
    accentBg: 'bg-amber-100',
    iconEmoji: '🌽',
    variety: 'Pioneer P3302 Yellow Hybrid',
    seedProduct: {
      id: 5,
      name: 'Pioneer P3302 Hybrid Maize Seeds',
      brand: 'Pioneer',
      price: 850.00,
      unit: '4kg Pack',
      stock_quantity: 45
    },
    sowingWindow: 'June – July (Kharif) or Oct (Rabi)',
    idealTemp: '21°C – 32°C',
    yieldExpectation: '25 – 30 Quintal / Acre',
    waterNeeds: 'Regular moisture at silking and tasseling',
    soilNote: 'Well-aerated fertile loam with rich organic matter.'
  },
  soybean: {
    name: 'Soybean (Soyabean)',
    hindi: 'सोयाबीन',
    titleBadge: '🌱 Malwa Black Gold • High Protein & Oil',
    gradient: 'from-emerald-700 via-green-600 to-lime-700',
    ambientBg: 'bg-gradient-to-br from-emerald-50 via-lime-50/50 to-stone-50',
    borderColor: 'border-emerald-300',
    accentText: 'text-emerald-950',
    accentBg: 'bg-emerald-100',
    iconEmoji: '🌱',
    variety: 'JS 9560 / JS 2034',
    seedProduct: null,
    sowingWindow: '20 June – 10 July (Kharif onset)',
    idealTemp: '25°C – 32°C',
    yieldExpectation: '10 – 14 Quintal / Acre',
    waterNeeds: 'Monsoon rainfall dependent (300-400mm)',
    soilNote: 'Fixes atmospheric nitrogen. Needs fertile black loam with Rhizobium.'
  },
  chickpea: {
    name: 'Chickpea (Chana)',
    hindi: 'चना',
    titleBadge: '🫘 Soil-Rejuvenating Rabi Pulse',
    gradient: 'from-amber-700 via-orange-800 to-stone-800',
    ambientBg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-stone-50',
    borderColor: 'border-amber-300',
    accentText: 'text-amber-950',
    accentBg: 'bg-amber-100',
    iconEmoji: '🫘',
    variety: 'Desi Chana JG-11 / Vishal',
    seedProduct: {
      id: 10,
      name: 'Desi Chana (Chickpea) Seeds - JG 11',
      brand: 'National Seeds Corp',
      price: 950.00,
      unit: '10kg Bag',
      stock_quantity: 30
    },
    sowingWindow: '15 Oct – 15 Nov',
    idealTemp: '16°C – 24°C',
    yieldExpectation: '8 – 12 Quintal / Acre',
    waterNeeds: '1-2 light irrigations at pod development',
    soilNote: 'Thrives in medium-to-deep black or sandy loams.'
  }
};

const getMatchingTheme = (cropName = '') => {
  const c = cropName.toLowerCase();
  for (const [key, theme] of Object.entries(CROP_THEMES)) {
    if (c.includes(key) || (theme.hindi && c.includes(theme.hindi.toLowerCase()))) {
      return theme;
    }
  }
  // Default Agri Theme
  return {
    name: cropName,
    hindi: 'अनुशंसित फसल',
    titleBadge: '🌱 Agro-Climatically Optimized Crop',
    gradient: 'from-emerald-700 to-green-800',
    ambientBg: 'bg-gradient-to-br from-emerald-50 to-stone-50',
    borderColor: 'border-emerald-300',
    accentText: 'text-emerald-950',
    accentBg: 'bg-emerald-100',
    iconEmoji: '🌱',
    variety: 'Certified State Agricultural University Recommended Variety',
    seedProduct: null,
    sowingWindow: 'Seasonal window as per state agro-climatic zone',
    idealTemp: 'Moderate',
    yieldExpectation: 'High Yield Potential',
    waterNeeds: 'Standard regional irrigation schedule',
    soilNote: 'Suitable for test soil NPK levels.'
  };
};

const CropThemedCard = ({ cropResult, onOpenShcModal }) => {
  const { addToCart } = useCart();
  const [reserved, setReserved] = useState(false);

  if (!cropResult) return null;

  const theme = getMatchingTheme(cropResult.recommended_crop);
  const confidencePercent = Math.round((cropResult.confidence || 0.95) * 100);

  const handleReserveSeed = () => {
    if (theme.seedProduct) {
      addToCart(theme.seedProduct, 2);
      setReserved(true);
      setTimeout(() => setReserved(false), 4000);
    }
  };

  return (
    <div className={`rounded-3xl border ${theme.borderColor} ${theme.ambientBg} shadow-lg shadow-stone-200/50 overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}>
      
      {/* 1. Ambient Banner Morphing to Crop Theme */}
      <div className={`p-6 sm:p-8 bg-gradient-to-r ${theme.gradient} text-white relative overflow-hidden`}>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Animated Large Crop Motif */}
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-inner shrink-0 hover:scale-110 transition-transform">
              {theme.iconEmoji}
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider border border-white/20 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{theme.titleBadge}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {cropResult.recommended_crop}
              </h2>
              <div className="text-sm font-bold text-white/90 mt-0.5 flex items-center gap-2">
                <span>{cropResult.hindi_name || theme.hindi}</span>
                <span>•</span>
                <span className="text-white/80 font-medium">{cropResult.state || 'Haryana'} ({cropResult.season || 'Rabi'})</span>
              </div>
            </div>
          </div>

          {/* AI Suitability Gauge */}
          <div className="bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 min-w-[130px]">
            <div className="text-[11px] uppercase tracking-wider text-white/80 font-bold">Soil AI Match</div>
            <div className="text-3xl font-black text-amber-300 mt-0.5">
              {confidencePercent}%
            </div>
            <div className="text-[10px] text-emerald-200 mt-1 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>Optimal Choice</span>
            </div>
          </div>
        </div>

        {/* Ambient decorative glow */}
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* 2. Key Agronomy Blueprint */}
      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Sowing Window</span>
            </div>
            <div className="text-stone-900 font-extrabold text-base mt-1.5">
              {theme.sowingWindow}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Ideal Temp: {theme.idealTemp}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Expected Harvest</span>
            </div>
            <div className="text-stone-900 font-extrabold text-base mt-1.5">
              {theme.yieldExpectation}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Govt Mandi MSP: ₹2,275/Q
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-stone-500 text-xs font-bold uppercase tracking-wider">
              <Droplets className="w-4 h-4 text-emerald-700" />
              <span>Water Schedule</span>
            </div>
            <div className="text-stone-900 font-extrabold text-base mt-1.5">
              {theme.waterNeeds}
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Pre-sowing Rauni required
            </div>
          </div>

        </div>

        {/* Soil Match Commentary */}
        <div className="p-4 rounded-2xl bg-white/80 border border-stone-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-stone-700">
              Soil Nutrient Compatibility Advisory
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mt-1">
              {cropResult.soil_suitability_tips || theme.soilNote}
            </p>
          </div>
        </div>

        {/* 3. In-Store Certified Seed Link (From Prediction ➔ In-Store Purchase) */}
        {theme.seedProduct && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-green-900 to-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
                🌱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-400 text-emerald-950">
                    Recommended Seed in Stock
                  </span>
                  <span className="text-xs text-emerald-200">
                    {theme.seedProduct.stock_quantity} bags left at Kendra
                  </span>
                </div>
                <h4 className="font-extrabold text-base sm:text-lg text-white mt-1">
                  {theme.seedProduct.name}
                </h4>
                <p className="text-xs text-stone-300">
                  {theme.seedProduct.brand} • ₹{theme.seedProduct.price} / {theme.seedProduct.unit}
                </p>
              </div>
            </div>

            <button
              onClick={handleReserveSeed}
              className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all shrink-0 ${
                reserved
                  ? 'bg-emerald-400 text-emerald-950 scale-95'
                  : 'bg-white text-emerald-950 hover:bg-emerald-50 hover:scale-105 active:scale-95'
              }`}
            >
              {reserved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                  <span>Reserved in Cart (2 Bags)!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-emerald-700" />
                  <span>Reserve Seed (खाते पर आरक्षित करें)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Official Soil Health Card CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 border-t border-stone-200">
          <span>Official ICAR Soil Calibration complete for {cropResult.state || 'Haryana'}.</span>
          {onOpenShcModal && (
            <button
              onClick={onOpenShcModal}
              className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-4 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Official Soil Health Card (SHC)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CropThemedCard;
