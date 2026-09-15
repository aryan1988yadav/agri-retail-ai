import React from 'react';
import { Sparkles, ShieldCheck, Award, Zap, Droplets, Leaf, Sprout } from 'lucide-react';

const ProductVisual = ({ product, className = 'w-full h-44', compact = false }) => {
  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const cat = (product.category?.name || '').toLowerCase();

  // 1. IFFCO NEEM COATED UREA
  if (name.includes('urea') && !name.includes('nano')) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-emerald-800 to-green-950 flex flex-col items-center justify-between p-3 select-none text-white ${className}`}>
        {/* Poly Bag Top Stitching Pattern */}
        <div className="w-full border-b-2 border-dashed border-emerald-400/40 pb-1 flex justify-between items-center text-[9px] text-emerald-300 font-mono">
          <span>IFFCO KENDRA</span>
          <span>45 kg NETT</span>
        </div>

        {/* Center Fertilizer Sack Visual */}
        <div className="flex flex-col items-center text-center my-auto">
          <div className="w-10 h-10 rounded-full bg-white text-emerald-900 font-black text-xs flex items-center justify-center shadow-md border-2 border-emerald-500 mb-1">
            IFFCO
          </div>
          <div className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
            नीम लेपित यूरिया
          </div>
          <div className="text-[10px] font-bold tracking-widest text-emerald-200">
            NEEM COATED UREA (46% N)
          </div>
          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/30 text-[9px] text-emerald-100 border border-emerald-400/30">
            <span>🏛️ GOVT. SUBSIDIZED (DBT)</span>
          </div>
        </div>

        {/* Bottom Bag Tag */}
        <div className="w-full bg-emerald-900/60 rounded px-2 py-0.5 flex justify-between items-center text-[9px] text-emerald-300">
          <span>Prilled Nitrogen</span>
          <span className="font-bold text-amber-300">MAX MRP: ₹266.50</span>
        </div>
      </div>
    );
  }

  // 2. IFFCO / COROMANDEL DAP
  if (name.includes('dap')) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 flex flex-col items-center justify-between p-3 select-none text-white ${className}`}>
        <div className="w-full border-b-2 border-dashed border-amber-300/40 pb-1 flex justify-between items-center text-[9px] text-amber-200 font-mono">
          <span>HIGH PHOSPHATE</span>
          <span>50 kg NETT</span>
        </div>

        <div className="flex flex-col items-center text-center my-auto">
          <div className="px-2.5 py-0.5 rounded bg-black/40 text-amber-300 font-black text-[10px] uppercase tracking-wider mb-1">
            {product.brand || 'IFFCO'}
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-white">
            D.A.P.
          </div>
          <div className="text-[10px] font-bold text-amber-100">
            DI-AMMONIUM PHOSPHATE
          </div>
          <div className="mt-1 text-xs font-black px-2 py-0.5 rounded bg-amber-400 text-amber-950">
            18% N : 46% P₂O₅
          </div>
        </div>

        <div className="w-full bg-black/30 rounded px-2 py-0.5 flex justify-between items-center text-[9px] text-amber-200">
          <span>Root Sowing Dose</span>
          <span className="font-bold text-white">Govt Subsidized</span>
        </div>
      </div>
    );
  }

  // 3. MOP POTASH
  if (name.includes('mop') || name.includes('potash')) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-rose-700 via-rose-800 to-rose-950 flex flex-col items-center justify-between p-3 select-none text-white ${className}`}>
        <div className="w-full border-b-2 border-dashed border-rose-300/40 pb-1 flex justify-between items-center text-[9px] text-rose-200 font-mono">
          <span>POTASSIUM 60%</span>
          <span>50 kg NETT</span>
        </div>

        <div className="flex flex-col items-center text-center my-auto">
          <div className="text-xs font-bold text-rose-200 uppercase tracking-wider">
            IPL POTASH
          </div>
          <div className="text-xl font-black text-white">M.O.P.</div>
          <div className="text-[10px] text-rose-100 font-semibold">Muriate of Potash (0:0:60)</div>
          <span className="mt-1 px-2 py-0.5 rounded bg-rose-500/40 text-[9px] text-rose-100">
            Grain Filling & Drought Guard
          </span>
        </div>

        <div className="w-full bg-rose-950/60 rounded px-2 py-0.5 flex justify-between text-[9px] text-rose-200">
          <span>Basal Fertilizer</span>
          <span className="font-bold text-white">₹1,700/bag</span>
        </div>
      </div>
    );
  }

  // 4. SHRIRAM SUPER 303 WHEAT SEED
  if (name.includes('wheat') || name.includes('303')) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-amber-700 via-amber-800 to-stone-900 flex flex-col items-center justify-between p-3 select-none text-white ${className}`}>
        <div className="w-full border-b border-amber-400/30 pb-1 flex justify-between items-center text-[9px] text-amber-200 font-semibold">
          <span className="flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-300" /> ICAR CERTIFIED
          </span>
          <span>40 kg PACK</span>
        </div>

        <div className="flex flex-col items-center text-center my-auto">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
            SHRIRAM SEEDS
          </span>
          <div className="text-base sm:text-lg font-black text-amber-100 leading-tight">
            SUPER 303
          </div>
          <div className="text-[11px] font-extrabold text-white">
            उच्च उपज प्रमाणित गेहूँ बीज
          </div>
          <div className="mt-1 flex items-center gap-1 text-[9px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-400/30 text-amber-200">
            <span>🌾 22-24 Q/Acre Yield • Sharbati</span>
          </div>
        </div>

        <div className="w-full bg-black/40 rounded px-2 py-0.5 flex justify-between text-[9px] text-amber-300">
          <span>98% Germination</span>
          <span className="font-bold text-emerald-400">Rabi Sowing Champion</span>
        </div>
      </div>
    );
  }

  // 5. BAYER ARIZE PADDY SEEDS
  if (name.includes('paddy') || name.includes('rice') || name.includes('arize')) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-teal-800 via-emerald-800 to-emerald-950 flex flex-col items-center justify-between p-3 select-none text-white ${className}`}>
        <div className="w-full border-b border-teal-300/30 pb-1 flex justify-between items-center text-[9px] text-teal-200">
          <span>BAYER CROPSCIENCE</span>
          <span>HYBRID SEED</span>
        </div>

        <div className="flex flex-col items-center text-center my-auto">
          <div className="text-[10px] font-bold text-teal-300 uppercase">ARIZE 6444 GOLD</div>
          <div className="text-lg font-black text-white">धान हाइब्रिड बीज</div>
          <div className="text-[10px] text-emerald-200">BLB Bacterial Blight Resistant</div>
          <div className="mt-1 px-2 py-0.5 rounded bg-emerald-500/30 text-[9px] text-white">
            High Tillering & Thin Grain
          </div>
        </div>

        <div className="w-full bg-teal-950/70 rounded px-2 py-0.5 flex justify-between text-[9px] text-teal-300">
          <span>Kharif Season</span>
          <span className="font-bold text-emerald-300">Govt Certified</span>
        </div>
      </div>
    );
  }

  // 6. MAHYCO BOLLGARD COTTON SEEDS
  if (name.includes('cotton') || name.includes('bollgard')) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 flex flex-col items-center justify-between p-3 select-none text-white ${className}`}>
        <div className="w-full border-b border-slate-500 pb-1 flex justify-between items-center text-[9px] text-slate-300">
          <span>MAHYCO BG-II</span>
          <span>450g PACK</span>
        </div>

        <div className="flex flex-col items-center text-center my-auto">
          <div className="w-8 h-8 rounded-full bg-white text-slate-800 flex items-center justify-center text-xs font-black mb-1 shadow">
            ☁️
          </div>
          <div className="text-base font-black text-white">BOLLGARD II</div>
          <div className="text-[10px] text-slate-300">Bollworm Resistant Cotton</div>
          <div className="mt-1 text-[9px] bg-slate-600/60 px-2 py-0.5 rounded text-amber-300 font-bold">
            सफेद सोना (White Gold)
          </div>
        </div>

        <div className="w-full bg-slate-900/80 rounded px-2 py-0.5 flex justify-between text-[9px] text-slate-300">
          <span>Includes Non-Bt Refuge</span>
          <span className="font-bold text-emerald-400">Certified BG-II</span>
        </div>
      </div>
    );
  }

  // 7. PIONEER MAIZE SEEDS
  if (name.includes('maize') || name.includes('pioneer')) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-amber-500 via-amber-600 to-amber-800 flex flex-col items-center justify-between p-3 select-none text-white ${className}`}>
        <div className="w-full border-b border-amber-300/40 pb-1 flex justify-between items-center text-[9px] text-amber-100">
          <span>PIONEER HYBRID</span>
          <span>4 kg PACK</span>
        </div>

        <div className="flex flex-col items-center text-center my-auto">
          <span className="text-xl">🌽</span>
          <div className="text-base font-black text-white">P3302 HYBRID</div>
          <div className="text-[10px] text-amber-100 font-bold">मक्का हाइब्रिड (Yellow Grain)</div>
          <span className="mt-1 px-2 py-0.5 rounded bg-black/20 text-[9px] text-amber-200">
            Big Cob & High Starch Content
          </span>
        </div>

        <div className="w-full bg-black/30 rounded px-2 py-0.5 flex justify-between text-[9px] text-amber-100">
          <span>Heavy Yield</span>
          <span className="font-bold text-amber-300">Kharif/Rabi</span>
        </div>
      </div>
    );
  }

  // 8. CROP PROTECTION / PESTICIDES (CORAGEN, CONFIDOR, SAAF, TAFGOR)
  if (cat.includes('protection') || cat.includes('pesticide') || name.includes('coragen') || name.includes('confidor') || name.includes('insecticide')) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-sky-800 via-blue-900 to-indigo-950 flex flex-col items-center justify-between p-3 select-none text-white ${className}`}>
        <div className="w-full border-b border-sky-400/30 pb-1 flex justify-between items-center text-[9px] text-sky-200">
          <span className="font-bold text-amber-300">⚠️ AGROCHEMICAL</span>
          <span>{product.unit || 'Bottle'}</span>
        </div>

        <div className="flex flex-col items-center text-center my-auto">
          <div className="w-7 h-7 rounded-full bg-white text-blue-900 flex items-center justify-center font-bold text-xs mb-1 shadow">
            🧪
          </div>
          <div className="text-sm sm:text-base font-black text-white uppercase leading-tight">
            {product.name}
          </div>
          <div className="text-[10px] text-sky-200 italic line-clamp-1 max-w-[200px]">
            {product.technical_name || 'Broad Spectrum Protection'}
          </div>
          <div className="mt-1 px-2 py-0.5 rounded bg-sky-500/30 text-[9px] text-sky-100 border border-sky-400/30">
            Target: Stem Borer & Sucking Pests
          </div>
        </div>

        <div className="w-full bg-blue-950/70 rounded px-2 py-0.5 flex justify-between text-[9px] text-sky-300">
          <span>Translaminar Systemic</span>
          <span className="font-bold text-white">Genuine Seal</span>
        </div>
      </div>
    );
  }

  // 9. NANO UREA / MICRONUTRIENTS (ZINC, BIO)
  if (name.includes('nano') || name.includes('zinc') || cat.includes('bio') || cat.includes('organic')) {
    return (
      <div className={`relative overflow-hidden bg-gradient-to-b from-lime-700 via-green-800 to-emerald-950 flex flex-col items-center justify-between p-3 select-none text-white ${className}`}>
        <div className="w-full border-b border-lime-300/30 pb-1 flex justify-between items-center text-[9px] text-lime-200">
          <span>BIO-NUTRIENT / NANO</span>
          <span>{product.unit || 'Pack'}</span>
        </div>

        <div className="flex flex-col items-center text-center my-auto">
          <span className="text-xl">🌿</span>
          <div className="text-sm sm:text-base font-black text-white uppercase">
            {product.name}
          </div>
          <div className="text-[10px] text-lime-100 font-medium">
            {product.technical_name || 'Soil Health Booster'}
          </div>
          <div className="mt-1 px-2 py-0.5 rounded bg-lime-500/30 text-[9px] text-lime-100">
            Eco-Friendly • High Absorption
          </div>
        </div>

        <div className="w-full bg-green-950/70 rounded px-2 py-0.5 flex justify-between text-[9px] text-lime-300">
          <span>Foliar Spray</span>
          <span className="font-bold text-lime-200">Green Certified</span>
        </div>
      </div>
    );
  }

  // DEFAULT / FALLBACK AGRI PACKAGING
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-slate-800 to-slate-950 flex flex-col items-center justify-between p-3 select-none text-white ${className}`}>
      <div className="w-full border-b border-slate-700 pb-1 flex justify-between items-center text-[9px] text-slate-400">
        <span>{product.brand || 'KISAN KENDRA'}</span>
        <span>{product.unit || 'Unit'}</span>
      </div>

      <div className="flex flex-col items-center text-center my-auto">
        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-1">
          <Sprout className="w-4 h-4" />
        </div>
        <div className="text-sm font-black text-white uppercase line-clamp-2">
          {product.name}
        </div>
        <div className="text-[10px] text-slate-300">{product.brand}</div>
      </div>

      <div className="w-full bg-black/40 rounded px-2 py-0.5 flex justify-between text-[9px] text-slate-300">
        <span>Certified Input</span>
        <span className="font-bold text-emerald-400">₹{product.price}</span>
      </div>
    </div>
  );
};

export default ProductVisual;
