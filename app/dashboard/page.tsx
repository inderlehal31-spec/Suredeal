// app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ------------------ Firebase ------------------ */
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";

/* ------------------ UI ------------------ */
import { motion } from "framer-motion";
import {
  Loader2,
  AlertTriangle,
  FolderOpen,
  Power,
  Activity,
  RefreshCcw
} from "lucide-react";

/* ------------------ Firebase Config ------------------ */
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

/* ------------------ Types ------------------ */
interface Deal {
  id: string;
  title: string;
  amount: number;
  status: "ACTIVE" | "COMPLETED" | "DISPUTED";
  participants: { type: string; value: string }[];
  createdAt?: Timestamp;
}

/* ------------------ Utils ------------------ */
const formatINR = (num: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(num);

const formatDate = (ts?: Timestamp) =>
  ts
    ? new Date(ts.seconds * 1000).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : "-";

const normalizeDeal = (
  doc: QueryDocumentSnapshot<DocumentData>
): Deal => {
  const d = doc.data();
  return {
    id: doc.id,
    title: d.title || "Untitled",
    amount: d.amount || 0,
    status: d.status || "ACTIVE",
    participants: d.participants || [],
    createdAt: d.createdAt
  };
};

const getCounterparty = (
  participants: Deal["participants"],
  email: string
) => {
  const phone = participants.find((p) => p.type === "phone");
  if (phone) return phone.value;

  const other = participants.find((p) => p.value !== email);
  return other?.value || "-";
};

/* ------------------ Skeleton ------------------ */
const Skeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 w-48 bg-white/10 rounded" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-24 bg-white/5 rounded-2xl" />
      ))}
    </div>
    <div className="h-72 bg-white/5 rounded-2xl" />
  </div>
);

/* ------------------ Page ------------------ */
export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const prevSnapshotRef = useRef<string>("");

  const LIMIT = 20;
  const MAX_LIMIT = 500;

  /* ------------------ Auth ------------------ */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  /* ------------------ Network Detection ------------------ */
  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  /* ------------------ Realtime FIRST PAGE ------------------ */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "deals"),
      where("createdBy", "==", user.email),
      orderBy("createdAt", "desc"),
      limit(LIMIT)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map(normalizeDeal);

        const snapshotHash = JSON.stringify(
          list.map((d) => [d.id, d.createdAt?.seconds])
        );

        if (snapshotHash !== prevSnapshotRef.current) {
          setSyncing(true);
          setTimeout(() => setSyncing(false), 500);
        }

        prevSnapshotRef.current = snapshotHash;

        setDeals((prev) => {
          const map = new Map(prev.map((d) => [d.id, d]));
          list.forEach((d) => map.set(d.id, d));
          return Array.from(map.values()).sort(
            (a, b) =>
              (b.createdAt?.seconds || 0) -
              (a.createdAt?.seconds || 0)
          );
        });

        setLastDoc(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.docs.length === LIMIT);
        setLoading(false);
      },
      () => {
        setError("System temporarily unavailable");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  /* ------------------ Load More ------------------ */
  const loadMore = async () => {
    if (!lastDoc || !user || !hasMore || deals.length > MAX_LIMIT) return;

    try {
      setLoadingMore(true);

      const q = query(
        collection(db, "deals"),
        where("createdBy", "==", user.email),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(LIMIT)
      );

      const snap = await getDocs(q);
      const more = snap.docs.map(normalizeDeal);

      setDeals((prev) => {
        const map = new Map(prev.map((d) => [d.id, d]));
        more.forEach((d) => map.set(d.id, d));
        return Array.from(map.values()).sort(
          (a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        );
      });

      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === LIMIT);
    } catch {
      setError("Load more failed");
    } finally {
      setLoadingMore(false);
    }
  };

  /* ------------------ Refresh ------------------ */
  const refresh = () => {
    location.reload();
  };

  /* ------------------ Metrics ------------------ */
  const metrics = useMemo(() => {
    return {
      total: deals.length,
      active: deals.filter((d) => d.status === "ACTIVE").length,
      completed: deals.filter((d) => d.status === "COMPLETED").length,
      disputed: deals.filter((d) => d.status === "DISPUTED").length
    };
  }, [deals]);

  /* ------------------ Logout ------------------ */
  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EAEAEA] p-6">

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-semibold">Dashboard</h1>

          <div className="flex items-center gap-3 text-xs mt-1">
            <Activity
              size={14}
              className={`${
                syncing ? "text-[#D4AF37]" : "text-green-400"
              }`}
            />
            <span className="text-gray-400">
              {isOffline ? "Offline" : syncing ? "Syncing..." : "Live"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition"
          >
            <RefreshCcw size={14} /> Refresh
          </button>

          <span className="text-sm text-gray-400">{user?.email}</span>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
          >
            <Power size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <Skeleton />}

      {/* Error */}
      {!loading && error && (
        <div className="text-center py-20">
          <AlertTriangle className="mx-auto text-red-400 mb-3" />
          <p className="text-gray-400">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 text-[#D4AF37]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {Object.entries(metrics).map(([k, v], i) => (
              <motion.div
                key={k}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-2xl border border-white/10 ${
                  i === 1
                    ? "bg-[#D4AF37]/10 shadow-[0_0_25px_rgba(212,175,55,0.2)]"
                    : "bg-white/5"
                }`}
              >
                <p className="text-xs text-gray-400 uppercase">{k}</p>
                <p className="text-2xl mt-2 font-semibold">{v}</p>
              </motion.div>
            ))}
          </div>

          {/* Empty */}
          {deals.length === 0 && (
            <div className="text-center py-24">
              <FolderOpen className="mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 mb-4">No deals found</p>
              <button
                onClick={() => router.push("/create-deal")}
                className="text-[#D4AF37]"
              >
                Create Deal
              </button>
            </div>
          )}

          {/* Table */}
          {deals.length > 0 && (
            <>
              <div className="grid grid-cols-6 text-xs text-gray-400 px-4 py-3 border-b border-white/10">
                <span>Title</span>
                <span className="text-right">Amount</span>
                <span>Status</span>
                <span>Counterparty</span>
                <span>Date</span>
                <span>Action</span>
              </div>

              {deals.map((d) => (
                <motion.div
                  key={d.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  className="grid grid-cols-6 px-4 py-4 border-b border-white/5 items-center"
                >
                  <span className="truncate">{d.title}</span>
                  <span className="text-right">{formatINR(d.amount)}</span>

                  <span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        d.status === "ACTIVE"
                          ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                          : d.status === "COMPLETED"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {d.status}
                    </span>
                  </span>

                  <span>{getCounterparty(d.participants, user?.email || "")}</span>
                  <span>{formatDate(d.createdAt)}</span>

                  <span>
                    <button
                      onClick={() => router.push(`/deal/${d.id}`)}
                      className="px-3 py-1 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition"
                    >
                      View
                    </button>
                  </span>
                </motion.div>
              ))}

              {hasMore && deals.length <= MAX_LIMIT && (
                <div className="text-center py-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-4 py-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {loadingMore && <Loader2 className="animate-spin" size={14} />}
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
