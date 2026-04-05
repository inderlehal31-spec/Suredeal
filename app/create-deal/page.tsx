// app/create-deal/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* ------------------ Firebase ------------------ */
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  RecaptchaVerifier,
  PhoneAuthProvider,
  linkWithCredential
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnhSQ_s_tkU1NYt5Q4rlJWXMUw11SfNgU",
  authDomain: "suredeal-fe221.firebaseapp.com",
  projectId: "suredeal-fe221",
  storageBucket: "suredeal-fe221.appspot.com",
  messagingSenderId: "415411967069",
  appId: "1:415411967069:web:e3513a029c4b6ff3e0a9b4"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ------------------ UI ------------------ */
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";

/* ------------------ Utils ------------------ */
const formatINR = (v: string) => {
  const n = v.replace(/\D/g, "");
  return n ? new Intl.NumberFormat("en-IN").format(Number(n)) : "";
};
const parseINR = (v: string) => Number(v.replace(/,/g, "") || 0);

/* ------------------ Field ------------------ */
const Field = ({
  label,
  value,
  onChange,
  error,
  disabled,
  maxLength
}: any) => {
  const [focus, setFocus] = useState(false);

  return (
    <div className="relative">
      <label
        className={`absolute left-0 transition-all ${
          focus || value
            ? "-top-4 text-xs text-[#D4AF37]"
            : "top-3 text-sm text-gray-500"
        }`}
      >
        {label}
      </label>

      <input
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent border-b py-3 outline-none transition ${
          error
            ? "border-red-400"
            : "border-white/20 focus:border-[#D4AF37]"
        } ${disabled && "opacity-50"}`}
      />

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
};

/* ------------------ Page ------------------ */
export default function CreateDealPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const [verificationId, setVerificationId] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [errors, setErrors] = useState<any>({});

  /* ------------------ Auth ------------------ */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      else {
        setUser(u);
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  /* ------------------ Recaptcha ------------------ */
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  };

  /* ------------------ SEND OTP (SAFE METHOD) ------------------ */
  const sendOTP = async () => {
    if (cooldown > 0) return;

    if (!/^\d{10}$/.test(userPhone)) {
      setErrors({ userPhone: "Invalid phone" });
      return;
    }

    try {
      setupRecaptcha();

      const provider = new PhoneAuthProvider(auth);

      const id = await provider.verifyPhoneNumber(
        "+91" + userPhone,
        (window as any).recaptchaVerifier
      );

      setVerificationId(id);
      setOtpSent(true);
      setCooldown(30);
      setErrors({});
    } catch {
      setErrors({ global: "OTP send failed" });
    }
  };

  /* ------------------ OTP TIMER ------------------ */
  useEffect(() => {
    if (cooldown > 0) {
      const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [cooldown]);

  /* ------------------ VERIFY OTP ------------------ */
  const verifyOTP = async () => {
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        otp
      );

      try {
        await linkWithCredential(auth.currentUser!, credential);
      } catch (e: any) {
        if (e.code !== "auth/provider-already-linked") {
          throw e;
        }
      }

      setOtpVerified(true);
      setErrors({});
    } catch {
      setErrors({ otp: "Invalid OTP" });
    }
  };

  /* ------------------ VALIDATE ------------------ */
  const validate = () => {
    const e: any = {};

    if (!title) e.title = "Required";
    if (!amount || parseINR(amount) <= 0) e.amount = "Invalid";
    if (!name) e.name = "Required";
    if (!/^\d{10}$/.test(phone)) e.phone = "Invalid";
    if (!otpVerified) e.userPhone = "Verify phone";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ------------------ CREATE DEAL ------------------ */
  const createDeal = async () => {
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);

      const dealRef = doc(collection(db, "deals"));
      const logRef = doc(collection(db, "logs"));

      const batch = writeBatch(db);

      batch.set(dealRef, {
        title,
        amount: parseINR(amount),
        status: "ACTIVE",
        participants: [
          { type: "email", value: user.email },
          { type: "phone", value: phone }
        ],
        phones: [userPhone, phone],
        isVerified: true,
        createdBy: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      batch.set(logRef, {
        action: "CREATE_DEAL",
        dealId: dealRef.id,
        user: user.email,
        time: serverTimestamp()
      });

      await batch.commit();

      setSuccess(true);

      setTimeout(() => {
        router.push(`/deal/${dealRef.id}`);
      }, 2200);

    } catch {
      setLoading(false);
      setErrors({ global: "Transaction failed. Retry." });
    }
  };

  /* ------------------ LOADER ------------------ */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-gray-400">
        Establishing Secure Channel...
      </div>
    );
  }

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-6">
      <div className="max-w-3xl w-full">

        <div id="recaptcha-container"></div>

        <motion.div className="p-10 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10">

          <AnimatePresence>
            {success && (
              <motion.div className="text-center py-12">
                <CheckCircle className="mx-auto text-[#D4AF37]" size={42} />
                <p className="mt-4">Deal Initialized Successfully</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <div className="space-y-10">

              <Field label="Deal Title" value={title} onChange={setTitle} error={errors.title} disabled={loading}/>
              <Field label="Amount (₹)" value={amount} onChange={(v:any)=>setAmount(formatINR(v))} error={errors.amount} disabled={loading}/>
              <Field label="Counterparty Name" value={name} onChange={setName} error={errors.name} disabled={loading}/>
              <Field label="Counterparty Phone" value={phone} onChange={(v:any)=>setPhone(v.replace(/\D/g,""))} error={errors.phone} disabled={loading}/>
              <Field label="Your Phone" value={userPhone} onChange={(v:any)=>setUserPhone(v.replace(/\D/g,""))} error={errors.userPhone} disabled={loading} maxLength={10}/>

              {!otpSent && (
                <button onClick={sendOTP} className="text-[#D4AF37]">Send OTP</button>
              )}

              {otpSent && !otpVerified && (
                <>
                  <Field label="Enter OTP" value={otp} onChange={setOtp} error={errors.otp} disabled={loading}/>
                  <button onClick={verifyOTP} className="text-[#D4AF37]">Verify OTP</button>

                  {cooldown > 0
                    ? <p className="text-xs text-gray-500">Resend in {cooldown}s</p>
                    : <button onClick={sendOTP} className="text-xs text-gray-500">Resend OTP</button>
                  }
                </>
              )}

              {otpVerified && <p className="text-green-400 text-sm">Phone Verified ✓</p>}

              {errors.global && <p className="text-red-400 text-sm text-center">{errors.global}</p>}

              {loading && (
                <p className="text-xs text-gray-500 text-center tracking-widest">
                  AES-256 ENCRYPTION • SECURE CHANNEL
                </p>
              )}

              <button
                onClick={createDeal}
                disabled={loading}
                className="w-full py-4 bg-[#D4AF37] text-black font-bold rounded-xl flex justify-center"
              >
                {loading ? <Loader2 className="animate-spin"/> : "Create Secure Deal"}
              </button>

            </div>
          )}

        </motion.div>

      </div>
    </div>
  );
}
