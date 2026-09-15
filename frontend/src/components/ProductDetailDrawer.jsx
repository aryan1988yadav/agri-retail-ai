import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Tag, ShieldCheck, CheckCircle2, Award, Droplets, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../utils/translations';
import ProductVisual from './ProductVisual';

const ProductDetailDrawer = ({ product, isOpen, onClose }) => {
  const { addToCart, updateQuantity, cart } = useCart();
  const { language } = useUser();
  const { t } = useTranslation(language);

  if (!isOpen || !product) return null;

  const inCart = cart.find(item => item.product.id === product.id);
  const cartQty = inCart ? inCart.quantity : 0;
  const [localQty, setLocalQty] = useState(cartQty > 0 ? cartQty : 1);

  // Subsidy Calculation
  const nameLower = product.name.toLowerCase();
  let subsidySavings = null;
  let marketPrice = null;

  if (nameLower.includes('urea') && !nameLower.includes('nano')) {
    marketPrice = 2450;
    subsidySavings = 2450 - product.price;
  } else if (nameLower.includes('dap')) {
    marketPrice = 2750;
    subsidySavings = 2750 - product.price;
  } else if (nameLower.includes('mop') || nameLower.includes('potash')) {
    marketPrice = 2400;
    subsidySavings = 2400 - product.price;
  }

  const handleAddOrUpdate = () => {
    addToCart(product, localQty);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-Over Sheet (Right edge on Laptop) */}
      <div 
        className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto border-l border-stone-200 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
              {product.category?.name || 'Agri Input'}
            </span>
            <span className="text-[11px] text-stone-400 font-medium">SKU: AGRI-{product.id}</span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Packaging Visual */}
          <div className="rounded-3xl overflow-hidden shadow-xs border border-stone-200">
            <ProductVisual product={product} className="w-full h-52" />
          </div>

          {/* Product Header & Pricing */}
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
              {product.brand}
            </span>
            <h2 className="text-2xl font-black text-stone-900 mt-0.5 leading-snug">
              {product.name}
            </h2>
            {product.technical_name && (
              <p className="text-xs text-stone-500 font-mono mt-1 bg-stone-50 p-2 rounded-xl border border-stone-200/60">
                🧪 {product.technical_name}
              </p>
            )}

            {/* Price & Unit */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-stone-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {marketPrice && (
                <span className="text-sm text-stone-400 line-through">
                  ₹{marketPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-stone-500 font-semibold">
                / {product.unit}
              </span>
            </div>
          </div>

          {/* Govt Subsidy Tag (If applicable) */}
          {subsidySavings && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-950">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-700" />
                  <span>{language === 'hi' ? 'सरकारी PM-किसान सब्सिडी' : 'Govt PM-Kisan Subsidy'}</span>
                </span>
                <span className="text-emerald-800 font-black">
                  {language === 'hi' ? `₹${subsidySavings.toFixed(0)} बचत प्रति बोरी` : `Save ₹${subsidySavings.toFixed(0)} / bag`}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {language === 'hi' 
                  ? 'यह उत्पाद भारत सरकार द्वारा सब्सिडी युक्त है। केंद्र पर किसान पहचान पत्र मान्य है।' 
                  : 'Subsidized under Central Fertilizer DBT. Available at fixed regulated MRP.'}
              </p>
            </div>
          )}

          {/* Usage & Agronomy Instructions */}
          {product.dosage_instructions && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2 text-xs">
              <div className="font-extrabold text-stone-900 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-emerald-700" />
                <span>{language === 'hi' ? 'मात्रा व छिड़काव विधि (Dosage)' : 'Recommended Dosage & Application'}</span>
              </div>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                {product.dosage_instructions}
              </p>
            </div>
          )}

          {/* Target Crops */}
          {product.suitable_crops && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 block">
                {language === 'hi' ? 'उपयुक्त फसलें (Suitable Crops):' : 'Recommended Crops:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.suitable_crops.split(',').map((crop, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 font-semibold border border-stone-200/60">
                    🌾 {crop.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Safety Precaution */}
          {product.safety_guidelines && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>{language === 'hi' ? 'सुरक्षा निर्देश: ' : 'Safety: '}</strong>
                {product.safety_guidelines}
              </p>
            </div>
          )}

        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white border-t border-stone-200 p-5 flex items-center justify-between gap-4">
          
          {/* Stepper */}
          <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 p-1">
            <button
              onClick={() => setLocalQty(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-lg bg-white text-stone-700 hover:bg-stone-200 flex items-center justify-center font-bold transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-black text-sm text-stone-900">
              {localQty}
            </span>
            <button
              onClick={() => setLocalQty(prev => Math.min(product.stock_quantity, prev + 1))}
              className="w-8 h-8 rounded-lg bg-white text-stone-700 hover:bg-stone-200 flex items-center justify-center font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => {
              handleAddOrUpdate();
              onClose();
            }}
            disabled={product.stock_quantity === 0}
            className="flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>
              {cartQty > 0 
                ? (language === 'hi' ? 'थैले में अपडेट करें' : 'Update in Cart') 
                : (language === 'hi' ? `थैले में जोड़ें (₹${(product.price * localQty).toLocaleString('en-IN')})` : `Add to Cart • ₹${(product.price * localQty).toLocaleString('en-IN')}`)}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailDrawer;
