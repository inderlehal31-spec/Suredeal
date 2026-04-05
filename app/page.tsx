import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Zap, 
  ChevronRight, 
  Globe, 
  UserCheck, 
  ArrowUpRight,
  Menu,
  X
} from 'lucide-react';

// --- Types ---
interface NavItem {
  label: string;
  href: string;
}

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

interface StepProps {
  number: string;
  title: string;
  description: string;
  index: number;
}

// --- Animation Variants ---
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navItems: NavItem[] = [
    { label: 'Methodology', href: '#' },
    { label: 'Institutional', href: '#' },
    { label: 'Security', href: '#' }
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'py-4 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5' : 'py-8 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-[#D4AF37] to-[#8A6D3B] rounded-sm flex items-center justify-center">
            <ShieldCheck size={18} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-[0.2em] text-white uppercase">SureDeal</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className="text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-[#D4AF37] transition-colors">
              {item.label}
            </a>
          ))}
          <button className="px-6 py-2 border border-[#D4AF37]/30 rounded-full text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all">
            Access Terminal
          </button>
        </div>
      </div>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => (
  <motion.div 
    variants={fadeInUp}
    whileHover={{ y: -10, backgroundColor: "rgba(255,255,255,0.03)" }}
    className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl transition-all duration-500"
  >
    <div className="w-12 h-12 mb-6 rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center border border-[#D4AF37]/10">
      <Icon size={24} className="text-[#D4AF37]" strokeWidth={1.5} />
    </div>
    <h3 className="text-xl font-medium text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm font-light">{description}</p>
  </motion.div>
);

const ProcessStep = ({ number, title, description, index }: StepProps) => (
  <motion.div 
    variants={fadeInUp}
    className="relative flex flex-col items-start gap-4"
  >
    <span className="text-5xl font-bold text-white/5 absolute -top-8 -left-4 select-none">{number}</span>
    <h4 className="text-lg font-medium text-[#D4AF37] z-10">{title}</h4>
    <p className="text-gray-500 text-sm font-light leading-relaxed max-w-xs">{description}</p>
  </motion.div>
);

export default function SureDealLanding() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#EAEAEA] selection:bg-[#D4AF37]/30 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-[#8A6D3B]/5 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="inline-flex items-center gap-3 px-4 py-2 mb-8 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 font-medium">Sovereign Financial Protocol</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-6xl md:text-8xl font-bold tracking-[-0.04em] mb-8 leading-[1.05]"
            >
              The Gold Standard of <br />
              <span className="bg-gradient-to-b from-[#D4AF37] to-[#8A6D3B] bg-clip-text text-transparent">Digital Agreements</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-light tracking-wide leading-relaxed mb-12"
            >
              Architected for high-net-worth individuals and institutional deal-making. 
              Secure the integrity of your most valuable transactions with absolute certainty.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <button className="group relative px-10 py-5 bg-[#D4AF37] text-black font-bold uppercase text-[11px] tracking-[0.25em] rounded-sm overflow-hidden transition-all hover:shadow-[0_0_50px_rgba(212,175,55,0.3)]">
                <span className="relative z-10 flex items-center gap-2">
                  Initiate Secure Deal <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
              <button className="px-10 py-5 bg-transparent border border-white/10 hover:border-white/30 text-white font-medium uppercase text-[11px] tracking-[0.25em] rounded-sm transition-all backdrop-blur-sm">
                View Methodology
              </button>
            </motion.div>
          </div>

          {/* Featured Glass Card */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-24 p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent"
          >
            <div className="bg-[#0D0D0D]/90 backdrop-blur-3xl rounded-[23px] overflow-hidden grid md:grid-cols-3 divide-x divide-white/[0.05]">
              <div className="p-10 flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-white mb-1 tracking-tighter">₹500Cr+</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Capital Secured</span>
              </div>
              <div className="p-10 flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-white mb-1 tracking-tighter">99.9%</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Dispute Resolution</span>
              </div>
              <div className="p-10 flex flex-col items-center text-center">
                <span className="text-3xl font-bold text-white mb-1 tracking-tighter">&lt;2ms</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Execution Latency</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-6"
          >
            <FeatureCard 
              icon={Lock}
              title="Vault Storage"
              description="Multi-sig escrow protection using military-grade encryption and isolated servers."
              index={0}
            />
            <FeatureCard 
              icon={Zap}
              title="Flash Settlement"
              description="Instantaneous verification of funds and title transfer upon agreement ratification."
              index={1}
            />
            <FeatureCard 
              icon={UserCheck}
              title="KYC-E Protocol"
              description="Elite-level identity verification ensuring only verified principals enter the room."
              index={2}
            />
            <FeatureCard 
              icon={Globe}
              title="Global Jurisdictions"
              description="Seamlessly handle cross-border high-value deals with automated legal compliance."
              index={3}
            />
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 border-t border-white/[0.05] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="max-w-xl">
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.4em] font-semibold mb-4 block">Process Architecture</span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">Engineering Trust into Every Step</h2>
            </div>
            <p className="text-gray-500 max-w-sm font-light text-sm italic">"Precision is the only form of luxury we accept." — Technical Director</p>
          </div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-12"
          >
            <ProcessStep 
              number="01"
              title="Define Parameters"
              description="Upload your high-value deal terms into our encrypted obsidian vault."
              index={0}
            />
            <ProcessStep 
              number="02"
              title="Authenticate Party"
              description="Secure biometric invite sent to the counterparty for sovereign verification."
              index={1}
            />
            <ProcessStep 
              number="03"
              title="Asset Escrow"
              description="Funds are locked in a neutral, programmable smart-vault under admin watch."
              index={2}
            />
            <ProcessStep 
              number="04"
              title="Atomic Release"
              description="Simultaneous transfer of assets and confirmation with immutable logging."
              index={3}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#D4AF37]/[0.02]" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="p-16 rounded-[3rem] bg-white/[0.01] border border-[#D4AF37]/20 backdrop-blur-3xl"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter">Ready to Authorize?</h2>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto font-light">
              Join the inner circle of global traders using SureDeal for absolute risk mitigation. 
              Institutional onboarding takes less than 240 seconds.
            </p>
            <button className="px-14 py-6 bg-[#D4AF37] text-black font-black uppercase text-xs tracking-[0.3em] rounded-full shadow-2xl hover:scale-105 transition-all">
              Initiate My First Deal
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/10 rounded-sm flex items-center justify-center">
                <ShieldCheck size={14} className="text-[#D4AF37]" />
              </div>
              <span className="text-lg font-bold tracking-[0.2em] text-white uppercase">SureDeal</span>
            </div>
            
            <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] text-gray-500 font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Authority</a>
              <a href="#" className="hover:text-white transition-colors">Grievance Officer</a>
            </div>

            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-600">
              © 2026 SureDeal Enterprise. All Sovereignty Reserved.
            </div>
          </div>
          
          <div className="mt-12 text-center text-[9px] text-gray-800 uppercase tracking-[0.5em]">
            Obsidian Core • AES-256 Encryption • Tier 4 Data Centers
          </div>
        </div>
      </footer>

      {/* Subtle Background Grain */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[99] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
    </main>
  );
}

