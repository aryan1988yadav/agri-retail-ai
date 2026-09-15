import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Mic, MicOff, Volume2, X, Sparkles, ShoppingCart, Check, 
  RefreshCw, Maximize2, Minimize2, Bug, FlaskConical, Landmark, 
  CloudRain, TrendingUp, HelpCircle, PlusCircle, ShieldCheck
} from 'lucide-react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const QUICK_PROMPTS = [
  '🌾 Cropping Seasons in India',
  '🐛 Pink Bollworm & Armyworm',
  '🌿 Organic Jeevamrut Recipe',
  '🌱 Best Fertilizer for Wheat',
  '🧪 Leaf spots & blight cure',
  '🏛️ PM-KISAN Scheme'
];

const ADVISORY_TOPICS = [
  {
    category: 'Crop Protection & Pests',
    icon: Bug,
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    queries: ['Cure for yellow leaf rust in wheat', 'Pink bollworm control in cotton', 'Fall armyworm organic trap']
  },
  {
    category: 'Fertilizer & Soil Calibrations',
    icon: FlaskConical,
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    queries: ['When to split Urea for wheat crop', 'DAP vs SSP fertilizer cost comparison', 'Zinc Sulphate deficiency cure']
  },
  {
    category: 'Govt Schemes & Subsidies',
    icon: Landmark,
    color: 'text-amber-700 bg-amber-50 border-amber-200',
    queries: ['How to check PM-KISAN ₹2,000 installment', 'PM Fasal Bima crop insurance claim', 'Solar pump subsidy PM-KUSUM']
  },
  {
    category: 'Weather & Spray Advisory',
    icon: CloudRain,
    color: 'text-sky-700 bg-sky-50 border-sky-200',
    queries: ['Is today safe for pesticide spray?', 'Rainfall forecast for northern plains', 'High humidity blight risk']
  },
  {
    category: 'Mandi Benchmarks & MSP',
    icon: TrendingUp,
    color: 'text-purple-700 bg-purple-50 border-purple-200',
    queries: ['Govt MSP rates for Rabi season', 'Current market trend for Mustard', 'Direct mandi selling benefits']
  }
];

const ChatbotModal = ({ isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `🙏 **Namaste Kisan Bandhu!** I am your AgriRetail AI Agronomist.

Ask me about crop diseases, dosage schedules, or check live in-store stock for seeds and fertilizers.`,
      products: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [addedIds, setAddedIds] = useState({});
  const [isMaximized, setIsMaximized] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMaximized]);

  // Cancel speech audio immediately when modal closes or unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    onClose();
  };

  // Web Speech API for voice recognition (Hindi / Indian English)
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.error('Speech error:', e);
        setIsListening(false);
      };
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Natural Text-to-Speech playback with voice selection
  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Clean markdown symbols, asterisks, bullets, hashtags for fluid pronunciation
    const clean = text
      .replace(/[*_#`•]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/₹/g, 'Rupees ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    
    // Pick the most natural voice available
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = null;

    if (selectedLang.startsWith('hi')) {
      preferredVoice = voices.find(v => v.lang.includes('hi') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Kalpana') || v.name.includes('Hemant')))
        || voices.find(v => v.lang.includes('hi'));
    } else {
      preferredVoice = voices.find(v => (v.lang.includes('en-IN') || v.name.includes('India')) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neerja') || v.name.includes('Prabhat')))
        || voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'))
        || voices.find(v => v.name.includes('Natural') && v.lang.startsWith('en'))
        || voices.find(v => v.lang.startsWith('en'));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async (customMessage) => {
    const query = customMessage || input;
    if (!query.trim() || loading) return;

    // Stop speaking previous response when user sends a new message
    stopSpeaking();

    const userMsg = { role: 'user', content: query, products: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const apiHost = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
      const res = await axios.post(`http://${apiHost}:8000/api/chat`, {
        message: query,
        history: historyPayload
      });

      const botMsg = {
        role: 'assistant',
        content: res.data.reply,
        products: res.data.recommended_products || []
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Could not connect to the AgriRetail AI server. Please make sure FastAPI is running on port 8000.',
          products: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdd = (prod) => {
    addToCart(prod, 1);
    setAddedIds((prev) => ({ ...prev, [prod.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [prod.id]: false }));
    }, 2000);
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages([
      {
        role: 'assistant',
        content: `🙏 **Namaste Kisan Bandhu!** Starting a fresh consultation. How can I help you today with your crops or fertilizers?`,
        products: []
      }
    ]);
  };

  const renderMessageText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(\**.*?\**)/g);
      return (
        <span key={lineIdx} className="block">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-extrabold text-stone-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-300 animate-in fade-in ${
        isMaximized 
          ? 'p-2 sm:p-4 md:p-6 bg-stone-950/80 backdrop-blur-md flex items-center justify-center' 
          : 'flex items-end sm:items-center justify-end sm:p-6 bg-stone-900/40 backdrop-blur-xs'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-[#FAF8F5] shadow-2xl border border-stone-300/80 overflow-hidden flex flex-col transition-all duration-300 ${
          isMaximized
            ? 'w-full h-full max-w-7xl max-h-[96vh] rounded-3xl border-stone-700/60'
            : 'w-full sm:w-[480px] rounded-t-3xl sm:rounded-3xl h-[620px] max-h-[92vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chatbot Header */}
        <div className="p-4 bg-gradient-to-r from-[#062E1A] via-[#0D4425] to-[#082E1A] text-white flex items-center justify-between shrink-0 shadow-xs border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20 shadow-xs">
              <Bot className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-tight text-white">
                  Kisan AI Agronomist
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-medium">
                Live Store Stock Calibrated & ML Diagnostics
              </p>
            </div>
          </div>

          {/* Action buttons: Lang toggle, Maximize/Restore, Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLang(selectedLang === 'en-IN' ? 'hi-IN' : 'en-IN')}
              className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-[10px] font-bold text-white transition-all cursor-pointer border border-white/20"
              title="Click to toggle language"
            >
              {selectedLang === 'en-IN' ? '🇮🇳 EN' : '🇮🇳 हिंदी'}
            </button>

            {/* MAXIMIZE / RESTORE BUTTON */}
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer border border-white/20"
              title={isMaximized ? "Restore window (छोटा करें)" : "Maximize to full screen (बड़ा करें)"}
            >
              {isMaximized ? (
                <Minimize2 className="w-4 h-4 text-emerald-200" />
              ) : (
                <Maximize2 className="w-4 h-4 text-emerald-200" />
              )}
            </button>

            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer border border-white/20"
              title="Close AI Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Speaking Audio Waveform Banner */}
        {isSpeaking && (
          <div className="px-4 py-2 bg-emerald-900 text-white text-[11px] font-bold flex items-center justify-between animate-in fade-in shrink-0 border-b border-emerald-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 animate-pulse text-emerald-300" />
                <span>Reading aloud ({selectedLang === 'hi-IN' ? 'हिंदी आवाज़' : 'Indian English'})...</span>
              </span>
            </div>
            <button
              onClick={stopSpeaking}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 font-bold transition-colors cursor-pointer"
            >
              Stop Audio
            </button>
          </div>
        )}

        {/* BODY CONTAINER: 2-Column Split in Maximized mode, Single Column in Regular mode */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* MAXIMIZED SIDEBAR (Left Column on Laptop Widescreen) */}
          {isMaximized && (
            <div className="w-80 shrink-0 border-r border-stone-200/90 bg-[#FAF7F2] p-4 hidden md:flex flex-col justify-between overflow-y-auto space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2.5">
                  <span className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Advisory Topics</span>
                  </span>
                  <button
                    onClick={clearChat}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition-colors cursor-pointer"
                  >
                    + New Chat
                  </button>
                </div>

                {/* Topic categories */}
                <div className="space-y-3">
                  {ADVISORY_TOPICS.map((topic, idx) => {
                    const Icon = topic.icon;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700">
                          <span className={`p-1 rounded-md border ${topic.color}`}>
                            <Icon className="w-3 h-3" />
                          </span>
                          <span>{topic.category}</span>
                        </div>
                        <div className="pl-5 space-y-1">
                          {topic.queries.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              onClick={() => handleSend(q)}
                              className="w-full text-left text-[11px] py-1 px-2 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-900 text-stone-600 border border-stone-200/70 truncate transition-colors cursor-pointer block"
                              title={q}
                            >
                              • {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar bottom note */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ICAR & CIBRC Calibrated</span>
                </div>
                <p className="text-[10px] text-emerald-800 leading-snug">
                  Dosage guidance cross-verified with registered shop inventories.
                </p>
              </div>
            </div>
          )}

          {/* MAIN CHAT AREA (Right Column in Maximized, Full Width in Normal) */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#FAF8F5]">
            
            {/* Quick Question Prompts Bar */}
            <div className="bg-[#F3EFEA] px-3 py-2 border-b border-stone-200 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200/80 whitespace-nowrap shadow-2xs transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => {
                const isBot = msg.role === 'assistant';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} animate-in fade-in duration-200`}
                  >
                    <div
                      className={`max-w-[88%] ${isMaximized ? 'sm:max-w-[75%]' : ''} p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isBot
                          ? 'bg-white text-stone-800 rounded-tl-xs border border-stone-200/90 shadow-2xs'
                          : 'bg-emerald-800 text-white rounded-tr-xs shadow-xs font-medium'
                      }`}
                    >
                      {renderMessageText(msg.content)}

                      {/* Audio Read-out Button for Bot Responses */}
                      {isBot && (
                        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                          <button
                            onClick={() => speakText(msg.content)}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen ({selectedLang === 'hi-IN' ? 'आवाज़ में सुनें' : 'Listen Aloud'})</span>
                          </button>
                          <span className="text-[10px] text-stone-400 font-medium">Verified by AI Agronomist</span>
                        </div>
                      )}
                    </div>

                    {/* Grounded Matching Products in Store Stock */}
                    {isBot && msg.products && msg.products.length > 0 && (
                      <div className={`mt-3 ${isMaximized ? 'max-w-[75%]' : 'max-w-[95%]'} w-full space-y-2`}>
                        <div className="text-[11px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>In-Store Matching Stocks Available:</span>
                        </div>
                        <div className={`grid ${isMaximized ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-2`}>
                          {msg.products.map((prod) => (
                            <div
                              key={prod.id}
                              className="p-3 rounded-2xl border border-emerald-200/90 bg-[#F0FDF4]/70 hover:bg-[#F0FDF4] flex items-center justify-between gap-2 shadow-2xs transition-colors"
                            >
                              <div className="min-w-0">
                                <div className="font-black text-stone-900 text-xs truncate">
                                  {prod.name}
                                </div>
                                <div className="text-[10px] text-stone-500 mt-0.5">
                                  {prod.brand} • <span className="font-black text-emerald-800">₹{prod.price}</span> per {prod.unit}
                                </div>
                              </div>
                              <button
                                onClick={() => handleProductAdd(prod)}
                                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  addedIds[prod.id]
                                    ? 'bg-emerald-800 text-white'
                                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs'
                                }`}
                              >
                                {addedIds[prod.id] ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    <span>+ Add</span>
                                  </>
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-stone-500 text-xs p-3 bg-white/80 rounded-2xl border border-stone-200/80 w-fit">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                  <span>Consulting agronomy knowledge base & verifying live store inventory...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Bar */}
            <div className="p-3.5 sm:p-4 border-t border-stone-200/80 bg-white">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 max-w-4xl mx-auto"
              >
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-2xl transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                      : 'bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200'
                  }`}
                  title="Speak your query in Hindi or English (बोलकर पूछें)"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedLang === 'hi-IN' ? 'फसल की बीमारी, खाद की खुराक या बीज के बारे में पूछें...' : 'Ask about crop issues, fertilizer dosage, or live store stock...'}
                  className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-[#FAF8F5] font-medium"
                />

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 disabled:bg-stone-200 disabled:text-stone-400 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-700/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Ask AI</span>
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ChatbotModal;
