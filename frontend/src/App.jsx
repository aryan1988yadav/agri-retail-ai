import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { UserProvider, useUser } from './context/UserContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ChatbotModal from './components/ChatbotModal';
import LoginPage from './pages/LoginPage';
import Marketplace from './pages/Marketplace';
import CropPrediction from './pages/CropPrediction';
import POSBilling from './pages/POSBilling';
import RetailerDashboard from './pages/RetailerDashboard';
import KisanMandi from './components/KisanMandi';
import FarmerKhataPassbook from './components/FarmerKhataPassbook';
import { Bot } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isFarmer, isRetailer } = useUser();
  const [activeTab, setActiveTab] = useState(isRetailer ? 'pos' : 'marketplace');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Sync tab when switching roles
  useEffect(() => {
    if (isRetailer && (activeTab === 'marketplace' || activeTab === 'prediction' || activeTab === 'khata')) {
      setActiveTab('pos');
    } else if (isFarmer && (activeTab === 'pos' || activeTab === 'dashboard')) {
      setActiveTab('marketplace');
    }
  }, [isRetailer, isFarmer]);

  // If user is not authenticated, display modern Apple/Blinkit login page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      
      {/* Role-Adaptive Desktop Navbar (Reclaims 50px vertical screen space on laptops) */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Slide-Over Cart Drawer */}
      <CartDrawer />

      {/* Main Application Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {activeTab === 'marketplace' && (
          <Marketplace onNavigateToPrediction={() => setActiveTab('prediction')} />
        )}
        {activeTab === 'prediction' && <CropPrediction />}
        {activeTab === 'mandi' && (
          <div className="space-y-6 pb-12">
            <KisanMandi />
          </div>
        )}
        {activeTab === 'khata' && <FarmerKhataPassbook />}
        {activeTab === 'pos' && <POSBilling />}
        {activeTab === 'dashboard' && <RetailerDashboard />}
      </main>

      {/* Floating 24/7 AI Agronomist Chatbot Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Chat with Kisan AI Doctor"
        >
          <Bot className="w-5 h-5 text-emerald-200" />
          <span className="hidden sm:inline">Ask AI Agronomist</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </div>

      {/* Live Grounded AI Chatbot Modal */}
      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />

      {/* Clean Minimalist Footer */}
      <footer className="border-t border-stone-200 bg-white py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-900">AgriRetail Phygital OS</span>
            <span>• Integrated Kisan Portal & Kendra Counter POS</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span>FastAPI Backend (8000)</span>
            <span>•</span>
            <span>React + Vite (5173)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </UserProvider>
  );
}

export default App;
