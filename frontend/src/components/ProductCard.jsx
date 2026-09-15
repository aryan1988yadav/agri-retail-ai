import React from 'react';
import { Plus, Minus, Tag, Check, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../utils/translations';
import ProductVisual from './ProductVisual';

const ProductCard = ({ product, onSelect }) => {
  const { addToCart, updateQuantity, cart } = useCart();
  const { language } = useUser();
  const { t } = useTranslation(language);

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= product.low_stock_threshold;
  const isOutOfStock = product.stock_quantity === 0;

  const inCart = cart.find((item) => item.product.id === product.id);
  const cartQty = inCart ? inCart.quantity : 0;

  // Subsidy Calculation
  const nameLower = product.name.toLowerCase();
  let marketPrice = null;
  if (nameLower.includes('urea') && !nameLower.includes('nano')) {
    marketPrice = 2450;
  } else if (nameLower.includes('dap')) {
    marketPrice = 2750;
  } else if (nameLower.includes('mop') || nameLower.includes('potash')) {
    marketPrice = 2400;
  }

  const handleIncrement = (e) => {
    e.stopPropagation();
    if (cartQty < product.stock_quantity) {
      if (cartQty === 0) {
        addToCart(product, 1);
      } else {
        updateQuantity(product.id, cartQty + 1);
      }
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (cartQty > 0) {
      updateQuantity(product.id, cartQty - 1);
    }
  };

  return (
    <div 
      onClick={() => onSelect(product)}
      className="group bg-[#FCFAF7] hover:bg-white rounded-3xl border border-[#E9E4DC] hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer select-none p-4"
    >
      {/* 1. Visual Presentation */}
      <div className="relative rounded-2xl overflow-hidden bg-[#F5F2EC]/80 border border-[#EAE5DC]">
        <ProductVisual product={product} className="w-full h-40 group-hover:scale-103 transition-transform duration-300" />

        {/* Subtle Status Pill */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 pointer-events-none">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-rose-600 text-white shadow-xs uppercase">
              {t.outOfStock}
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-500 text-white shadow-xs">
              {product.stock_quantity} left
            </span>
          ) : marketPrice ? (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-[#ECFDF5] text-emerald-900 border border-emerald-300 shadow-2xs">
              Govt Subsidy
            </span>
          ) : null}
        </div>

        {/* Quick Info hint */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(product);
          }}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
          title={t.viewDetails}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Minimalist Details */}
      <div className="pt-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
            {product.brand}
          </span>

          <h3 
            className="font-extrabold text-stone-900 text-sm leading-snug line-clamp-1 group-hover:text-emerald-700 transition-colors mt-0.5"
            title={product.name}
          >
            {product.name}
          </h3>

          <div className="text-[11px] text-stone-400 font-medium mt-0.5">
            {product.unit}
          </div>
        </div>

        {/* 3. Price & Add Stepper Row */}
        <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-stone-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {marketPrice && (
                <span className="text-[11px] text-stone-400 line-through">
                  ₹{marketPrice}
                </span>
              )}
            </div>
          </div>

          {/* Blinkit Style Stepper Button */}
          {cartQty > 0 ? (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center rounded-xl bg-emerald-700 text-white shadow-xs p-0.5 animate-in zoom-in-95 duration-150"
            >
              <button
                onClick={handleDecrement}
                className="w-7 h-7 rounded-lg hover:bg-emerald-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-black">
                {cartQty}
              </span>
              <button
                onClick={handleIncrement}
                disabled={cartQty >= product.stock_quantity}
                className="w-7 h-7 rounded-lg hover:bg-emerald-800 flex items-center justify-center font-bold transition-colors cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleIncrement}
              disabled={isOutOfStock}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 ${
                isOutOfStock
                  ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-700 hover:text-white hover:border-emerald-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.add}</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProductCard;
