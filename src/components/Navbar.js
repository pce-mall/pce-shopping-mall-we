// src/components/Navbar.js
import React from "react";
import { Link, useLocation } from "react-router-dom";

const navLinkStyle = (active) => ({
  marginLeft: 16,
  textDecoration: "none",
  fontWeight: 600,
  color: active ? "#ffffff" : "#eef2ff",
  opacity: active ? 1 : 0.9,
});

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "saturate(180%) blur(6px)",
        background:
          "linear-gradient(90deg,#0b5fff 0%, #10b981 50%, #0b0b0b 100%)",
        color: "white",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <Link to="/" style={{ textDecoration: "none", color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>🛒</span>
            <div style={{ fontSize: 22, fontWeight: 800 }}>
              PCE <span style={{ fontWeight: 700, opacity: 0.9 }}>Shopping Mall</span>
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center" }}>
          <Link to="/" style={navLinkStyle(pathname === "/")}>Home</Link>
          <Link to="/cart" style={navLinkStyle(pathname === "/cart")}>Cart</Link>
          <Link to="/checkout" style={navLinkStyle(pathname === "/checkout")}>Checkout</Link>
          <Link to="/owner" style={navLinkStyle(pathname === "/owner")}>Owner</Link>
        </nav>
      </div>
    </header>
  );
}
