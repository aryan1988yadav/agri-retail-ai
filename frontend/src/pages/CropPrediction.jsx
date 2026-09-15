import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, Sparkles, Droplets, Thermometer, Wind, FlaskConical, 
  CloudRain, CheckCircle2, ArrowRight, ShoppingCart, Info, RotateCcw, 
  Award, FileText, MapPin, ChevronDown, ChevronUp, SlidersHorizontal 
} from 'lucide-react';
import { predictCrop, adviseFertilizer } from '../services/api';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../utils/translations';
import SoilHealthCardModal from '../components/SoilHealthCardModal';
import CropThemedCard from '../components/CropThemedCard';

const INDIAN_STATES = [
  'Haryana',
  'Punjab',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Rajasthan',
  'Maharashtra',
  'Gujarat',
  'Bihar',
  'West Bengal',
  'Andhra Pradesh',
  'Tamil Nadu',
  'Karnataka'
];

const SEASONS = [
  { id: 'Rabi', label: '❄️ Rabi', sub: 'Oct - Mar', desc: 'Wheat, Mustard, Gram, Barley' },
  { id: 'Kharif', label: '🌧️ Kharif', sub: 'Jun - Oct', desc: 'Paddy, Cotton, Soybean, Maize' },
  { id: 'Zaid', label: '☀️ Zaid', sub: 'Mar - Jun', desc: 'Moong Dal, Watermelon' }
];

const STATE_SEASON_CALIBRATION = {
  Haryana: {
    Rabi: { temp: 15.5, humidity: 55, rainfall: 35, ph: 7.4, nitrogen: 120, phosphorus: 50, potassium: 40 },
    Kharif: { temp: 29.5, humidity: 72, rainfall: 140, ph: 7.4, nitrogen: 90, phosphorus: 45, potassium: 30 },
    Zaid: { temp: 33.0, humidity: 45, rainfall: 20, ph: 7.3, nitrogen: 60, phosphorus: 35, potassium: 30 }
  },
  Punjab: {
    Rabi: { temp: 14.8, humidity: 58, rainfall: 40, ph: 7.2, nitrogen: 125, phosphorus: 55, potassium: 40 },
    Kharif: { temp: 29.0, humidity: 75, rainfall: 160, ph: 7.2, nitrogen: 100, phosphorus: 45, potassium: 35 },
    Zaid: { temp: 32.5, humidity: 48, rainfall: 25, ph: 7.2, nitrogen: 60, phosphorus: 35, potassium: 30 }
  },
  'Uttar Pradesh': {
    Rabi: { temp: 16.5, humidity: 60, rainfall: 30, ph: 7.0, nitrogen: 115, phosphorus: 50, potassium: 40 },
    Kharif: { temp: 28.5, humidity: 78, rainfall: 180, ph: 6.9, nitrogen: 85, phosphorus: 45, potassium: 35 },
    Zaid: { temp: 34.0, humidity: 50, rainfall: 25, ph: 7.0, nitrogen: 55, phosphorus: 35, potassium: 25 }
  },
  'Madhya Pradesh': {
    Rabi: { temp: 18.0, humidity: 45, rainfall: 20, ph: 7.3, nitrogen: 110, phosphorus: 50, potassium: 35 },
    Kharif: { temp: 26.5, humidity: 75, rainfall: 185, ph: 7.1, nitrogen: 30, phosphorus: 70, potassium: 50 },
    Zaid: { temp: 35.0, humidity: 35, rainfall: 15, ph: 7.2, nitrogen: 50, phosphorus: 30, potassium: 25 }
  },
  Rajasthan: {
    Rabi: { temp: 17.0, humidity: 40, rainfall: 15, ph: 7.8, nitrogen: 75, phosphorus: 40, potassium: 35 },
    Kharif: { temp: 32.0, humidity: 52, rainfall: 75, ph: 7.7, nitrogen: 50, phosphorus: 30, potassium: 25 },
    Zaid: { temp: 37.0, humidity: 28, rainfall: 10, ph: 7.8, nitrogen: 45, phosphorus: 25, potassium: 20 }
  },
  Maharashtra: {
    Rabi: { temp: 21.0, humidity: 50, rainfall: 15, ph: 7.2, nitrogen: 100, phosphorus: 45, potassium: 35 },
    Kharif: { temp: 27.0, humidity: 80, rainfall: 190, ph: 7.0, nitrogen: 115, phosphorus: 48, potassium: 25 },
    Zaid: { temp: 33.0, humidity: 55, rainfall: 20, ph: 7.1, nitrogen: 60, phosphorus: 30, potassium: 30 }
  },
  Gujarat: {
    Rabi: { temp: 20.5, humidity: 48, rainfall: 10, ph: 7.5, nitrogen: 100, phosphorus: 45, potassium: 35 },
    Kharif: { temp: 28.5, humidity: 74, rainfall: 130, ph: 7.4, nitrogen: 110, phosphorus: 45, potassium: 25 },
    Zaid: { temp: 34.5, humidity: 45, rainfall: 15, ph: 7.5, nitrogen: 55, phosphorus: 30, potassium: 25 }
  },
  Bihar: {
    Rabi: { temp: 17.5, humidity: 62, rainfall: 25, ph: 7.1, nitrogen: 110, phosphorus: 48, potassium: 35 },
    Kharif: { temp: 28.0, humidity: 82, rainfall: 200, ph: 6.8, nitrogen: 85, phosphorus: 45, potassium: 30 },
    Zaid: { temp: 33.5, humidity: 55, rainfall: 30, ph: 7.0, nitrogen: 55, phosphorus: 30, potassium: 25 }
  }
};

const SAMPLE_PRESETS = [
  {
    name: '🌾 HR/PB Wheat',
    state: 'Haryana',
    season: 'Rabi',
    data: { state: 'Haryana', season: 'Rabi', nitrogen: 120, phosphorus: 50, potassium: 40, temperature: 15.5, humidity: 55, ph: 7.4, rainfall: 35 }
  },
  {
    name: '🌿 MP Soybean',
    state: 'Madhya Pradesh',
    season: 'Kharif',
    data: { state: 'Madhya Pradesh', season: 'Kharif', nitrogen: 30, phosphorus: 70, potassium: 50, temperature: 26.5, humidity: 76, ph: 7.1, rainfall: 185 }
  },
  {
    name: '🌾 PB Basmati',
    state: 'Punjab',
    season: 'Kharif',
    data: { state: 'Punjab', season: 'Kharif', nitrogen: 100, phosphorus: 45, potassium: 35, temperature: 29.0, humidity: 75, ph: 7.2, rainfall: 160 }
  },
  {
    name: '🌼 RJ Mustard',
    state: 'Rajasthan',
    season: 'Rabi',
    data: { state: 'Rajasthan', season: 'Rabi', nitrogen: 75, phosphorus: 40, potassium: 35, temperature: 17.0, humidity: 40, ph: 7.8, rainfall: 15 }
  },
  {
    name: '🌿 MH Cotton',
    state: 'Maharashtra',
    season: 'Kharif',
    data: { state: 'Maharashtra', season: 'Kharif', nitrogen: 115, phosphorus: 48, potassium: 25, temperature: 27.0, humidity: 80, ph: 7.0, rainfall: 190 }
  }
];

const CropPrediction = () => {
  const { addToCart } = useCart();
  const { currentPersona, language } = useUser();
  const { t } = useTranslation(language);

  const [activeMode, setActiveMode] = useState('crop'); // 'crop' or 'fertilizer'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showShcModal, setShowShcModal] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const resultRef = useRef(null);

  // Crop Inputs
  const [cropInputs, setCropInputs] = useState({
    state: currentPersona?.state || 'Haryana',
    season: currentPersona?.activeSeason || 'Rabi',
    nitrogen: 120,
    phosphorus: 50,
    potassium: 40,
    temperature: 15.5,
    humidity: 55.0,
    ph: 7.4,
    rainfall: 35.0,
  });

  // Auto-calibrate when persona changes
  useEffect(() => {
    if (currentPersona && currentPersona.state && STATE_SEASON_CALIBRATION[currentPersona.state]) {
      const pSeason = currentPersona.activeSeason || 'Rabi';
      const cal = STATE_SEASON_CALIBRATION[currentPersona.state]?.[pSeason] || STATE_SEASON_CALIBRATION['Haryana']['Rabi'];
      setCropInputs({
        state: currentPersona.state,
        season: pSeason,
        temperature: cal.temp,
        humidity: cal.humidity,
        rainfall: cal.rainfall,
        ph: cal.ph,
        nitrogen: cal.nitrogen,
        phosphorus: cal.phosphorus,
        potassium: cal.potassium
      });
    }
  }, [currentPersona?.id]);

  const handleStateChange = (newState) => {
    const cal = STATE_SEASON_CALIBRATION[newState]?.[cropInputs.season] || STATE_SEASON_CALIBRATION['Haryana']['Rabi'];
    setCropInputs(prev => ({
      ...prev,
      state: newState,
      temperature: cal.temp,
      humidity: cal.humidity,
      rainfall: cal.rainfall,
      ph: cal.ph,
      nitrogen: cal.nitrogen,
      phosphorus: cal.phosphorus,
      potassium: cal.potassium
    }));
  };

  const handleSeasonChange = (newSeason) => {
    const cal = STATE_SEASON_CALIBRATION[cropInputs.state]?.[newSeason] || STATE_SEASON_CALIBRATION['Haryana'][newSeason];
    setCropInputs(prev => ({
      ...prev,
      season: newSeason,
      temperature: cal.temp,
      humidity: cal.humidity,
      rainfall: cal.rainfall,
      ph: cal.ph,
      nitrogen: cal.nitrogen,
      phosphorus: cal.phosphorus,
      potassium: cal.potassium
    }));
  };

  const [cropResult, setCropResult] = useState(null);

  // Fertilizer Inputs
  const [fertInputs, setFertInputs] = useState({
    target_crop: 'Wheat',
    soil_type: 'Loamy Soil',
    nitrogen: 35,
    phosphorus: 18,
    potassium: 22,
  });
  const [fertResult, setFertResult] = useState(null);

  const handleCropPredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await predictCrop(cropInputs);
      setCropResult(res.data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate crop recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleFertilizerAdvise = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await adviseFertilizer(fertInputs);
      setFertResult(res.data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to calculate fertilizer advisory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto px-4">
      {/* Page Header - Compact & Crisp for Laptop screens */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ICAR Machine Learning (97.5% Accuracy)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {t.cropDoctor}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Scientifically match your soil test with top-yielding seeds and in-stock fertilizers.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="bg-stone-200/70 p-1 rounded-xl flex items-center gap-1 border border-stone-300/60 shrink-0">
          <button
            onClick={() => setActiveMode('crop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'crop'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. {t.predictCrop}</span>
          </button>

          <button
            onClick={() => setActiveMode('fertilizer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'fertilizer'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. NPK Fertilizer</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Crop Recommendation - Side-by-Side Laptop Grid */}
      {activeMode === 'crop' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Compact Form (5 cols on laptop) */}
          <div className="lg:col-span-5 bg-[#FCFAF7] p-5 rounded-3xl border border-[#E8E2D8] shadow-xs space-y-4">
            
            {/* Indian State & Season Selector */}
            <div className="p-3.5 bg-[#ECFDF5]/80 rounded-2xl border border-emerald-300/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>State & Sowing Season</span>
                </label>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/80">
                  Auto-Calibrated
                </span>
              </div>

              {/* State Dropdown */}
              <div>
                <select
                  value={cropInputs.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-xl bg-white border border-emerald-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      📍 {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season Selection Pills */}
              <div className="grid grid-cols-3 gap-1.5">
                {SEASONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSeasonChange(s.id)}
                    className={`px-2 py-1.5 rounded-xl text-center text-xs font-bold transition-all border ${
                      cropInputs.season === s.id
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-stone-700 border-emerald-200 hover:bg-emerald-100/40'
                    }`}
                  >
                    <div>{s.label}</div>
                    <div className={`text-[9px] ${cropInputs.season === s.id ? 'text-emerald-100' : 'text-stone-400'}`}>
                      {s.sub}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Test Presets Chips */}
            <div>
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                Quick Real-Soil Presets:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCropInputs(preset.data)}
                    className="px-2 py-1 rounded-lg text-[11px] font-medium bg-[#FAF7F2] hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-stone-700 border border-[#E5E0D6] transition-colors cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCropPredict} className="space-y-3.5">
              {/* N-P-K Nutrients in 1 Compact Row */}
              <div>
                <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>Soil Nutrients (kg/ha)</span>
                  <span className="text-[10px] text-stone-400 font-normal">From Soil Health Card</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2DDD5] focus-within:border-emerald-500">
                    <label className="text-[10px] font-bold text-stone-500 block">N (Nitrogen)</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      step="1"
                      value={cropInputs.nitrogen}
                      onChange={(e) => setCropInputs({ ...cropInputs, nitrogen: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-transparent font-black text-stone-900 text-base focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2DDD5] focus-within:border-emerald-500">
                    <label className="text-[10px] font-bold text-stone-500 block">P (Phosphorus)</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      step="1"
                      value={cropInputs.phosphorus}
                      onChange={(e) => setCropInputs({ ...cropInputs, phosphorus: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-transparent font-black text-stone-900 text-base focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E2DDD5] focus-within:border-emerald-500">
                    <label className="text-[10px] font-bold text-stone-500 block">K (Potassium)</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      step="1"
                      value={cropInputs.potassium}
                      onChange={(e) => setCropInputs({ ...cropInputs, potassium: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-transparent font-black text-stone-900 text-base focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Collapsible Advanced Climate Sliders */}
              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full p-2.5 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-700 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                    <span>{showAdvanced ? t.hideSliders : t.fineTuneSliders}</span>
                    <span className="text-[10px] font-normal text-stone-400">
                      ({cropInputs.temperature}°C, {cropInputs.humidity}%, pH {cropInputs.ph}, {cropInputs.rainfall}mm)
                    </span>
                  </span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
                </button>

                {showAdvanced && (
                  <div className="p-3 bg-white space-y-3 border-t border-stone-200">
                    {/* pH and Humidity Sliders */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 mb-0.5">
                          <span>{t.soilPH}</span>
                          <span className="text-emerald-700 font-black">{cropInputs.ph}</span>
                        </div>
                        <input
                          type="range"
                          min="3.5"
                          max="9.5"
                          step="0.1"
                          value={cropInputs.ph}
                          onChange={(e) => setCropInputs({ ...cropInputs, ph: parseFloat(e.target.value) || 7 })}
                          className="w-full accent-emerald-600 h-1.5 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 mb-0.5">
                          <span>{t.humidity}</span>
                          <span className="text-emerald-700 font-black">{cropInputs.humidity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          step="1"
                          value={cropInputs.humidity}
                          onChange={(e) => setCropInputs({ ...cropInputs, humidity: parseFloat(e.target.value) || 50 })}
                          className="w-full accent-emerald-600 h-1.5 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Temperature and Rainfall */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block">{t.temp} (°C)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={cropInputs.temperature}
                            onChange={(e) => setCropInputs({ ...cropInputs, temperature: parseFloat(e.target.value) || 0 })}
                            className="bg-transparent font-bold text-stone-900 text-sm focus:outline-none w-16"
                          />
                        </div>
                        <Thermometer className="w-4 h-4 text-amber-500" />
                      </div>

                      <div className="p-2 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block">{t.rainfall} (mm)</label>
                          <input
                            type="number"
                            step="1"
                            value={cropInputs.rainfall}
                            onChange={(e) => setCropInputs({ ...cropInputs, rainfall: parseFloat(e.target.value) || 0 })}
                            className="bg-transparent font-bold text-stone-900 text-sm focus:outline-none w-16"
                          />
                        </div>
                        <CloudRain className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {/* Submit Predict Button - Always visible without scrolling! */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? t.evaluating : t.predictCrop}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Sticky Results Container (7 cols on laptop) */}
          <div ref={resultRef} className="lg:col-span-7 lg:sticky lg:top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            {cropResult ? (
              <div className="space-y-4 animate-in fade-in">
                {/* Dynamic Ambient Crop Morphing Result */}
                <CropThemedCard 
                  cropResult={cropResult} 
                  onOpenShcModal={() => setShowShcModal(true)} 
                />

                {/* Top 3 Alternative Crops Probability Distribution */}
                {cropResult.alternative_crops?.length > 1 && (
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Top Suited Crops Ranking (Probability)</span>
                      </h4>
                      <span className="text-[10px] text-stone-400 font-semibold">Random Forest Engine</span>
                    </div>

                    <div className="space-y-2">
                      {cropResult.alternative_crops.map((cand, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-stone-800">
                              #{idx + 1} {cand.crop} <span className="text-stone-500 font-normal">({cand.hindi_name})</span>
                            </span>
                            <span className="font-bold text-emerald-700">{cand.confidence}% match</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0 ? 'bg-emerald-600' : idx === 1 ? 'bg-emerald-400' : 'bg-teal-300'
                              }`}
                              style={{ width: `${cand.confidence}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-stone-400">
                            <span>Yield: {cand.yield_range}</span>
                            <span>Season: {cand.season}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Store Shelves: Matching Seeds in Stock */}
                {cropResult.recommended_seeds_in_store?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Available {cropResult.recommended_crop} Seeds in Store</span>
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ready for Pickup
                      </span>
                    </div>
                    <div className="space-y-2">
                      {cropResult.recommended_seeds_in_store.map((seed) => (
                        <div key={seed.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors">
                          <div>
                            <div className="text-xs font-bold text-stone-900">{seed.name}</div>
                            <div className="text-[11px] text-stone-500">{seed.unit} • ₹{seed.price} • {seed.stock_quantity} bags left</div>
                          </div>
                          <button
                            onClick={() => addToCart(seed, 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{t.add}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Store Shelves: Matching Fertilizers in Stock */}
                {cropResult.recommended_fertilizers_in_store?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recommended Fertilizers in Store</span>
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {cropResult.recommended_fertilizers_in_store.map((fert) => (
                        <div key={fert.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors">
                          <div>
                            <div className="text-xs font-bold text-stone-900">{fert.name}</div>
                            <div className="text-[11px] text-stone-500">{fert.unit} • ₹{fert.price} • {fert.stock_quantity} in stock</div>
                          </div>
                          <button
                            onClick={() => addToCart(fert, 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{t.add}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full bg-stone-50/70 rounded-2xl border border-dashed border-stone-300 p-8 flex flex-col items-center justify-center text-center text-stone-400 min-h-[380px]">
                <Sprout className="w-12 h-12 mb-3 text-stone-300" />
                <h3 className="font-bold text-stone-700 text-base">Prediction Appears Here Instantly</h3>
                <p className="text-xs text-stone-500 max-w-sm mt-1">
                  Adjust soil nutrients or pick a preset on the left, then click &quot;{t.predictCrop}&quot;. Result will lock into this panel without having to scroll up or down.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Fertilizer Advisory - Side-by-Side Laptop Grid */}
      {activeMode === 'fertilizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <h2 className="font-bold text-stone-900 text-base">Target Crop & Soil Test</h2>
              <p className="text-xs text-stone-500">Calculates exact Urea / DAP / MOP bag deficiencies</p>
            </div>

            <form onSubmit={handleFertilizerAdvise} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Target Crop You Plan to Sow *
                </label>
                <select
                  value={fertInputs.target_crop}
                  onChange={(e) => setFertInputs({ ...fertInputs, target_crop: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                >
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Rice">Rice / Paddy (धान)</option>
                  <option value="Maize">Maize (मक्का)</option>
                  <option value="Cotton">Cotton (कपास)</option>
                  <option value="Chickpea">Chickpea / Chana (चना)</option>
                  <option value="Tomato">Tomato (टमाटर)</option>
                  <option value="Potato">Potato (आलू)</option>
                  <option value="Sugarcane">Sugarcane (गन्ना)</option>
                </select>
              </div>

              <div>
                <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Current Soil Test Metrics (kg/ha)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <label className="text-[10px] font-bold text-stone-500 block">Soil N</label>
                    <input
                      type="number"
                      value={fertInputs.nitrogen}
                      onChange={(e) => setFertInputs({ ...fertInputs, nitrogen: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-transparent font-black text-stone-900 text-base focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <label className="text-[10px] font-bold text-stone-500 block">Soil P</label>
                    <input
                      type="number"
                      value={fertInputs.phosphorus}
                      onChange={(e) => setFertInputs({ ...fertInputs, phosphorus: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-transparent font-black text-stone-900 text-base focus:outline-none"
                    />
                  </div>

                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                    <label className="text-[10px] font-bold text-stone-500 block">Soil K</label>
                    <input
                      type="number"
                      value={fertInputs.potassium}
                      onChange={(e) => setFertInputs({ ...fertInputs, potassium: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-transparent font-black text-stone-900 text-base focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Analyzing Deficiency...' : 'Calculate Fertilizer Dose'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div ref={resultRef} className="lg:col-span-7 lg:sticky lg:top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            {fertResult ? (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Dosage for {fertResult.target_crop}
                  </span>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    {fertResult.primary_recommendation}
                  </p>
                </div>

                {/* Nutrient Status Breakdown */}
                <div className="space-y-2">
                  {fertResult.analysis.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                        item.status === 'Deficient'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.status}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-stone-900">{item.nutrient}</div>
                        <div className="text-xs text-stone-600 mt-0.5">{item.recommendation}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Application schedule */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs text-emerald-950">
                  <strong>Application Schedule:</strong> {fertResult.dosage_per_acre}
                </div>

                {/* In stock fertilizers */}
                {fertResult.matching_fertilizers_in_store?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                      Matching In-Stock Fertilizers
                    </h4>
                    <div className="space-y-2">
                      {fertResult.matching_fertilizers_in_store.map((prod) => (
                        <div key={prod.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold text-stone-900">{prod.name}</div>
                            <div className="text-[11px] text-stone-500">₹{prod.price} • {prod.stock_quantity} in stock</div>
                          </div>
                          <button
                            onClick={() => addToCart(prod, 1)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>{t.add}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full bg-stone-50/70 rounded-2xl border border-dashed border-stone-300 p-8 flex flex-col items-center justify-center text-center text-stone-400 min-h-[350px]">
                <FlaskConical className="w-12 h-12 mb-3 text-stone-300" />
                <h3 className="font-bold text-stone-700 text-base">Awaiting Soil Test Data</h3>
                <p className="text-xs text-stone-500 max-w-sm mt-1">
                  Choose target crop and soil test ratings to calculate NPK bag requirements.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Soil Health Card Modal */}
      <SoilHealthCardModal
        isOpen={showShcModal}
        onClose={() => setShowShcModal(false)}
        cropInputs={cropInputs}
        cropResult={cropResult}
      />
    </div>
  );
};

export default CropPrediction;
