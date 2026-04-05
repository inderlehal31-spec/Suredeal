// components/ui/Hero.tsx
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative pt-44 pb-32 px-6 text-center overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#D4AF37]/5 blur-[150px] rounded-full" />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl md:text-8xl font-bold tracking-[-0.04em] text-white mb-8"
      >
        Secure Deals <br />
        <span className="text-[#D4AF37]">Absolute Trust</span>
      </motion.h1>

      <p className="max-w-xl mx-auto text-gray-400 mb-10 text-lg">
        Built for high-value transactions where precision, security, and control are non-negotiable.
      </p>

      <motion.button
        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(212,175,55,0.3)" }}
        onClick={() => router.push("/create-deal")}
        className="px-10 py-5 bg-[#D4AF37] text-black font-bold uppercase tracking-[0.25em] flex items-center gap-2 mx-auto"
      >
        Create Deal <ChevronRight size={14} />
      </motion.button>
    </section>
  );
}
