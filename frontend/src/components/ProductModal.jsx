import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, Sprout, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductVisual from './ProductVisual';

const ProductModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const isOutOfStock = product.stock_quantity === 0;

  const handleAddToCart = () => {
    addToCart(product, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
              {product.category?.name || 'Agricultural Input'}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ID: AGRI-{product.id.toString().padStart(4, '0')}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-full sm:w-48 h-48 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
              <ProductVisual product={product} className="w-full h-full" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
                {product.brand}
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                {product.name}
              </h2>
              {product.technical_name && (
                <p className="text-sm font-medium text-emerald-900/80 bg-emerald-50 border border-emerald-200/60 rounded-lg px-3 py-1.5 mt-2">
                  Chemical: <span className="font-semibold">{product.technical_name}</span>
                </p>
              )}
              
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-500 font-medium">
                  per {product.unit}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isOutOfStock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} available`}
                </span>
              </div>
            </div>
          </div>

          {/* Suitable Crops */}
          {product.suitable_crops && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>Suitable Crops</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.suitable_crops.split(',').map((crop, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800">
                    {crop.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dosage & Application Instructions */}
          {product.dosage_instructions && (
            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wide mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dosage & Method of Application</span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {product.dosage_instructions}
              </p>
            </div>
          )}

          {/* Safety Advice */}
          {product.safety_guidelines && (
            <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/60">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide mb-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Safety & Precautions</span>
              </div>
              <p className="text-sm text-amber-900/90 leading-relaxed font-normal">
                {product.safety_guidelines}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Quantity:</span>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-2 hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-sm text-slate-900">
                {qty}
              </span>
              <button 
                onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))}
                disabled={qty >= product.stock_quantity}
                className="p-2 hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Total: <strong className="text-slate-900">₹{(product.price * qty).toLocaleString('en-IN')}</strong>
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
