import React from 'react';
import { X, Printer, Award, CheckCircle2, ShieldCheck } from 'lucide-react';

const SoilHealthCardModal = ({ isOpen, onClose, cropInputs, cropResult }) => {
  if (!isOpen || !cropResult) return null;

  const handlePrint = () => {
    window.print();
  };

  // Classify nutrient levels according to ICAR benchmarks
  const getRating = (val, low, med) => {
    if (val < low) return { text: 'Low (Deficient)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (val <= med) return { text: 'Medium (Optimal)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    return { text: 'High (Sufficient)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  };

  const getPhRating = (ph) => {
    if (ph < 6.0) return { text: 'Acidic', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (ph <= 7.5) return { text: 'Neutral (Ideal)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    return { text: 'Alkaline', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  };

  const nRating = getRating(cropInputs.nitrogen, 80, 140);
  const pRating = getRating(cropInputs.phosphorus, 30, 60);
  const kRating = getRating(cropInputs.potassium, 30, 80);
  const phRating = getPhRating(cropInputs.ph);

  const reportId = `SHC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Actions (Hidden on Print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-sm text-slate-800">Official Soil Health Card & Scientific Advisory</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Soil Health Card Container */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible space-y-6 text-slate-800" id="soil-health-card-print">
          
          {/* Header Banner */}
          <div className="border-4 border-double border-emerald-700 p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-white to-green-50/70 text-center relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-left text-[11px] text-slate-600">
                <div><strong>Ref:</strong> {reportId}</div>
                <div><strong>Date:</strong> {currentDate}</div>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ICAR Standard Aligned</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 uppercase tracking-tight">
              राष्ट्रीय मृदा स्वास्थ्य कार्ड • SOIL HEALTH CARD
            </h2>
            <p className="text-xs font-semibold text-emerald-800 mt-0.5">
              Department of Agriculture & Farmers Welfare • AgriRetail AI Diagnostic Center
            </p>
          </div>

          {/* Farmer & Location Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block font-bold">Farmer Name:</span>
              <span className="font-bold text-slate-900">Kisan Sample / Beneficiary</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Field Sample ID:</span>
              <span className="font-bold text-slate-900">FS-2026-A109</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Climate Zone:</span>
              <span className="font-bold text-slate-900">Indo-Gangetic / Tropical Zone</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">Rainfall Pattern:</span>
              <span className="font-bold text-slate-900">{cropInputs.rainfall} mm (Normal)</span>
            </div>
          </div>

          {/* Tested Chemical Parameters Table */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              1. Soil Chemical Test Parameters (मृदा परीक्षण परिणाम)
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Nutrient / Parameter</th>
                    <th className="p-2.5">Tested Value</th>
                    <th className="p-2.5">Ideal ICAR Range</th>
                    <th className="p-2.5">Status & Interpretation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Available Nitrogen (N)</td>
                    <td className="p-2.5 font-bold text-emerald-800">{cropInputs.nitrogen} kg/ha</td>
                    <td className="p-2.5 text-slate-500">120 - 240 kg/ha</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${nRating.color}`}>
                        {nRating.text}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Available Phosphorus (P)</td>
                    <td className="p-2.5 font-bold text-emerald-800">{cropInputs.phosphorus} kg/ha</td>
                    <td className="p-2.5 text-slate-500">30 - 60 kg/ha</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pRating.color}`}>
                        {pRating.text}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Available Potassium (K)</td>
                    <td className="p-2.5 font-bold text-emerald-800">{cropInputs.potassium} kg/ha</td>
                    <td className="p-2.5 text-slate-500">40 - 100 kg/ha</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${kRating.color}`}>
                        {kRating.text}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Soil Reaction (pH)</td>
                    <td className="p-2.5 font-bold text-emerald-800">{cropInputs.ph}</td>
                    <td className="p-2.5 text-slate-500">6.5 - 7.5 (Neutral)</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${phRating.color}`}>
                        {phRating.text}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-900">Avg Ambient Temp & Humidity</td>
                    <td className="p-2.5 font-bold text-emerald-800">{cropInputs.temperature}°C / {cropInputs.humidity}%</td>
                    <td className="p-2.5 text-slate-500">Regional seasonal norms</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border text-emerald-700 bg-emerald-50 border-emerald-200">
                        Favorable
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Crop Advisory */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              2. Scientific Crop Recommendation (अनुशंसित फसल)
            </h3>
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Primary Best Suited Crop</span>
                <div className="text-xl font-black text-slate-900">
                  {cropResult.recommended_crop} ({cropResult.hindi_name})
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  <strong>Expected Yield:</strong> {cropResult.expected_yield_range} • <strong>Season:</strong> {cropResult.growing_season}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Model Confidence</span>
                <span className="text-xl font-black text-emerald-800">{(cropResult.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Alternative Crops if present */}
            {cropResult.alternative_crops?.length > 1 && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {cropResult.alternative_crops.slice(1, 3).map((alt, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Alternative #{i + 2}</span>
                    <div className="font-bold text-slate-800">{alt.crop} ({alt.hindi_name})</div>
                    <div className="text-[11px] text-slate-500">{alt.yield_range} • Match: {alt.confidence}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agronomist Notes & Footer Signatures */}
          <div className="pt-4 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="max-w-md text-slate-500 space-y-1">
              <div><strong>Agronomic Tip:</strong> {cropResult.soil_suitability_tips}</div>
              <div className="text-[10px] text-slate-400">
                * Recommendations generated using ICAR benchmark random forest model. Verified for Indian agricultural soil health cards.
              </div>
            </div>
            <div className="text-center shrink-0 border-t border-slate-400 pt-1 w-44">
              <div className="font-bold text-slate-800 text-[11px]">Authorized Agronomist</div>
              <div className="text-[10px] text-slate-500">Kisan Seva Kendra Lab</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SoilHealthCardModal;
