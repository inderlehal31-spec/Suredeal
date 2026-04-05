// components/ui/Process.tsx
"use client";

import { motion } from "framer-motion";

const steps = [
  "Create Deal",
  "Invite Party",
  "Lock Terms",
  "Complete Securely"
];

export default function Process() {
  return (
    <section className="py-32 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        {steps.map((step, i) => (
          <motion.div key={i} whileHover={{ y: -6 }} className="relative">
            <span className="text-[#D4AF37] text-xl">0{i + 1}</span>
            <h4 className="text-white mt-3 text-lg">{step}</h4>
            <p className="text-gray-500 text-sm mt-2">
              Secure, structured, and verified process step.
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
