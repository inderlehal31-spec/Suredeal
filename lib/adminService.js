"use client";

import useAdmin from "../../hooks/useAdmin";
import { updateDealStatus } from "../../lib/adminService";

export default function AdminPage() {
  const deals = useAdmin();

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-6">Admin Panel</h1>

      {deals.map((d) => (
        <div key={d.id} className="glass p-4 mb-3 rounded-xl">
          <h2>{d.title}</h2>
          <p>₹{d.amount}</p>
          <p className="text-gray-400">{d.status}</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => updateDealStatus(d.id, "Approved")}
              className="bg-green-500 px-3 py-1"
            >
              Approve
            </button>

            <button
              onClick={() => updateDealStatus(d.id, "Rejected")}
              className="bg-red-500 px-3 py-1"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
