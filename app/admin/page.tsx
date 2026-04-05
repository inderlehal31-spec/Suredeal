// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  LayoutDashboard,
  Briefcase,
  Users,
  AlertTriangle,
  Settings,
  LogOut,
  Phone,
  Trash2,
  RefreshCcw
} from "lucide-react";

interface Deal {
  id: string;
  title?: string;
  amount?: number;
  status?: "ACTIVE" | "COMPLETED" | "DISPUTE" | "DELETED";
  participants?: string[];
  phones?: string[];
}

const ADMIN_EMAIL = "inderlehal31@gmail.com";

export default function AdminPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(false);

  const router = useRouter();

  // 🔐 AUTH PROTECTION
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/admin/login");
      } else if (u.email !== ADMIN_EMAIL) {
        alert("Access Denied");
        router.push("/admin/login");
      } else {
        setUser(u);
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // 🔄 FETCH DEALS (CONTROLLED + SAFE)
  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(false);

      const snapshot = await getDocs(collection(db, "deals"));

      const data: Deal[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Deal, "id">)
      }));

      setDeals(data.filter((d) => d.status !== "DELETED"));
      setLoading(false);
    } catch {
      setLoading(false);
      setError(true);
      alert("Network error. Please check connection.");
    }
  };

  useEffect(() => {
    if (!initialized) {
      fetchDeals();
      setInitialized(true);
    }
  }, [initialized]);

  // 🗑 DELETE
  const handleDelete = async (deal: Deal) => {
    if (user?.email !== ADMIN_EMAIL) {
      alert("Unauthorized");
      return;
    }

    if (deal.status === "COMPLETED") {
      alert("Completed deals cannot be deleted");
      return;
    }

    if (!confirm("Delete this deal permanently?")) return;

    try {
      setDeletingId(deal.id);

      await updateDoc(doc(db, "deals", deal.id), {
        status: "DELETED",
        deletedAt: new Date()
      });

      await addDoc(collection(db, "logs"), {
        action: "DELETE_DEAL",
        dealId: deal.id,
        admin: user?.email,
        time: new Date()
      });

      await fetchDeals();
      setDeletingId(null);
    } catch {
      setDeletingId(null);
      alert("Delete failed");
    }
  };

  // 📞 CALL
  const callUser = (phone?: string) => {
    if (!phone || phone.length < 10) {
      alert("Invalid phone number");
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  // 🔓 LOGOUT
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  // 🎯 FILTER
  const filteredDeals =
    filter === "ALL"
      ? deals
      : deals.filter((d) => d.status === filter);

  // 📊 STATS
  const stats = {
    total: deals.length,
    active: deals.filter((d) => d.status === "ACTIVE").length,
    completed: deals.filter((d) => d.status === "COMPLETED").length,
    disputes: deals.filter((d) => d.status === "DISPUTE").length
  };

  // 🔒 AUTH LOADER
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-gray-400 animate-pulse tracking-widest text-sm">
          INITIALIZING SECURE ENVIRONMENT...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-[#EAEAEA]">

      {/* Sidebar */}
      <aside className="w-64 fixed h-full border-r border-white/5 p-6 flex flex-col justify-between bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 bg-[#D4AF37] flex items-center justify-center">
              <ShieldCheck size={18} className="text-black" />
            </div>
            <span className="uppercase tracking-[0.2em] text-sm font-semibold">
              SureDeal
            </span>
          </div>

          <nav className="flex flex-col gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-3 text-white">
              <LayoutDashboard size={16} /> Dashboard
            </div>
            <div className="flex items-center gap-3 hover:text-white">
              <Briefcase size={16} /> Deals
            </div>
            <div className="flex items-center gap-3 hover:text-white">
              <Users size={16} /> Users
            </div>
            <div className="flex items-center gap-3 hover:text-white">
              <AlertTriangle size={16} /> Disputes
            </div>
            <div className="flex items-center gap-3 hover:text-white">
              <Settings size={16} /> Settings
            </div>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-white text-sm"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main */}
      <div className="ml-64 w-full">

        {/* Top */}
        <header className="flex justify-between items-center px-10 py-6 border-b border-white/5">
          <div className="text-sm text-gray-400">Admin Control Panel</div>

          <div className="flex items-center gap-6">
            <button
              onClick={fetchDeals}
              className="flex items-center gap-2 text-[#D4AF37] text-xs hover:scale-105"
            >
              <RefreshCcw size={14} /> Refresh
            </button>

            <span className="text-green-400 text-xs animate-pulse">
              ● Secure Live
            </span>

            <span className="text-sm">{user?.email}</span>
          </div>
        </header>

        <main className="p-10 space-y-10">

          {/* Filters */}
          <div className="flex gap-4">
            {["ALL", "ACTIVE", "COMPLETED", "DISPUTE"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-xs border ${
                  filter === f
                    ? "border-[#D4AF37] text-[#D4AF37]"
                    : "border-white/10 text-gray-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            {Object.entries(stats).map(([key, value]) => (
              <motion.div
                key={key}
                whileHover={{ y: -5 }}
                className="p-6 bg-white/5 rounded-xl"
              >
                <p className="text-gray-400 text-sm capitalize">{key}</p>
                <h3 className="text-2xl">{value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white/5 p-6 rounded-xl overflow-x-auto">

            {loading ? (
              <p className="text-gray-400">Loading secure data...</p>
            ) : error ? (
              <p className="text-red-400 text-center py-10">
                Unable to load data
              </p>
            ) : filteredDeals.length === 0 ? (
              <p className="text-gray-500 text-center py-10">
                No deals available
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-gray-500 text-left">
                  <tr>
                    <th className="py-3">ID</th>
                    <th>Deal</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDeals.map((d) => (
                    <tr
                      key={d.id}
                      className="border-t border-white/10 hover:bg-white/[0.03] transition"
                    >
                      <td className="text-xs text-gray-500">{d.id}</td>
                      <td>{d.title || "Untitled Deal"}</td>
                      <td>₹{d.amount?.toLocaleString("en-IN") || 0}</td>

                      <td>
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          d.status === "DISPUTE"
                            ? "bg-red-500/20 text-red-400"
                            : d.status === "ACTIVE"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {d.status}
                        </span>
                      </td>

                      <td className="flex gap-3 items-center">

                        {d.phones?.[0] && (
                          <button
                            title="Call Party 1"
                            onClick={() => callUser(d.phones[0])}
                            className="text-green-400 hover:scale-110"
                          >
                            <Phone size={14} />
                          </button>
                        )}

                        {d.phones?.[1] && (
                          <button
                            title="Call Party 2"
                            onClick={() => callUser(d.phones[1])}
                            className="text-blue-400 hover:scale-110"
                          >
                            <Phone size={14} />
                          </button>
                        )}

                        <button
                          disabled={loading || deletingId === d.id}
                          onClick={() => handleDelete(d)}
                          className="text-red-400 hover:scale-110 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>

        </main>
      </div>
    </div>
  );
}
