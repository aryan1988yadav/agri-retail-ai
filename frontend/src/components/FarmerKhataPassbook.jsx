import React, { useState } from 'react';
import { 
  BookOpen, Calendar, CheckCircle2, Clock, AlertCircle, 
  Receipt, ArrowUpRight, ArrowDownLeft, QrCode, ShieldCheck, 
  FileText, Download, UserCheck
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const FarmerKhataPassbook = () => {
  const { currentPersona, rameshKhata, rameshInvoices } = useUser();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showUpiModal, setShowUpiModal] = useState(false);

  const balance = currentPersona.id === 'ramesh' ? rameshKhata : 0.0;
  const invoices = currentPersona.id === 'ramesh' ? rameshInvoices : currentPersona.invoices || [];
  const creditLimit = 15000.0;
  const availableCredit = Math.max(0, creditLimit - balance);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      
      {/* 1. Farmer Passbook Header Card */}
      <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-white p-6 sm:p-8 shadow-xl border border-stone-700/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  Digital Kisan Passbook
                </span>
                <span className="text-xs text-stone-400">
                  Kendra: Sharma Krishi Kendra (GT Road)
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {currentPersona.name}'s Khata
              </h2>
              <p className="text-xs text-stone-300">
                A/C Phone: {currentPersona.phone} • Village: {currentPersona.village}, {currentPersona.district}
              </p>
            </div>
          </div>

          {/* Quick UPI Pay CTA */}
          {balance > 0 && (
            <button
              onClick={() => setShowUpiModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>Pay via UPI QR (भुगतान करें)</span>
            </button>
          )}

        </div>

        {/* Financial Overview Metrics */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              Total Outstanding Khata (कुल बकाया उधार)
            </div>
            <div className="text-3xl font-black text-amber-300 mt-1">
              ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
              {balance > 0 ? (
                <>
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Due on Rabi Harvest (15 April)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">All Dues Cleared! No Debt.</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              Seasonal Credit Limit (ऋण सीमा)
            </div>
            <div className="text-2xl font-black text-white mt-1">
              ₹{creditLimit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Verified by Retailer Rajendra Sharma
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-xs text-stone-400 font-bold uppercase tracking-wider">
              Remaining Credit Available (शेष सीमा)
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              ₹{availableCredit.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-stone-400 mt-1">
              Available for seeds & fertilizers
            </div>
          </div>

        </div>
      </div>

      {/* 2. Itemized Khata Passbook Ledger */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-emerald-700" />
            <h3 className="font-black text-lg text-stone-900">
              Itemized Passbook History (उधार व भुगतान का विवरण)
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-medium">
            {invoices.length} Transactions Recorded
          </span>
        </div>

        {invoices.length === 0 ? (
          <div className="py-16 text-center text-stone-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            <p className="text-xs font-semibold">No Khata transactions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 overflow-x-auto">
            {invoices.map((inv, idx) => {
              const isCredit = inv.amount > 0;
              const isSettlement = inv.amount < 0 || inv.type?.toLowerCase().includes('settle') || inv.type?.toLowerCase().includes('mandi');

              return (
                <div 
                  key={idx} 
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/80 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isSettlement 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : isCredit 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isSettlement ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-stone-900">{inv.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isSettlement 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isCredit 
                            ? 'bg-amber-100 text-amber-900' 
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {inv.type}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 font-medium mt-0.5">
                        {inv.items}
                      </p>
                      <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{inv.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                    <div className={`text-base font-black ${
                      isSettlement ? 'text-emerald-700' : 'text-stone-900'
                    }`}>
                      {isSettlement ? `Cleared ₹${Math.abs(inv.amount).toLocaleString('en-IN')}` : `₹${inv.amount.toLocaleString('en-IN')}`}
                    </div>
                    
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 cursor-pointer mt-1"
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Invoice Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="font-black text-stone-900 text-base">Sharma Krishi Seva Kendra</h4>
                <p className="text-[10px] text-stone-500 uppercase font-semibold">Official Khata Digital Receipt</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Invoice ID:</span>
                <span className="font-bold text-stone-900">{selectedInvoice.id}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Date:</span>
                <span className="font-bold text-stone-900">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Customer:</span>
                <span className="font-bold text-stone-900">{currentPersona.name}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Transaction Type:</span>
                <span className="font-bold text-emerald-700">{selectedInvoice.type}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-sm text-stone-900">
                <span>Total Amount:</span>
                <span>₹{Math.abs(selectedInvoice.amount).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-100 text-[11px] text-stone-600 leading-relaxed">
              <strong>Items Taken / Details:</strong> {selectedInvoice.items}
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* 4. Instant UPI QR Payment Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-black text-sm text-stone-900">Scan to Pay Kendra via UPI</span>
              <button onClick={() => setShowUpiModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl inline-block border border-stone-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=sharmakrishikendra@okhdfcbank%26pn=Sharma%20Krishi%20Kendra%26am=${balance}%26cu=INR`}
                alt="UPI Payment QR"
                className="w-44 h-44 mx-auto rounded-lg"
              />
              <div className="mt-2 text-xs font-black text-stone-900">
                Amount Due: ₹{balance.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-stone-500">VPA: sharmakrishikendra@okhdfcbank</div>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed">
              Scan with any UPI App (GPay, PhonePe, Paytm) to clear your outstanding fertilizer debt instantly.
            </p>

            <button
              onClick={() => setShowUpiModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerKhataPassbook;
