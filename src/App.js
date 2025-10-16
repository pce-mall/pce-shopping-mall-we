// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OwnerDashboard from "./components/OwnerDashboard";
import AddProduct from "./components/AddProduct";
import Invoice from "./components/Invoice";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/invoice" element={<Invoice />} />
      </Routes>
      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/2347089724573"
        target="_blank"
        rel="noreferrer"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 26,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          zIndex: 60,
          textDecoration: "none",
        }}
        aria-label="Chat on WhatsApp"
      >
        🟢
      </a>
    </Router>
  );
}

export default App;
