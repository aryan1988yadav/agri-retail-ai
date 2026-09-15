import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, AlertTriangle, Package, Banknote, Plus, CheckCircle2, RefreshCw, Download, FileSpreadsheet, PieChart, BookOpen, Users } from 'lucide-react';
import { getInventoryStats, getLowStockAlerts, getPOSSales, adjustProductStock, getProducts } from '../services/api';
import { useUser } from '../context/UserContext';

const RetailerDashboard = () => {
  const { rameshKhata } = useUser();
  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState(20);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, lowRes, salesRes] = await Promise.all([
        getInventoryStats(),
        getLowStockAlerts(),
        getPOSSales(20)
      ]);
      setStats(statsRes.data);
      setLowStockItems(lowRes.data);
      setRecentSales(salesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportSalesCSV = () => {
    if (!recentSales || recentSales.length === 0) {
      alert('No sales to export.');
      return;
    }
    const headers = ['Invoice No', 'Date', 'Customer', 'Phone', 'Payment Mode', 'Items Count', 'Subtotal', 'GST', 'Total Amount'];
    const rows = recentSales.map((s) => [
      s.invoice_number,
      new Date(s.created_at).toLocaleDateString('en-IN'),
      `"${s.customer_name}"`,
      s.customer_phone || 'N/A',
      s.payment_method,
      s.items?.length || 0,
      s.subtotal,
      s.tax_amount,
      s.total_amount
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kisan_kendra_sales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportStockCSV = async () => {
    try {
      const res = await getProducts();
      const prods = res.data;
      const headers = ['ID', 'SKU', 'Product Name', 'Brand', 'Category', 'Unit', 'Cost Price', 'Sale Price', 'Current Stock', 'Valuation (INR)'];
      const rows = prods.map((p) => [
        p.id,
        p.sku || 'N/A',
        `"${p.name}"`,
        `"${p.brand}"`,
        `"${p.category?.name || 'Agri'}"`,
        p.unit,
        p.cost_price || p.price * 0.8,
        p.price,
        p.stock_quantity,
        p.price * p.stock_quantity
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `kisan_kendra_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockModal) return;
    setUpdating(true);
    try {
      await adjustProductStock(restockModal.id, restockQty);
      setRestockModal(null);
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to restock');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm">Loading Store Analytics...</p>
      </div>
    );
  }

  return (
    <div className="pb-16 max-w-7xl mx-auto space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">AgriRetail Business Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">Live store sales, inventory valuation & automatic low-stock alerts</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportSalesCSV}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs bg-white"
            title="Download full sales ledger in Excel/CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Sales CSV</span>
          </button>
          <button
            onClick={exportStockCSV}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs bg-white"
            title="Download full inventory sheet in Excel/CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Inventory CSV</span>
          </button>
          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs bg-white"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Seasonal Restock & Demand Forecast Alert */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-stone-900 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
            🌾
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black uppercase tracking-wider mb-1">
              Seasonal Restock Intelligence (Rabi Sowing Forecast)
            </div>
            <h3 className="text-base font-extrabold text-white">
              High local demand projected for Karnal cluster
            </h3>
            <p className="text-xs text-amber-100/90 leading-relaxed mt-0.5">
              Farmers are entering the Wheat & Mustard sowing window. Projected local demand: ~250 bags Shriram 303 Wheat seeds & ~400 bags IFFCO DAP. Recommended buffer reorder: 50 bags.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const wheatProd = lowStockItems.find((i) => i.name.toLowerCase().includes('wheat')) || { id: 6, name: 'Shriram Super 303 Wheat Seeds' };
            setRestockModal(wheatProd);
            setRestockQty(50);
          }}
          className="px-4 py-2.5 rounded-xl bg-white text-stone-900 font-bold text-xs hover:bg-amber-50 shrink-0 shadow-sm cursor-pointer"
        >
          Quick Order Stock
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inventory Valuation</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{stats?.retail_valuation?.toLocaleString('en-IN') || 0}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">Expected margin: ₹{stats?.expected_gross_profit?.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Products</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats?.total_products || 0}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Across 5 agriculture categories</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {stats?.low_stock_count || 0}
            </div>
            <span className="text-[11px] text-amber-700 font-medium">Below reorder safety threshold</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recent Transactions</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {recentSales?.length || 0}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Recorded at POS counter</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Low Stock Warning List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">Urgent Restock Needed</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">{lowStockItems.length} alerts</span>
          </div>

          {lowStockItems.length === 0 ? (
            <div className="py-8 text-center text-emerald-700 bg-emerald-50 rounded-2xl text-xs font-semibold">
              ✓ All products have healthy inventory levels! No immediate shortages.
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/70 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      Brand: <span className="font-semibold text-slate-700">{item.brand}</span> • Current Stock: <strong className="text-amber-700">{item.stock_quantity} {item.unit}</strong> (Threshold: {item.low_stock_threshold})
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRestockModal(item);
                      setRestockQty(25);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Restock</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown & Payment Method Distribution */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Category Stock Distribution</span>
              <span className="text-xs text-slate-400 font-normal">
                {stats?.category_summary?.reduce((acc, c) => acc + c.total_units, 0) || 0} units
              </span>
            </h3>
            <div className="space-y-3 mt-3">
              {stats?.category_summary?.map((cat, idx) => {
                const totalUnits = stats.category_summary.reduce((acc, c) => acc + c.total_units, 0) || 1;
                const pct = Math.round((cat.total_units / totalUnits) * 100);
                const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-amber-500', 'bg-purple-600', 'bg-teal-600'];
                const barColor = colors[idx % colors.length];
                return (
                  <div key={cat.category_id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800">{cat.category_name} ({cat.product_count} items)</span>
                      <span className="text-slate-900 font-bold">{cat.total_units} units ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-emerald-600" />
              <span>Counter Payment Split ({recentSales.length} bills)</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] text-emerald-700 font-bold block uppercase">Cash</span>
                <span className="text-base font-black text-emerald-900">
                  {recentSales.filter(s => s.payment_method === 'Cash').length}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {recentSales.length > 0 ? Math.round((recentSales.filter(s => s.payment_method === 'Cash').length / recentSales.length) * 100) : 0}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] text-blue-700 font-bold block uppercase">UPI / QR</span>
                <span className="text-base font-black text-blue-900">
                  {recentSales.filter(s => s.payment_method === 'UPI').length}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {recentSales.length > 0 ? Math.round((recentSales.filter(s => s.payment_method === 'UPI').length / recentSales.length) * 100) : 0}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-[10px] text-amber-700 font-bold block uppercase">Khata</span>
                <span className="text-base font-black text-amber-900">
                  {recentSales.filter(s => s.payment_method === 'Khata').length}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {recentSales.length > 0 ? Math.round((recentSales.filter(s => s.payment_method === 'Khata').length / recentSales.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent POS Sales Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
          Recent Counter Invoices
        </h3>
        {recentSales.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">No sales recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="pb-3">Invoice No</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Mode</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80">
                    <td className="py-3 font-bold text-emerald-700">{sale.invoice_number}</td>
                    <td className="py-3 text-slate-800 font-medium">{sale.customer_name}</td>
                    <td className="py-3 text-slate-500">{sale.items?.length || 1} items</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700">
                        {sale.payment_method}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-slate-900">₹{sale.total_amount?.toLocaleString('en-IN')}</td>
                    <td className="py-3 text-right text-slate-400">
                      {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Village Khata Ledger (उधार खाता प्रबंधन) */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                Kendra Farmer Khata Ledger (ग्रामीण उधार बही-खाता)
              </h3>
              <p className="text-[11px] text-stone-500">
                Seasonal credit balances approved for village cluster farmers
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900">
            Total Active Credit: ₹{(rameshKhata + 7850 + 12400).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-100 text-stone-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Farmer Name</th>
                <th className="pb-3">Village / Cluster</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">Credit Limit</th>
                <th className="pb-3 text-right">Outstanding Debt</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              <tr className="hover:bg-amber-50/40">
                <td className="py-3 font-bold text-stone-900 flex items-center gap-1.5">
                  <span>👨‍🌾 Ramesh Kumar</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 font-black">DEMO</span>
                </td>
                <td className="py-3 text-stone-600">Kunjpura, Karnal</td>
                <td className="py-3 text-stone-500">98123-45670</td>
                <td className="py-3 text-stone-700">₹15,000</td>
                <td className="py-3 text-right font-black text-amber-900">
                  ₹{rameshKhata.toLocaleString('en-IN')}
                </td>
                <td className="py-3 text-right">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    rameshKhata === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {rameshKhata === 0 ? '✓ Cleared' : 'Rabi Due'}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="py-3 font-bold text-stone-900">👨‍🌾 Baldev Singh</td>
                <td className="py-3 text-stone-600">Gharaunda, Karnal</td>
                <td className="py-3 text-stone-500">98761-23456</td>
                <td className="py-3 text-stone-700">₹20,000</td>
                <td className="py-3 text-right font-black text-amber-900">₹7,850</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-800">
                    Active Credit
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="py-3 font-bold text-stone-900 flex items-center gap-1.5">
                  <span>👩‍🌾 Sunita Devi</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950 font-black">DEMO</span>
                </td>
                <td className="py-3 text-stone-600">Sanwer, Indore</td>
                <td className="py-3 text-stone-500">98765-01234</td>
                <td className="py-3 text-stone-700">₹25,000</td>
                <td className="py-3 text-right font-black text-emerald-700">₹0</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-800">
                    ✓ Cleared (UPI)
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-stone-50">
                <td className="py-3 font-bold text-stone-900">👨‍🌾 Gurpreet Gill</td>
                <td className="py-3 text-stone-600">Nilokheri, Karnal</td>
                <td className="py-3 text-stone-500">98112-23344</td>
                <td className="py-3 text-stone-700">₹30,000</td>
                <td className="py-3 text-right font-black text-amber-900">₹12,400</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-800">
                    Active Credit
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form onSubmit={handleRestockSubmit} className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Restock Product Inventory</h3>
            <p className="text-xs text-slate-500">
              Adding new supplier stock batch for <strong className="text-slate-800">{restockModal.name}</strong>
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Quantity to Add ({restockModal.unit}):</label>
              <input
                type="number"
                min="1"
                required
                value={restockQty}
                onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                {updating ? 'Updating...' : 'Confirm Stock'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RetailerDashboard;
