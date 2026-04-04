export default function Home() {
  return (
    <main style={{
      background: "#0b0b0b",
      color: "white",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Arial"
    }}>
      
      <h1 style={{ fontSize: "40px", marginBottom: "10px" }}>
        SUREDEAL
      </h1>

      <p style={{ marginBottom: "20px", color: "#aaa" }}>
        Secure. Smart. Billion Dollar Deals.
      </p>

      <button style={{
        padding: "12px 25px",
        background: "#00ffcc",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
      }}>
        Create Deal
      </button>

    </main>
  );
}
