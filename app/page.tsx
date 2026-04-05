"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth } from '@/lib/firebase';
import { 
  collection, addDoc, query, onSnapshot, 
  orderBy, Timestamp, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { 
  Plus, Search, LayoutDashboard, History, Settings, LogOut, 
  ShieldCheck, Clock, CheckCircle2, AlertCircle, User, 
  FileText, ChevronRight, GripVertical, Filter, Trash2, X
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

// --- SUB-COMPONENTS (Skeleton & Empty States) ---
const SkeletonRow = () => (
  <div className="bg-white/5 backdrop-blur-md p-5 flex items-center justify-between animate-pulse border border-white/5 rounded-2xl mb-3">
    <div className="flex items-center gap-5">
      <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
      <div className="space-y-2">
        <div className="w-32 h-4 bg-white/10 rounded"></div>
        <div className="w-20 h-3 bg-white/10 rounded"></div>
      </div>
    </div>
    <div className="w-24 h-8 bg-white/10 rounded-full"></div>
  </div>
);

// --- ANIMATION VARIANTS ---
const containerVar = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVar = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Dashboard() {
  // --- CORE STATES ---
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'LOCKED' | 'RESOLVED'>('ALL');
  
  // Form States
  const [partyName, setPartyName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- REAL-TIME LISTENER ---
  useEffect(() => {
    const q = query(collection(db, "deals"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Deal[];
      setDeals(data);
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => unsubscribe();
  }, []);

  // --- DERIVED DATA (FILTERING) ---
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = deal.partyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            deal.purpose.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'ALL' ? true : deal.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [deals, searchQuery, filterStatus]);

  // --- ACTIONS ---
  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName || !purpose) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "deals"), {
        partyName, purpose, status: 'LOCKED',
        createdAt: Timestamp.now(),
        createdBy: auth.currentUser?.email || "Admin Office",
      });
      setPartyName(""); setPurpose(""); setIsModalOpen(false);
    } catch (err) { alert(err); } finally { setIsSubmitting(false); }
  };

  const updateStatus = async (id: string, current: string) => {
    const next = current === 'LOCKED' ? 'RESOLVED' : 'LOCKED';
    await updateDoc(doc(db, "deals", id), { status: next });
  };

  const deleteRecord = async (id: string) => {
    if(confirm("Permanently delete this secure record?")) {
      await deleteDoc(doc(db, "deals", id));
    }
  };  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-sans selection:bg-gold/30 selection:text-white">
      
      {/* 1. SIDEBAR (Fixed & Luxury) */}
      <aside className="w-72 border-r border-white/5 bg-[#080808]/80 backdrop-blur-2xl hidden lg:flex flex-col p-8 sticky top-0 h-screen z-50">
        <div className="mb-12 group cursor-default">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-gold group-hover:scale-110 transition-transform" size={24} />
            <h1 className="text-2xl font-black tracking-tighter text-gold uppercase">SUREDEAL</h1>
          </div>
          <p className="text-[10px] text-white/20 tracking-[0.4em] uppercase font-bold ml-1">Enterprise Mediator</p>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { name: 'Dashboard', icon: <LayoutDashboard size={18}/>, active: true },
            { name: 'Audit Logs', icon: <History size={18}/>, active: false },
            { name: 'Office Settings', icon: <Settings size={18}/>, active: false },
          ].map((item) => (
            <button key={item.name} className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 text-sm font-bold tracking-tight ${
              item.active ? 'bg-gold/10 text-gold border border-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]' : 'text-white/30 hover:bg-white/5 hover:text-white'
            }`}>
              {item.icon} {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <div className="bg-white/5 p-4 rounded-2xl mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-gradient p-[1px]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-[10px] font-black text-gold uppercase">AD</div>
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate">ADMIN OFFICE</p>
              <p className="text-[10px] text-white/30 truncate uppercase tracking-widest">Amritsar Branch</p>
            </div>
          </div>
          <button className="flex items-center gap-3 w-full p-4 text-red-500/60 hover:text-red-500 transition-all text-xs font-black uppercase tracking-widest bg-red-500/5 rounded-2xl hover:bg-red-500/10">
            <LogOut size={16} /> End Session
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full relative">
        
        {/* HEADER & ACTIONS */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h2 className="text-4xl font-black tracking-tighter">Command Center</h2>
            <div className="flex items-center gap-2 mt-2 text-white/30">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold">Secure Infrastructure Online</p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-gold transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search Active Deals..." 
                className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm focus:border-gold/50 outline-none w-full md:w-80 transition-all backdrop-blur-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gold-gradient text-black w-14 h-14 flex items-center justify-center rounded-2xl shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:scale-110 active:scale-95 transition-all"
            >
              <Plus size={28} strokeWidth={3} />
            </button>
          </div>
        </header>

        {/* ANALYTICS SNAPSHOT */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {[
            { label: 'Active Mediation', val: deals.length, icon: <ShieldCheck size={28}/>, color: 'text-gold' },
            { label: 'Pending Registry', val: deals.filter(d=>d.status==='LOCKED').length, icon: <Clock size={28}/>, color: 'text-blue-500' },
            { label: 'Successful Close', val: deals.filter(d=>d.status==='RESOLVED').length, icon: <CheckCircle2 size={28}/>, color: 'text-green-500' }
          ].map((stat, i) => (
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: i * 0.1 }}
              key={stat.label} 
              className="glass-card p-8 border-white/5 relative overflow-hidden group cursor-default"
            >
              <div className={`absolute -right-4 -top-4 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-black mb-2">{stat.label}</p>
              <h4 className={`text-5xl font-black italic tracking-tighter ${stat.color}`}>{stat.val}</h4>
            </motion.div>
          ))}
        </div>

        {/* FILTER BAR SECTION */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8 px-4 border-b border-white/5 pb-6">
          <div className="flex gap-8">
            {['ALL', 'LOCKED', 'RESOLVED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab as any)}
                className={`text-[10px] font-black tracking-[0.3em] pb-2 transition-all uppercase relative ${
                  filterStatus === tab ? 'text-gold' : 'text-white/20 hover:text-white/50'
                }`}
              >
                {tab}
                {filterStatus === tab && (
                  <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-gradient rounded-full" />
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/20 font-mono uppercase tracking-[0.2em]">Showing {filteredDeals.length} Secure Records</p>
        </div>
        {/* 3. DEALS LISTING ENGINE */}
        <section className="relative z-10">
          <motion.div 
            variants={containerVar}
            initial="hidden"
            animate="visible"
            className="space-y-4 pb-20"
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
              </div>
            ) : (
              <AnimatePresence mode='popLayout'>
                {filteredDeals.map((deal) => (
                  <motion.div 
                    key={deal.id}
                    layout
                    variants={itemVar}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="glass-card group hover:bg-white/[0.08] transition-all border-white/5 p-6 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        deal.status === 'LOCKED' 
                        ? 'bg-gold/10 text-gold shadow-[0_0_20px_rgba(212,175,55,0.1)] border border-gold/20 group-hover:scale-110' 
                        : 'bg-green-500/10 text-green-500 border border-green-500/20 group-hover:rotate-12'
                      }`}>
                        {deal.status === 'LOCKED' ? <Lock size={22} /> : <CheckCircle2 size={22} />}
                      </div>
                      
                      <div className="max-w-md">
                        <div className="flex items-center gap-3 mb-1">
                          <h5 className="font-black text-xl tracking-tighter uppercase italic group-hover:text-gold transition-colors">
                            {deal.partyName}
                          </h5>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border ${
                            deal.status === 'LOCKED' ? 'border-gold/30 text-gold' : 'border-green-500/30 text-green-500'
                          }`}>
                            {deal.status}
                          </span>
                        </div>
                        <p className="text-white/40 text-[11px] font-medium leading-relaxed tracking-wide">
                          {deal.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-10">
                      <div className="hidden lg:block text-right">
                        <p className="text-[9px] text-white/20 uppercase font-black tracking-widest mb-1">Record ID</p>
                        <p className="text-[10px] text-white/40 font-mono italic">#{deal.id.slice(-6).toUpperCase()}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => updateStatus(deal.id, deal.status)}
                          className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                            deal.status === 'LOCKED' 
                            ? 'border-gold/30 text-gold hover:bg-gold-gradient hover:text-black hover:border-transparent' 
                            : 'border-green-500/30 text-green-500 hover:bg-green-500 hover:text-black'
                          }`}
                        >
                          {deal.status === 'LOCKED' ? 'Release Record' : 'Re-Secure Deal'}
                        </button>
                        
                        <button 
                          onClick={() => deleteRecord(deal.id)}
                          className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500/30 hover:bg-red-500/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {!loading && filteredDeals.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-32 text-center glass-card border-dashed border-white/10"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} className="text-white/10" />
                </div>
                <h6 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-2 italic">Zero Active Records</h6>
                <p className="text-[10px] text-white/20 uppercase tracking-widest">No secure mediations found for your search.</p>
              </motion.div>
            )}
          </motion.div>
        </section>
      </main>

      {/* --- CREATE DEAL MODAL (THE VAULT) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl transition-all"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30, rotateX: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="glass-card w-full max-w-2xl p-10 relative z-10 border-gold/30 shadow-[0_0_100px_rgba(212,175,55,0.15)] overflow-hidden"
            >
              {/* Background Glow inside modal */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="text-3xl font-black tracking-tighter text-gold italic uppercase">Initiate Secure Vault</h3>
                  <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] mt-2 font-bold flex items-center gap-2">
                    <ShieldCheck size={12} className="text-gold" /> Digital Mediation Protocol v1.0
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X size={20} className="text-white/20 hover:text-white" />
                </button>
              </div>

              <form onSubmit={handleCreateDeal} className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                  <div>
                    <label className="text-[9px] text-white/40 uppercase font-black tracking-[0.3em] mb-3 block ml-1">Counterparty Identity (Full Name)</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gold/5 text-gold/50 group-focus-within:bg-gold/10 group-focus-within:text-gold transition-all">
                        <User size={16} />
                      </div>
                      <input 
                        type="text" required placeholder="e.g. Sardar Kuldeep Singh"
                        className="luxury-input pl-16 py-5 bg-white/5 border-white/10 focus:border-gold/50 text-sm font-bold uppercase tracking-widest transition-all shadow-inner"
                        value={partyName}
                        onChange={(e) => setPartyName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-white/40 uppercase font-black tracking-[0.3em] mb-3 block ml-1">Deal Manifest / Offline Subject</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-6 p-2 rounded-lg bg-gold/5 text-gold/50 group-focus-within:bg-gold/10 group-focus-within:text-gold transition-all">
                        <FileText size={16} />
                      </div>
                      <textarea 
                        required placeholder="Specify details (e.g. 10 Marla Plot, Street 4, Ranjit Avenue. Registry Pending)."
                        className="luxury-input pl-16 pt-6 h-40 resize-none bg-white/5 border-white/10 focus:border-gold/50 text-sm font-medium tracking-wide leading-relaxed"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <button 
                    disabled={isSubmitting} type="submit"
                    className="flex-[3] bg-gold-gradient text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-[0_15px_40px_rgba(212,175,55,0.25)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10">{isSubmitting ? 'ENCRYPTING DATA...' : 'LOCK SECURE RECORD'}</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                  </button>
                  <button 
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-all border border-white/5 hover:bg-white/5"
                  >
                    Discard
                  </button>
                </div>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-[8px] text-white/10 uppercase tracking-[0.5em] font-black">Powered by SureDeal Enterprise Encryption Infrastructure</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

