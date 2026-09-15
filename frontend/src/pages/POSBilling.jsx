import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, Minus, Trash2, Printer, CheckCircle2, AlertCircle, 
  ShoppingCart, User, CreditCard, Banknote, QrCode, BookOpen, 
  RefreshCw, Scan, Zap, Sparkles, Clock, MapPin, Receipt, X, 
  Share2, Check, ArrowRight
} from 'lucide-react';
import { getProducts, createPOSSale } from '../services/api';
import { useUser } from '../context/UserContext';
import { useTranslation } from '../utils/translations';

const POSBilling = () => {
  const { rameshKhata, addPOSCreditToCustomer, currentPersona, language } = useUser();
  const { t } = useTranslation(language);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(null);

  // Active POS Bill Items
  const [billItems, setBillItems] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Kisan');
  const [customerPhone, setCustomerPhone] = useState('');
  const [farmerVillage, setFarmerVillage] = useState('');
  const [khataDueDate, setKhataDueDate] = useState('');
  const [khataAadhaar, setKhataAadhaar] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, UPI, Khata
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(5); // 5% average GST on agricultural inputs
  const [notes, setNotes] = useState('');

  // Barcode / SKU rapid input
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeMsg, setBarcodeMsg] = useState('');
  const barcodeInputRef = useRef(null);

  const [processing, setProcessing] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [error, setError] = useState('');

  // Live Terminal Clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const query = barcodeInput.trim().toLowerCase();
    const found = products.find(
      (p) =>
        (p.sku && p.sku.toLowerCase() === query) ||
        p.name.toLowerCase().includes(query) ||
        (p.technical_name && p.technical_name.toLowerCase().includes(query))
    );
    if (found) {
      if (found.stock_quantity <= 0) {
        setBarcodeMsg(`⚠️ ${found.name} is Out of Stock!`);
      } else {
        addItemToBill(found);
        setBarcodeMsg(`✓ Scanned: ${found.name}`);
      }
    } else {
      setBarcodeMsg(`❌ No SKU found for "${barcodeInput}"`);
    }
    setBarcodeInput('');
    setTimeout(() => setBarcodeMsg(''), 3000);
  };

  const addItemToBill = (product) => {
    if (product.stock_quantity <= 0) return;

    setBillItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, unit_price: product.price }];
    });
  };

  const updateBillQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeBillItem(productId);
      return;
    }
    setBillItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.product.stock_quantity, newQty) }
          : item
      )
    );
  };

  const removeBillItem = (productId) => {
    setBillItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearBill = () => {
    setBillItems([]);
    setCustomerName('Walk-in Kisan');
    setCustomerPhone('');
    setFarmerVillage('');
    setKhataDueDate('');
    setKhataAadhaar('');
    setDiscount(0);
    setNotes('');
    setError('');
  };

  // Financial calculations
  const subtotal = billItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const totalPayable = Math.max(0, subtotal + taxAmount - discount);

  const handleCheckout = async () => {
    if (billItems.length === 0) {
      setError('Please add at least one product to the invoice.');
      return;
    }
    setError('');
    setProcessing(true);

    try {
      let finalNotes = notes || '';
      if (paymentMethod === 'Khata') {
        const khataDetails = [
          farmerVillage ? `Village: ${farmerVillage}` : '',
          khataDueDate ? `Due: ${khataDueDate}` : 'Due: Post-Harvest',
          khataAadhaar ? `ID: ${khataAadhaar}` : ''
        ].filter(Boolean).join(' | ');
        finalNotes = `[KHATA CREDIT - ${khataDetails}] ${finalNotes}`.trim();
      }

      const payload = {
        customer_name: customerName || 'Walk-in Kisan',
        customer_phone: customerPhone || null,
        payment_method: paymentMethod,
        discount_amount: parseFloat(discount) || 0,
        tax_amount: parseFloat(taxAmount) || 0,
        notes: finalNotes || null,
        items: billItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        })),
      };

      const res = await createPOSSale(payload);
      if (paymentMethod === 'Khata') {
        const itemsSummary = billItems.map((i) => `${i.quantity}x ${i.product.name}`).join(', ');
        addPOSCreditToCustomer(customerName, totalPayable, itemsSummary);
      }
      setInvoiceResult(res.data);
      clearBill();
      fetchCatalog(); // Refresh live stocks
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate invoice');
    } finally {
      setProcessing(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCat ? p.category_id === selectedCat : true;
    const matchSearch = search.trim()
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        (p.technical_name && p.technical_name.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchCat && matchSearch;
  });

  return (
    <div className="pb-16 max-w-7xl mx-auto space-y-5 px-2 sm:px-4">
      
      {/* 1. High-Tech Cashier Terminal Header (Square / Toast POS style) */}
      <div className="bg-stone-900 text-white p-4 rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Kendra Smart POS Terminal
              </h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE #01
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
              <span>Operator: <strong className="text-stone-200">Rajendra Sharma</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-stone-400">
                <Clock className="w-3 h-3" />
                {currentTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </p>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => barcodeInputRef.current?.focus()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-400" />
            <span>Barcode Scanner (F2)</span>
          </button>

          <button
            onClick={clearBill}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Register</span>
          </button>
        </div>
      </div>

      {/* 2. Main Terminal Grid: Left Catalog & Right Cash Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Fast Product Grid & Barcode Scanner (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Quick Scanner & Search Toolbar */}
          <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            
            {/* Rapid Barcode / SKU Input */}
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Scan className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="⚡ Scan Barcode or type SKU (e.g. UREA-50KG, DAP-50KG, CORAGEN) & press Enter..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:font-normal placeholder:text-stone-400 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm shrink-0 cursor-pointer transition-all active:scale-95"
              >
                + Quick Scan
              </button>
            </form>

            {barcodeMsg && (
              <div className={`text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 animate-in fade-in ${
                barcodeMsg.startsWith('✓') ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-rose-100 text-rose-900 border border-rose-200'
              }`}>
                <span>{barcodeMsg}</span>
              </div>
            )}

            {/* Catalog Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search catalog by product name, brand, or formula..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50"
                />
              </div>

              {/* Category Quick Pills */}
              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                <button
                  onClick={() => setSelectedCat(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCat === null
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setSelectedCat(1)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCat === 1
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🧪 Fertilizers
                </button>
                <button
                  onClick={() => setSelectedCat(2)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCat === 2
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🌱 Seeds
                </button>
                <button
                  onClick={() => setSelectedCat(3)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCat === 3
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🛡️ Crop Protection
                </button>
              </div>
            </div>

          </div>

          {/* Product Cards Grid - Modern Tactile POS Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {loading ? (
              <div className="col-span-3 py-16 text-center text-stone-400">Loading live stock catalog...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-stone-400 bg-white rounded-3xl border border-stone-200">
                No inventory item matching your query
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isOut = p.stock_quantity <= 0;
                const inBill = billItems.find(i => i.product.id === p.id);
                const isLow = p.stock_quantity > 0 && p.stock_quantity <= (p.low_stock_threshold || 15);

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOut && addItemToBill(p)}
                    className={`relative p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between select-none cursor-pointer ${
                      isOut
                        ? 'bg-stone-50 border-stone-200 opacity-50 cursor-not-allowed'
                        : inBill
                          ? 'bg-emerald-50/60 border-emerald-500 shadow-xs'
                          : 'bg-white border-stone-200/90 hover:border-emerald-500 hover:shadow-md active:scale-98'
                    }`}
                  >
                    {/* Top status & count badge */}
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="uppercase text-emerald-800 truncate font-black">{p.brand}</span>
                      <span className={`px-1.5 py-0.2 rounded-md ${
                        isOut ? 'bg-rose-100 text-rose-700' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {isOut ? 'Out' : `${p.stock_quantity} left`}
                      </span>
                    </div>

                    {/* Product Name & SKU */}
                    <div className="my-2">
                      <h4 className="text-xs font-black text-stone-900 line-clamp-2 leading-tight" title={p.name}>
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                        {p.unit} {p.sku ? `• ${p.sku}` : ''}
                      </p>
                    </div>

                    {/* Price & Add indicator */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-sm font-black text-stone-900">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>

                      {inBill ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-700 text-white font-black text-[11px] flex items-center gap-1 shadow-2xs">
                          <Check className="w-3 h-3" />
                          <span>{inBill.quantity}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isOut}
                          className="w-7 h-7 rounded-xl bg-stone-100 hover:bg-emerald-600 hover:text-white text-stone-700 flex items-center justify-center transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Live Register & Cashier Terminal (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/90 shadow-xl p-5 space-y-4 sticky top-20">
          
          {/* Active Register Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-stone-900">Current Sale Invoice</h3>
                <span className="text-[10px] text-stone-400 font-medium">Real-time Stock Deduct</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-stone-100 text-stone-700 border border-stone-200">
              {billItems.reduce((sum, i) => sum + i.quantity, 0)} Items
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Farmer Picker Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
              1. Customer / Farmer Account:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setCustomerName('Ramesh Kumar');
                  setCustomerPhone('98123-45670');
                  setFarmerVillage('Kunjpura, Karnal');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  customerName.includes('Ramesh')
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-black'
                    : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                }`}
              >
                👨‍🌾 Ramesh (Khata: ₹{rameshKhata.toFixed(0)})
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomerName('Sunita Devi');
                  setCustomerPhone('98765-01234');
                  setFarmerVillage('Sanwer, MP');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  customerName.includes('Sunita')
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs font-black'
                    : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                }`}
              >
                👩‍🌾 Sunita (₹0)
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomerName('Walk-in Kisan');
                  setCustomerPhone('');
                  setFarmerVillage('');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  customerName === 'Walk-in Kisan'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                }`}
              >
                Walk-in
              </button>
            </div>
          </div>

          {/* Customer Input Card */}
          <div className="grid grid-cols-2 gap-2 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase block mb-0.5">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Farmer name"
                className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-500 uppercase block mb-0.5">Mobile Number</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="10-digit phone"
                className="w-full bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Line Items List on Invoice */}
          <div className="max-h-52 overflow-y-auto space-y-1.5 border-b border-stone-100 pb-3 pr-1">
            {billItems.length === 0 ? (
              <div className="py-10 text-center text-stone-400 space-y-2">
                <ShoppingCart className="w-8 h-8 text-stone-300 mx-auto" />
                <div className="text-xs font-bold text-stone-500">Register is empty</div>
                <p className="text-[11px] text-stone-400">Scan barcode or tap products on the left</p>
              </div>
            ) : (
              billItems.map((item) => (
                <div key={item.product.id} className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-900 truncate">{item.product.name}</div>
                    <div className="text-[10px] text-stone-500">₹{item.unit_price} each • {item.product.unit}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Stepper */}
                    <div className="flex items-center border border-stone-300 rounded-lg bg-white">
                      <button
                        onClick={() => updateBillQty(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-black text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateBillQty(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-stone-100 text-stone-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="w-14 text-right font-black text-stone-900 text-xs">
                      ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                    </span>

                    <button
                      onClick={() => removeBillItem(item.product.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. Payment Mode Selector Buttons */}
          <div>
            <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
              2. Payment Method:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', label: 'Cash (नकद)', icon: Banknote },
                { id: 'UPI', label: 'UPI QR', icon: QrCode },
                { id: 'Khata', label: 'Khata (उधार)', icon: BookOpen },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs font-black'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic UPI QR Display */}
          {paymentMethod === 'UPI' && billItems.length > 0 && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 animate-in fade-in">
              <div className="p-1.5 bg-white rounded-xl shadow-xs border border-emerald-100 shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                    `upi://pay?pa=agriretail@icici&pn=SharmaKrishiKendra&am=${totalPayable}&cu=INR&tn=KendraPOS`
                  )}`}
                  alt="UPI QR"
                  className="w-18 h-18 object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                  Scan & Pay via UPI
                </span>
                <div className="text-base font-black text-stone-900">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">
                  PhonePe • Google Pay • Paytm • BHIM
                </div>
              </div>
            </div>
          )}

          {/* Khata Credit Ledger Details */}
          {paymentMethod === 'Khata' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 animate-in fade-in text-xs">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>Kisan Khata Credit Schedule</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Village / Tehsil</label>
                  <input
                    type="text"
                    value={farmerVillage}
                    onChange={(e) => setFarmerVillage(e.target.value)}
                    placeholder="e.g. Kunjpura"
                    className="w-full bg-white px-2 py-1.5 rounded-lg border border-amber-300 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 block mb-0.5">Due Date (Post-Harvest)</label>
                  <input
                    type="date"
                    value={khataDueDate}
                    onChange={(e) => setKhataDueDate(e.target.value)}
                    className="w-full bg-white px-2 py-1.5 rounded-lg border border-amber-300 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              {customerName.includes('Ramesh') && (
                <div className="p-2 rounded-xl bg-amber-100/90 border border-amber-300 text-[11px] text-amber-950 font-medium">
                  <div className="flex justify-between">
                    <span>Previous Outstanding Khata:</span>
                    <span className="font-bold">₹{rameshKhata.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-amber-950 pt-0.5 mt-0.5 border-t border-amber-200">
                    <span>New Combined Debt:</span>
                    <span>₹{(rameshKhata + totalPayable).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Financial Calculation Box */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Govt Agri GST (5%):</span>
              <span className="font-bold text-stone-900">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Special Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-0.5 rounded-lg border border-stone-200 text-right text-xs font-bold focus:outline-none bg-white"
              />
            </div>

            {/* Glowing Cashier Grand Total */}
            <div className="flex justify-between items-center pt-2 mt-1 border-t border-stone-200">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">Grand Total:</span>
              <span className="text-2xl font-black text-emerald-800 tracking-tight">
                ₹{totalPayable.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Prominent High-Contrast Checkout Bar */}
          <button
            onClick={handleCheckout}
            disabled={processing || billItems.length === 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 active:scale-[0.99] disabled:bg-stone-200 disabled:text-stone-400 text-white font-black text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {processing ? (
              <span>Generating Tax Invoice...</span>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                <span>Complete Sale & Print Bill (₹{totalPayable.toLocaleString('en-IN')})</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* Modern Thermal Receipt Modal */}
      {invoiceResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4 my-8">
            
            {/* Success Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-black text-sm">Sale Completed Successfully!</span>
              </div>
              <button 
                onClick={() => setInvoiceResult(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Slip Container */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 font-mono text-xs text-stone-800 space-y-3" id="pos-thermal-receipt">
              
              {/* Slip Header */}
              <div className="text-center border-b border-dashed border-stone-400 pb-3 space-y-0.5">
                <div className="font-black text-sm text-stone-900 tracking-wider">
                  *** SHARMA KRISHI SEVA KENDRA ***
                </div>
                <div className="text-[10px] text-stone-600">
                  Fertilizer/Seed Lic: HR/KNL/2024/7821
                </div>
                <div className="text-[10px] text-stone-600">
                  GSTIN: 06AAACS1234K1Z5 • GT Road Market, Karnal
                </div>
                <div className="text-[11px] font-bold text-stone-900 pt-1">
                  RETAIL TAX INVOICE / CASH MEMO
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="text-[11px] space-y-0.5 border-b border-dashed border-stone-300 pb-2">
                <div className="flex justify-between">
                  <span><strong>Bill No:</strong> {invoiceResult.invoice_number}</span>
                  <span><strong>Terminal:</strong> #01</span>
                </div>
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span><strong>Date:</strong> {new Date(invoiceResult.created_at).toLocaleDateString('en-IN')}</span>
                  <span>{new Date(invoiceResult.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div><strong>Farmer:</strong> {invoiceResult.customer_name}</div>
                {invoiceResult.customer_phone && <div><strong>Mobile:</strong> {invoiceResult.customer_phone}</div>}
                <div><strong>Payment:</strong> <span className="font-bold uppercase text-emerald-800">{invoiceResult.payment_method}</span></div>
                {invoiceResult.notes && (
                  <div className="text-[10px] text-stone-500 italic mt-0.5">{invoiceResult.notes}</div>
                )}
              </div>

              {/* Items Table */}
              <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-2">
                <div className="flex justify-between font-bold text-[11px] text-stone-900 border-b border-stone-200 pb-1">
                  <span className="flex-1">Item Description</span>
                  <span className="w-10 text-center">Qty</span>
                  <span className="w-14 text-right">Rate</span>
                  <span className="w-16 text-right">Total</span>
                </div>
                {invoiceResult.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-[10px]">
                    <span className="flex-1 truncate pr-1">{item.product?.name || `Product #${item.product_id}`}</span>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <span className="w-14 text-right">₹{item.unit_price}</span>
                    <span className="w-16 text-right font-bold">₹{item.total_price}</span>
                  </div>
                ))}
              </div>

              {/* Tax & Grand Totals */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{invoiceResult.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>CGST (2.5%):</span>
                  <span>₹{(invoiceResult.tax_amount / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>SGST (2.5%):</span>
                  <span>₹{(invoiceResult.tax_amount / 2).toFixed(2)}</span>
                </div>
                {invoiceResult.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-₹{invoiceResult.discount_amount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-stone-400">
                  <span>NET PAID:</span>
                  <span className="text-emerald-800">₹{invoiceResult.total_amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Dynamic QR on Slip */}
              <div className="pt-2 border-t border-dashed border-stone-300 text-center flex flex-col items-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                    `upi://pay?pa=agriretail@icici&pn=SharmaKrishiKendra&am=${invoiceResult.total_amount}&cu=INR&tn=${invoiceResult.invoice_number}`
                  )}`}
                  alt="Invoice QR"
                  className="w-16 h-16 object-contain mb-1"
                />
                <div className="text-[9px] text-stone-500">
                  Digital Payment & Invoice Verification QR
                </div>
              </div>

              {/* Footer Terms */}
              <div className="text-center pt-2 text-[9px] text-stone-500 leading-tight">
                <div>* Certified Subsidized Agricultural Inputs *</div>
                <div>* Goods once sold cannot be returned after seal opening *</div>
                <div className="font-bold text-stone-800 pt-1">*** JAI KISAN • DHANYAWAD ***</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4 text-stone-600" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setInvoiceResult(null)}
                className="flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Next Sale (F4)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default POSBilling;
