// src/components/Footer.js
import React from "react";

export default function Footer() {
  return (
    <footer style={{ marginTop: 24, padding: "18px 16px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", fontSize: 14 }}>
        <div>
          <strong>Bank Transfer:</strong> FCMB — <strong>2005586667</strong> —{" "}
          <strong>Paul Chuk Enterprise</strong>
        </div>
        <div style={{ opacity: 0.8, marginTop: 6 }}>
          © {new Date().getFullYear()} PCE Shopping Mall. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
