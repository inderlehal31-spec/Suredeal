// components/ui/CTA.tsx
"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

  return (
    <section className="py-40 px-6 text-center relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[#D4AF37]/[0.02]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto p-14 border border-[#D4AF37]/20 backdrop-blur-3xl bg-white/[0.02] rounded-3xl"
      >
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Authorize Your Next Deal
        </h2>

        <p className="text-gray-400 mb-10">
          Enter a secure environment designed for high-value transactions and absolute control.
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 50px rgba(212,175,55,0.3)" }}
          onClick={() => router.push("/create-deal")}
          className="px-12 py-6 bg-[#D4AF37] text-black font-bold uppercase tracking-[0.3em]"
        >
          Initiate Deal
        </motion.button>
      </motion.div>
    </section>
  );
}
