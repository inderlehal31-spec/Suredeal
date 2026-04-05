// components/ui/Features.tsx
"use client";

import { motion } from "framer-motion";
import { Lock, Zap, UserCheck, Globe } from "lucide-react";

const features = [
  { icon: Lock, title: "Vault Security", desc: "Encrypted escrow infrastructure" },
  { icon: Zap, title: "Instant Execution", desc: "Low-latency transaction system" },
  { icon: UserCheck, title: "Verified Identity", desc: "KYC-grade participant validation" },
  { icon: Globe, title: "Global Reach", desc: "Cross-border deal compliance" },
];

export default function Features() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -8, scale: 1.02 }}
            className="p-8 bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-2xl transition-all"
          >
            <f.icon className="text-[#D4AF37] mb-4" />
            <h3 className="text-white text-lg mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
