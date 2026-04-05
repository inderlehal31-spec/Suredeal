"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  db, auth 
} from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  User,
  FileText,
  ChevronRight,
  GripVertical
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Deal {
  id: string;
  partyName: string;
  purpose: string;
  status: 'LOCKED' | 'RESOLVED' | 'DISPUTED';
  createdAt: any;
  createdBy: string;
}

// --- ANIMATION VARIANTS (Luxury Feel) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Dashboard() {
  // --- STATES ---
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form States
  const [partyName, setPartyName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- REAL-TIME DATA FETCHING ---
  useEffect(() => {
    const q = query(
      collection(db, "deals"), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dealsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];
      setDeals(dealsData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- HANDLERS ---
  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || !purpose) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "deals"), {
        partyName,
        purpose,
        status: 'LOCKED',
        createdAt: Timestamp.now(),
        createdBy: auth.currentUser?.email || "Admin",
      });
      setPartyName("");
      setPurpose("");
      setIsModalOpen(false);
    } catch (err) {
      alert("Error creating deal: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'LOCKED' ? 'RESOLVED' : 'LOCKED';
    const dealRef = doc(db, "deals", id);
    await updateDoc(dealRef, { status: newStatus });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-gold/30">
      
      {/* SIDEBAR (Desktop/Tablet) */}
      <aside className="w-64 border-r border-white/5 bg-[#080808] hidden md:flex flex-col p-6 sticky top-0 h-screen">
        <div className="mb-10">
          <h1 className="text-xl font-black tracking-tighter text-gold">SUREDEAL</h1>
          <p className="text-[10px] text-white/30 tracking-[0.3em] uppercase">Enterprise</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="flex items-center gap-3 w-full p-3 rounded-xl bg-gold/10 text-gold border border-gold/20 text-sm font-medium">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl text-white/50 hover:bg-white/5 hover:text-white transition-all text-sm font-medium">
            <History size={18} /> Audit Logs
          </button>
          <button className="flex items-center gap-3 w-full p-3 rounded-xl text-white/50 hover:bg-white/5 hover:text-white transition-all text-sm font-medium">
            <Settings size={18} /> Settings
          </button>
        </nav>

        <button className="flex items-center gap-3 p-4 text-red-500/70 hover:text-red-500 transition-all text-sm font-bold border-t border-white/5 mt-auto">
          <LogOut size={18} /> TERMINATE SESSION
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Active Mediation</h2>
            <p className="text-gray-500 text-sm mt-1">Manage and monitor secure offline transactions.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search by party or ID..." 
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-6 text-sm focus:border-gold/50 outline-none w-full md:w-64 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gold text-black p-2.5 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
        </header>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="glass-card p-6 border-gold/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={60} className="text-gold" />
            </div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Total Mediation</p>
            <h4 className="text-4xl font-black mt-2">{deals.length}</h4>
          </div>
          {/* ... Continued in next segment ... */}
          <div className="glass-card p-6 border-gold/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
              <Clock size={60} />
            </div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Pending Registry</p>
            <h4 className="text-4xl font-black mt-2">
              {deals.filter(d => d.status === 'LOCKED').length}
            </h4>
          </div>
          <div className="glass-card p-6 border-gold/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-green-500">
              <CheckCircle2 size={60} />
            </div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Successful Deals</p>
            <h4 className="text-4xl font-black mt-2 text-green-500">
              {deals.filter(d => d.status === 'RESOLVED').length}
            </h4>
          </div>
        </div>

        {/* --- DEALS TABLE / LIST --- */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6 px-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/40">Secure Ledgers</h3>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
              <span className="text-[10px] text-gold/80 font-bold uppercase tracking-widest">Real-time Encrypted</span>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence mode='popLayout'>
              {deals
                .filter(d => d.partyName.toLowerCase().includes(searchQuery.toLowerCase()) || d.purpose.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((deal) => (
                <motion.div 
                  key={deal.id}
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-card group hover:bg-white/[0.07] transition-all border-white/5 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-xl ${deal.status === 'LOCKED' ? 'bg-gold/10 text-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'bg-green-500/10 text-green-500'}`}>
                      {deal.status === 'LOCKED' ? <Lock size={20} /> : <CheckCircle2 size={20} />}
                    </div>
                    <div>
                      <h5 className="font-bold text-lg leading-none mb-1 uppercase tracking-tight italic">
                        {deal.partyName}
                      </h5>
                      <p className="text-white/40 text-xs font-medium max-w-xs truncate">
                        {deal.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="hidden lg:block text-right">
                      <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Recorded On</p>
                      <p className="text-xs text-white/60 font-mono italic">
                        {deal.createdAt?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleStatus(deal.id, deal.status)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all ${
                          deal.status === 'LOCKED' 
                          ? 'border-gold/30 text-gold hover:bg-gold hover:text-black' 
                          : 'border-green-500/30 text-green-500 hover:bg-green-500 hover:text-black'
                        }`}
                      >
                        {deal.status === 'LOCKED' ? 'Mark Success' : 'Re-Lock Deal'}
                      </button>
                      <GripVertical size={16} className="text-white/10 group-hover:text-white/30 cursor-grab" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {deals.length === 0 && !loading && (
              <div className="py-20 text-center glass-card border-dashed border-white/10">
                <AlertCircle size={40} className="mx-auto text-white/10 mb-4" />
                <p className="text-white/30 font-bold uppercase tracking-widest text-xs font-mono">No Active Mediations Found</p>
              </div>
            )}
          </motion.div>
        </section>
      </main>

      {/* --- CREATE DEAL MODAL (The Billion-Dollar Form) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-lg p-8 relative z-10 border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]"
            >
              <div className="mb-8">
                <h3 className="text-2xl font-black tracking-tighter text-gold italic">INITIATE SECURE HOLD</h3>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-1 font-bold">New Mediation Record</p>
              </div>

              <form onSubmit={handleCreateDeal} className="space-y-6">
                <div>
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2 block">Counterparty Identity</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={18} />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. S. Gurcharan Singh"
                      className="luxury-input pl-12"
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-2 block">Deal Manifest / Subject</label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 text-gold/50" size={18} />
                    <textarea 
                      required
                      placeholder="Describe the asset, plot number, or agreement details..."
                      className="luxury-input pl-12 h-32 resize-none"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all border border-white/5"
                  >
                    Discard
                  </button>
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="flex-[2] bg-gold-gradient text-black px-6 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_10px_20px_rgba(212,175,55,0.2)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'ENCRYPTING...' : 'LOCK DEAL RECORD'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
