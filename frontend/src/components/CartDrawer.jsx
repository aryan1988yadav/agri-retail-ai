import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle2, Tag, ShieldCheck, QrCode } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../utils/translations';
import { placeOrder } from '../services/api';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { currentPersona, language } = useUser();
  const { t } = useTranslation(language);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customer_name: currentPersona?.name || '',
    customer_phone: currentPersona?.phone || '',
    delivery_address: `${currentPersona?.village || 'Kunjpura'}, ${currentPersona?.district || 'Karnal'}`,
    payment_method: 'UPI'
  });

  useEffect(() => {
    if (currentPersona) {
      setFormData(prev => ({
        ...prev,
        customer_name: currentPersona.name,
        customer_phone: currentPersona.phone,
        delivery_address: `${currentPersona.village || 'Village'}, ${currentPersona.district || 'District'}`
      }));
    }
  }, [currentPersona]);

  if (!isCartOpen) return null;

  // Calculate Govt Subsidy Savings across cart items
  let totalSubsidySavings = 0;
  cart.forEach(item => {
    const name = item.product.name.toLowerCase();
    let unitSubsidy = 0;
    if (name.includes('urea') && !name.includes('nano')) {
      unitSubsidy = 2450 - item.product.price;
    } else if (name.includes('dap')) {
      unitSubsidy = 2750 - item.product.price;
    } else if (name.includes('mop') || name.includes('potash')) {
      unitSubsidy = 2400 - item.product.price;
    }
    totalSubsidySavings += unitSubsidy * item.quantity;
  });

  const totalMRP = subtotal + totalSubsidySavings;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.customer_name || !formData.customer_phone) {
      setError('Please fill in customer details');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        delivery_address: formData.delivery_address,
        payment_method: formData.payment_method,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await placeOrder(payload);
      setOrderPlaced(res.data);
      clearCart();
      setIsCheckingOut(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-stone-900">
                  {language === 'hi' ? 'आपका कृषि थैला' : 'Your Kisan Cart'}
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {cart.length} {language === 'hi' ? 'सामग्री चयनित' : 'items selected'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Screen */}
          {orderPlaced ? (
            <div className="p-6 flex-1 flex flex-col items-center justify-between text-center overflow-y-auto space-y-6">
              <div className="w-full my-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-xl font-black text-stone-900">
                  {language === 'hi' ? 'ऑर्डर सफलतापूर्वक आरक्षित!' : 'Order Reserved Successfully!'}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Order ID: <span className="font-mono font-bold text-stone-800">{orderPlaced.order_number}</span>
                </p>

                <div className="mt-6 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left space-y-2 text-xs">
                  <div className="font-bold text-stone-800">
                    📍 {language === 'hi' ? 'उठाव केंद्र:' : 'Pickup Location:'} Sharma Krishi Kendra (GT Road, Karnal)
                  </div>
                  <p className="text-stone-500 text-[11px]">
                    {language === 'hi' 
                      ? 'आपकी सामग्री काउंटर पर सुरक्षित रख दी गई है। केंद्र पर आकर बिल का भुगतान करें या UPI द्वारा पूरा करें।' 
                      : 'Stock has been allocated from central godown. Ready for immediate counter pickup.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setOrderPlaced(null);
                  setIsCartOpen(false);
                }}
                className="w-full py-3.5 rounded-xl bg-stone-900 text-white font-black text-xs hover:bg-stone-800 cursor-pointer"
              >
                {language === 'hi' ? 'दुकान पर वापस जाएं' : 'Done / Continue Shopping'}
              </button>
            </div>
          ) : cart.length === 0 ? (
            /* Empty Cart */
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-stone-100 text-stone-400 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-800">
                {language === 'hi' ? 'आपका थैला खाली है' : 'Your cart is empty'}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {language === 'hi' ? 'दुकान से बीज, खाद व कीटनाशक जोड़ें।' : 'Browse aisles and add seeds, fertilizers, or pest care.'}
              </p>
            </div>
          ) : isCheckingOut ? (
            /* Checkout Form */
            <form onSubmit={handleCheckoutSubmit} className="p-6 flex-1 flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-4">
                <h3 className="font-black text-sm text-stone-900 border-b border-stone-100 pb-2">
                  {language === 'hi' ? 'किसान व भुगतान विवरण' : 'Customer & Payment Details'}
                </h3>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    {language === 'hi' ? 'किसान का नाम' : 'Farmer Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1">
                    {language === 'hi' ? 'गाँव / पता' : 'Village & Address'}
                  </label>
                  <input
                    type="text"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-1.5">
                    {language === 'hi' ? 'भुगतान का तरीका' : 'Payment Method'}
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'UPI', label: language === 'hi' ? 'UPI QR से भुगतान' : 'Instant UPI QR', desc: 'GPay, PhonePe, Paytm' },
                      { id: 'COD', label: language === 'hi' ? 'दुकान पर नकद (Cash)' : 'Cash on Counter Pickup', desc: 'Pay when picking up goods' },
                      { id: 'Khata', label: language === 'hi' ? 'खाता उधार (Pay After Harvest)' : 'Farmer Khata (Credit)', desc: 'Pay post-harvest at Kendra' }
                    ].map((m) => (
                      <label
                        key={m.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          formData.payment_method === m.id
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                            : 'border-stone-200 bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="payment_method"
                            checked={formData.payment_method === m.id}
                            onChange={() => setFormData({ ...formData, payment_method: m.id })}
                            className="accent-emerald-600"
                          />
                          <div>
                            <div className="text-xs font-bold text-stone-900">{m.label}</div>
                            <div className="text-[10px] text-stone-500">{m.desc}</div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="w-1/3 py-3 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-100 cursor-pointer"
                >
                  {language === 'hi' ? 'पीछे' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (language === 'hi' ? `पुष्टि करें (₹${subtotal.toLocaleString('en-IN')})` : `Confirm Order • ₹${subtotal.toLocaleString('en-IN')}`)}
                </button>
              </div>
            </form>
          ) : (
            /* Standard Cart View with Item List & Flipkart/Blinkit Bill Breakdown */
            <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto space-y-6">
              
              {/* Itemized Cart List */}
              <div className="space-y-3 divide-y divide-stone-100">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-extrabold uppercase text-emerald-800">
                        {item.product.brand}
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        ₹{item.product.price} / {item.product.unit}
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center rounded-xl bg-stone-100 border border-stone-200 p-0.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity}
                        className="w-6 h-6 rounded-lg bg-white hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right shrink-0 min-w-[60px]">
                      <div className="text-xs font-black text-stone-900">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Details Breakdown (Flipkart / Blinkit Style) */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs">
                <div className="font-extrabold text-stone-900 text-xs border-b border-stone-200 pb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t.billDetails}</span>
                </div>

                {totalSubsidySavings > 0 && (
                  <div className="flex justify-between text-stone-500">
                    <span>{t.itemTotal} ({language === 'hi' ? 'मूल मूल्य' : 'Market MRP'})</span>
                    <span className="line-through">₹{totalMRP.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {totalSubsidySavings > 0 && (
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>{t.subsidyDiscount}</span>
                    <span>-₹{totalSubsidySavings.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>{t.pickupCharge}</span>
                  <span className="font-bold text-emerald-700">{t.free}</span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-black text-sm text-stone-900">
                  <span>{t.grandTotal}</span>
                  <span className="text-base text-emerald-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {totalSubsidySavings > 0 && (
                  <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-900 text-[10px] font-bold text-center mt-2">
                    {t.youSaved.replace('{amount}', totalSubsidySavings.toLocaleString('en-IN'))}
                  </div>
                )}
              </div>

              {/* Proceed Button */}
              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>{language === 'hi' ? 'ऑर्डर आगे बढ़ाएं' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
