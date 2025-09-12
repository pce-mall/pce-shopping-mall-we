import React from "react";

export default function Landing() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #007bff, #28a745)",
        color: "white",
        textAlign: "center",
        padding: "40px 20px"
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
        Welcome to Paul Chuk Enterprises
      </h1>
      <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
        Buy and sell with ease – just like Jumia!
      </p>

      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px"
        }}
      >
        {/* Example preview products */}
        <div style={{ background: "white", color: "black", borderRadius: "8px", padding: "16px" }}>
          <img
            src="https://via.placeholder.com/150"
            alt="Phone"
            style={{ width: "100%", borderRadius: "8px" }}
          />
          <h3>Smart Phone</h3>
          <p>₦75,000</p>
        </div>

        <div style={{ background: "white", color: "black", borderRadius: "8px", padding: "16px" }}>
          <img
            src="https://via.placeholder.com/150"
            alt="Laptop"
            style={{ width: "100%", borderRadius: "8px" }}
          />
          <h3>Laptop</h3>
          <p>₦250,000</p>
        </div>

        <div style={{ background: "white", color: "black", borderRadius: "8px", padding: "16px" }}>
          <img
            src="https://via.placeholder.com/150"
            alt="Blender"
            style={{ width: "100%", borderRadius: "8px" }}
          />
          <h3>Electric Blender</h3>
          <p>₦25,000</p>
        </div>
      </div>
    </div>
  );
}
