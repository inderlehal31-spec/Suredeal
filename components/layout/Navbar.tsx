// components/layout/Navbar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      scrolled ? "bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 py-4" : "py-8"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-[#D4AF37] to-[#8A6D3B] flex items-center justify-center">
            <ShieldCheck size={18} className="text-black" />
          </div>
          <span className="text-white uppercase tracking-[0.25em] text-sm font-semibold">
            SureDeal
          </span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-[10px] uppercase tracking-[0.3em] text-gray-400">
          <Link href="#">Methodology</Link>
          <Link href="#">Security</Link>
          <Link href="/dashboard" className="text-[#D4AF37]">Dashboard</Link>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="hidden md:block px-6 py-2 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] tracking-[0.25em] uppercase hover:bg-[#D4AF37]/10 transition-all"
        >
          Access
        </motion.button>
      </div>
    </nav>
  );
}
