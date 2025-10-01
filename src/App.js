import React from "react";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to right, blue, green, black)",
        color: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "yellow" }}>🛍️ PCE Shopping Mall</h1>

      <p>
        Welcome <strong>investorpaul732@gmail.com</strong>
      </p>
      <button>Logout</button>

      <h2>🛒 Products</h2>
      <input type="text" placeholder="Search..." />

      <h2>🛍️ Cart</h2>
      <p>Total: ₦0</p>
      <button>Checkout</button>

      <h2>🧾 My Receipts</h2>
    </div>
  );
}

export default App;
