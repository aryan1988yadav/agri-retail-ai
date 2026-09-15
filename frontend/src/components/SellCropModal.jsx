import React, { useState } from 'react';
import { X, Sprout, CheckCircle, AlertCircle, IndianRupee, MapPin, Phone, Scale, Droplets } from 'lucide-react';
import { createCropListing } from '../services/api';

const CROP_MSP_DEFAULTS = {
  'Wheat': 2275,
  'Paddy (Rice)': 2300,
  'Cotton': 7121,
  'Soybean': 4892,
  'Mustard (Sarson)': 5650,
  'Chickpea (Chana)': 5440,
  'Maize': 2225,
  'Moong': 8682,
  'Groundnut': 6783
};

const SellCropModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    farmer_name: '',
    farmer_phone: '',
    crop_name: 'Wheat',
    variety: '',
    quantity_quintals: '',
    expected_price_per_quintal: '',
    moisture_pct: '11.5',
    grade: 'Grade A / Export Quality',
    village: '',
    district: '',
    state: 'Madhya Pradesh',
    harvest_date: 'March 2024',
    description: '',
    image_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const activeMSP = CROP_MSP_DEFAULTS[formData.crop_name] || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCropChange = (e) => {
    const crop = e.target.value;
    const msp = CROP_MSP_DEFAULTS[crop] || '';
    setFormData(prev => ({
      ...prev,
      crop_name: crop,
      expected_price_per_quintal: msp ? (msp + 200).toString() : prev.expected_price_per_quintal
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.farmer_name.trim() || !formData.farmer_phone.trim()) {
      setError('Please provide Farmer Name and Mobile Number.');
      return;
    }
    if (!formData.quantity_quintals || Number(formData.quantity_quintals) <= 0) {
      setError('Please enter a valid harvest quantity in Quintals.');
      return;
    }
    if (!formData.expected_price_per_quintal || Number(formData.expected_price_per_quintal) <= 0) {
      setError('Please enter your expected price per Quintal.');
      return;
    }
    if (!formData.village.trim() || !formData.district.trim()) {
      setError('Please enter your Village and District.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        quantity_quintals: parseFloat(formData.quantity_quintals),
        expected_price_per_quintal: parseFloat(formData.expected_price_per_quintal),
        moisture_pct: formData.moisture_pct ? parseFloat(formData.moisture_pct) : 12.0,
        msp_benchmark: activeMSP || null
      };
      await createCropListing(payload);
      setSubmitted(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to list crop. Please verify details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">List Your Harvest / अपनी फसल बेचें</h2>
              <p className="text-xs text-emerald-100">Sell directly to millers, traders & FPOs at transparent rates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">फसल सफलतापूर्वक दर्ज हो गई! (Harvest Listed!)</h3>
            <p className="text-sm text-slate-500">
              Your crop lot has been published to the Kisan Mandi. Interested buyers will contact you directly on WhatsApp or Call.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Farmer Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Farmer Name / किसान का नाम *
                </label>
                <input
                  type="text"
                  name="farmer_name"
                  placeholder="e.g. Ramesh Patel"
                  value={formData.farmer_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile / WhatsApp Number *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">+91</span>
                  <input
                    type="tel"
                    name="farmer_phone"
                    placeholder="9876543210"
                    value={formData.farmer_phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Crop & Variety Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Crop / फसल *
                </label>
                <select
                  name="crop_name"
                  value={formData.crop_name}
                  onChange={handleCropChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Paddy (Rice)">Paddy / Rice (धान)</option>
                  <option value="Cotton">Cotton (कपास)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Mustard (Sarson)">Mustard (सरसों)</option>
                  <option value="Chickpea (Chana)">Chickpea / Chana (चना)</option>
                  <option value="Maize">Maize (मक्का)</option>
                  <option value="Moong">Moong Dal (मूंग)</option>
                  <option value="Groundnut">Groundnut (मूंगफली)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Variety / किस्म (e.g. Sharbati, Pusa 1121)
                </label>
                <input
                  type="text"
                  name="variety"
                  placeholder="e.g. Sharbati Gold / Pusa 1121"
                  value={formData.variety}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Quantity and Expected Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quantity in Quintals (1 Qtl = 100 kg) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    name="quantity_quintals"
                    placeholder="e.g. 100"
                    value={formData.quantity_quintals}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                  <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">
                    {formData.quantity_quintals ? `(${Number(formData.quantity_quintals) * 100} kg)` : 'Qtls'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Price (₹ / Quintal) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    step="10"
                    name="expected_price_per_quintal"
                    placeholder="e.g. 2450"
                    value={formData.expected_price_per_quintal}
                    onChange={handleChange}
                    className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-emerald-800"
                    required
                  />
                </div>
              </div>
            </div>

            {/* MSP Benchmark Live Hint */}
            {activeMSP && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                <span className="text-amber-800 font-medium">
                  🏛️ <strong>Official Govt MSP for {formData.crop_name}:</strong> ₹{activeMSP} / Quintal
                </span>
                {formData.expected_price_per_quintal && (
                  <span className={`font-bold px-2 py-0.5 rounded-md ${
                    Number(formData.expected_price_per_quintal) >= activeMSP
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-200 text-amber-900'
                  }`}>
                    {Number(formData.expected_price_per_quintal) >= activeMSP
                      ? `+₹${Number(formData.expected_price_per_quintal) - activeMSP} above MSP`
                      : `-₹${activeMSP - Number(formData.expected_price_per_quintal)} below MSP`}
                  </span>
                )}
              </div>
            )}

            {/* Quality & Moisture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quality Grade
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="Grade A / Export Quality">Grade A / Export Quality</option>
                  <option value="FAQ - Fair Average Quality">FAQ - Fair Average Quality</option>
                  <option value="Certified Organic Produce">Certified Organic Produce</option>
                  <option value="Seed Grade High Germination">Seed Grade High Germination</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Moisture Content % (आर्द्रता)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    name="moisture_pct"
                    placeholder="e.g. 11.5"
                    value={formData.moisture_pct}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-xs font-semibold text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* Location (Village, District, State) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Village / गाँव *
                </label>
                <input
                  type="text"
                  name="village"
                  placeholder="e.g. Sanwer"
                  value={formData.village}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District / ज़िला *
                </label>
                <input
                  type="text"
                  name="district"
                  placeholder="e.g. Indore"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  State / राज्य *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Telangana">Telangana</option>
                </select>
              </div>
            </div>

            {/* Description Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Harvest Details / Storage Condition (विवरण)
              </label>
              <textarea
                name="description"
                rows="2"
                placeholder="e.g. Cleaned grain, zero weed seeds, stored in dry ventilated godown, ready for immediate truck loading..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-800/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Publishing Lot...' : 'Publish to Mandi (फसल दर्ज करें)'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellCropModal;
