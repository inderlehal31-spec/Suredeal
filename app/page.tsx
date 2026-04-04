"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Button from "../components/ui/Button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">

      <motion.h1 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-4"
      >
        SUREDEAL
      </motion.h1>

      <p className="text-gray-400 mb-8">
        Secure. Smart. Billion Dollar Deals.
      </p>

      <Button onClick={() => router.push("/dashboard")}>
        Create Deal
      </Button>

    </div>
  );
}
