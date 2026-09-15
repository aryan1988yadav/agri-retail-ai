import React, { useState, useEffect } from 'react';
import { 
  Sprout, Search, Filter, Phone, PlusCircle, 
  MapPin, CheckCircle, TrendingUp, ShieldCheck, RefreshCw, 
  Droplets, Scale, Calendar, Award, Zap, ArrowRight, DollarSign, X
} from 'lucide-react';
import { getCropListings, getMSPBenchmarks } from '../services/api';
import { useUser } from '../context/UserContext';
import SellCropModal from './SellCropModal';

const CROPS = ['All Crops', 'Wheat', 'Paddy', 'Cotton', 'Soybean', 'Mustard', 'Chickpea'];
const STATES = ['All States', 'Madhya Pradesh', 'Punjab', 'Haryana', 'Maharashtra', 'Rajasthan', 'Uttar Pradesh'];

const KisanMandi = () => {
  const { currentPersona, rameshKhata, settleKhataFromMandi } = useUser();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All Crops');
  const [selectedState, setSelectedState] = useState('All States');
  const [sortBy, setSortBy] = useState('newest');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  
  // Offer modal
  const [offerModalLot, setOfferModalLot] = useState(null);
  const [buyerOfferRate, setBuyerOfferRate] = useState('');
  const [offerSuccessToast, setOfferSuccessToast] = useState('');

  // Fasal Se Hisaab Settlement Modal
  const [settlementModalLot, setSettlementModalLot] = useState(null);
  const [settlementSuccess, setSettlementSuccess] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [selectedCrop, selectedState, search]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCrop !== 'All Crops') params.crop = selectedCrop;
      if (selectedState !== 'All States') params.state = selectedState;
      if (search.trim()) params.search = search.trim();

      const res = await getCropListings(params);
      setListings(res.data);
    } catch (err) {
      console.error('Failed to load Mandi listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'price_asc') return a.expected_price_per_quintal - b.expected_price_per_quintal;
    if (sortBy === 'price_desc') return b.expected_price_per_quintal - a.expected_price_per_quintal;
    if (sortBy === 'qty_desc') return b.quantity_quintals - a.quantity_quintals;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const handleSendOffer = () => {
    if (!offerModalLot || !buyerOfferRate) return;
    setOfferSuccessToast(`✓ Offer of ₹${buyerOfferRate}/Qtl submitted to ${offerModalLot.farmer_name}! They will review and call you.`);
    setOfferModalLot(null);
    setBuyerOfferRate('');
    setTimeout(() => setOfferSuccessToast(''), 5000);
  };

  const handleConfirmFasalHisaab = () => {
    if (!settlementModalLot) return;
    const totalHarvestVal = settlementModalLot.quantity_quintals * settlementModalLot.expected_price_per_quintal;
    const result = settleKhataFromMandi(settlementModalLot.crop_name, totalHarvestVal);
    setSettlementSuccess(result);
    setSettlementModalLot(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Mandi Highlights Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-700 via-amber-800 to-emerald-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-200 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>e-NAM Kisan Mandi • Direct Harvest Trading</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Sell Your Harvest Directly at MSP Benchmarks
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-normal">
              Direct farmer-to-buyer grain trading with zero middleman commissions. Featuring **"Fasal Se Hisaab"** to auto-clear your seasonal fertilizer Khata upon harvest sale.
            </p>
          </div>

          <button
            onClick={() => setIsSellModalOpen(true)}
            className="shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-emerald-900 font-extrabold text-sm hover:bg-amber-50 shadow-md hover:scale-[1.02] transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-emerald-700" />
            <span>+ List Harvest Lot (फसल बेचें)</span>
          </button>
        </div>

        {/* Live Mandi Ticker Stats */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-amber-200/80 font-medium">Active Harvest Lots</div>
            <div className="text-lg font-black text-white mt-0.5">{listings.length} Lots Live</div>
          </div>
          <div>
            <div className="text-amber-200/80 font-medium">Govt Wheat MSP</div>
            <div className="text-lg font-black text-white mt-0.5">₹2,275 / Qtl</div>
          </div>
          <div>
            <div className="text-amber-200/80 font-medium">Govt Soybean MSP</div>
            <div className="text-lg font-black text-white mt-0.5">₹4,892 / Qtl</div>
          </div>
          <div>
            <div className="text-amber-200/80 font-medium">Your Khata Balance</div>
            <div className="text-lg font-black text-amber-300 mt-0.5">
              ₹{rameshKhata.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Settlement Success Notification */}
      {settlementSuccess && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-green-900 text-white border border-emerald-400/40 shadow-lg flex items-center justify-between animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              🎉
            </div>
            <div>
              <div className="font-extrabold text-sm">
                Fasal Se Hisaab Complete! Seasonal Fertilizer Debt Settled.
              </div>
              <div className="text-xs text-emerald-200 mt-0.5">
                Cleared ₹{settlementSuccess.settledAmount.toLocaleString('en-IN')} store debt. Net ₹{settlementSuccess.netPayout.toLocaleString('en-IN')} transferred to your bank.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSettlementSuccess(null)}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Offer Feedback Toast */}
      {offerSuccessToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>{offerSuccessToast}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search variety, farmer, village..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="text-xs text-stone-500 font-semibold w-full md:w-auto text-right">
          Showing {sortedListings.length} harvest listings
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="py-16 text-center text-stone-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-2" />
          <p className="text-sm font-semibold">Loading Mandi listings...</p>
        </div>
      ) : sortedListings.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8">
          <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No harvest lots found</h3>
          <p className="text-xs text-stone-500 mt-1">Be the first farmer to list harvest in this category.</p>
          <button
            onClick={() => setIsSellModalOpen(true)}
            className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 cursor-pointer"
          >
            + List Your Harvest Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedListings.map((lot) => {
            const mspDiff = lot.msp_benchmark 
              ? Math.round(lot.expected_price_per_quintal - lot.msp_benchmark) 
              : null;
            
            const isUserLot = lot.farmer_phone === currentPersona.phone.replace(/[^0-9]/g, '') || lot.farmer_name.toLowerCase().includes(currentPersona.name.toLowerCase().split(' ')[0]);
            const totalLotValue = lot.quantity_quintals * lot.expected_price_per_quintal;

            return (
              <div
                key={lot.id}
                className={`bg-white rounded-3xl border ${isUserLot ? 'border-amber-400 ring-2 ring-amber-300/40' : 'border-stone-200/90'} shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col`}
              >
                {/* Visual Header */}
                <div className="p-4 bg-gradient-to-r from-stone-800 to-stone-950 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {lot.crop_name.toLowerCase().includes('wheat') ? '🌾' :
                       lot.crop_name.toLowerCase().includes('cotton') ? '☁️' :
                       lot.crop_name.toLowerCase().includes('soybean') ? '🌱' :
                       lot.crop_name.toLowerCase().includes('mustard') ? '🌼' :
                       lot.crop_name.toLowerCase().includes('paddy') ? '🌾' : '🌾'}
                    </span>
                    <div>
                      <div className="font-black text-base leading-none">{lot.crop_name}</div>
                      <div className="text-[11px] text-stone-300 mt-0.5">{lot.variety}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-amber-300">
                      ₹{lot.expected_price_per_quintal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[9px] text-stone-400 uppercase font-bold">per Quintal</div>
                  </div>
                </div>

                {/* Lot Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Quantity & Moisture Metrics */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                        <span className="text-stone-400 font-medium block text-[10px] uppercase">Lot Quantity</span>
                        <span className="font-black text-stone-900 text-sm">
                          {lot.quantity_quintals} Quintals
                        </span>
                        <span className="text-[10px] text-stone-500 block">({lot.quantity_quintals * 100} kg)</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                        <span className="text-stone-400 font-medium block text-[10px] uppercase">Grain Moisture</span>
                        <span className="font-black text-stone-900 text-sm">
                          {lot.moisture_pct || 11.5}%
                        </span>
                        <span className="text-[10px] text-emerald-700 block font-semibold">Dry & Clean</span>
                      </div>
                    </div>

                    {/* MSP Comparison */}
                    {lot.msp_benchmark && (
                      <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                        <span className="text-stone-600 font-medium">Govt MSP: ₹{lot.msp_benchmark}/qtl</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          mspDiff >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {mspDiff >= 0 ? `+₹${mspDiff} above MSP` : `-₹${Math.abs(mspDiff)}`}
                        </span>
                      </div>
                    )}

                    {lot.description && (
                      <p className="mt-2.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {lot.description}
                      </p>
                    )}
                  </div>

                  {/* Farmer Details & Action Row */}
                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-stone-800 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span>{lot.farmer_name}</span>
                        {isUserLot && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-black">
                            YOUR LOT
                          </span>
                        )}
                      </div>
                      <span className="text-stone-400 text-[11px]">{lot.harvest_date || 'Recent Harvest'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{lot.village}, {lot.district}, {lot.state}</span>
                    </div>

                    {/* Actions */}
                    {isUserLot && rameshKhata > 0 ? (
                      /* "Fasal Se Hisaab" Button for Farmer's Own Lot */
                      <button
                        onClick={() => setSettlementModalLot(lot)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                      >
                        <Zap className="w-4 h-4 text-amber-200" />
                        <span>Fasal Se Hisaab (Settle ₹{rameshKhata.toFixed(0)} Khata)</span>
                      </button>
                    ) : (
                      /* In-App Direct Offer & Contact Buttons */
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            setOfferModalLot(lot);
                            setBuyerOfferRate(lot.expected_price_per_quintal.toString());
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>Make Offer</span>
                        </button>

                        <button
                          onClick={() => alert(`Direct Farmer Contact: ${lot.farmer_name} at +91 ${lot.farmer_phone} (${lot.village})`)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-stone-500" />
                          <span>Contact</span>
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sell Crop Modal */}
      {isSellModalOpen && (
        <SellCropModal
          onClose={() => setIsSellModalOpen(false)}
          onSuccess={() => fetchListings()}
        />
      )}

      {/* Make an Offer In-App Modal */}
      {offerModalLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-stone-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-stone-900">
                Submit Offer to {offerModalLot.farmer_name}
              </h3>
              <button onClick={() => setOfferModalLot(null)} className="p-1 text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-stone-600 leading-relaxed">
              Lot: <strong>{offerModalLot.quantity_quintals} Quintals of {offerModalLot.crop_name} ({offerModalLot.variety})</strong> located at {offerModalLot.village}, {offerModalLot.district}.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Your Offer Price (₹ / Quintal):</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-stone-400">₹</span>
                <input
                  type="number"
                  value={buyerOfferRate}
                  onChange={(e) => setBuyerOfferRate(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-black text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="e.g. 2350"
                />
              </div>
              <div className="text-[11px] text-stone-400 flex justify-between pt-1">
                <span>Farmer Rate: ₹{offerModalLot.expected_price_per_quintal}/qtl</span>
                {offerModalLot.msp_benchmark && <span>MSP: ₹{offerModalLot.msp_benchmark}/qtl</span>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => setOfferModalLot(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOffer}
                className="px-5 py-2 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer"
              >
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Fasal Se Hisaab" Settlement Modal */}
      {settlementModalLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base">
                  ⚡
                </span>
                <h3 className="text-base font-black text-stone-900">
                  Fasal Se Hisaab (Harvest-to-Debt Settlement)
                </h3>
              </div>
              <button onClick={() => setSettlementModalLot(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Auto-settle your outstanding store fertilizer credit directly from the proceeds of this harvest sale. No cash hassle.
            </p>

            {/* Financial Ledger Calculation */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs">
              <div className="flex justify-between font-medium text-stone-600">
                <span>Harvest Sale Proceeds ({settlementModalLot.quantity_quintals} Q @ ₹{settlementModalLot.expected_price_per_quintal}/Q)</span>
                <span className="font-bold text-stone-900">
                  +₹{(settlementModalLot.quantity_quintals * settlementModalLot.expected_price_per_quintal).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between font-semibold text-rose-700">
                <span>Deduct Outstanding Fertilizer Khata (Sharma Krishi Kendra)</span>
                <span className="font-bold">
                  -₹{rameshKhata.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-sm text-emerald-900">
                <span>Net Bank Transfer to {currentPersona.name}</span>
                <span className="text-base">
                  ₹{((settlementModalLot.quantity_quintals * settlementModalLot.expected_price_per_quintal) - rameshKhata).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg text-center mt-2">
                ✓ After settlement, your Store Khata Balance will be ₹0 (Debt Free! 🎉)
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSettlementModalLot(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFasalHisaab}
                className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-800 hover:bg-emerald-900 text-white shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>Confirm & Settle Khata</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default KisanMandi;
