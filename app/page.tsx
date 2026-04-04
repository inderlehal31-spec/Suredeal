"use client";

import { useState } from "react";

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  return (
    <main style={{
      background: "#0b0b0b",
      color: "white",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>

      <h1>SUREDEAL</h1>
      <p>Secure. Smart. Billion Dollar Deals.</p>

      <button
        onClick={() => setShowForm(true)}
        style={{
          padding: "12px 25px",
          background: "#00ffcc",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        Create Deal
      </button>

      {showForm && (
        <div style={{ marginTop: "20px" }}>
          <input placeholder="Your Name" /><br /><br />
          <input placeholder="Deal Details" /><br /><br />
          <button>Submit</button>
        </div>
      )}

    </main>
  );
}
