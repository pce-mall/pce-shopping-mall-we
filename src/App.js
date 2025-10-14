// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Invoice from "./components/Invoice";
import OwnerDashboard from "./components/OwnerDashboard";
import AddProduct from "./components/AddProduct";

// If your owner login file is named AdminLogin.js (as in your repo screenshot):
import AdminLogin from "./components/AdminLogin";

// Firebase auth watcher
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return <div style={{ padding: 24 }}>Loading…</div>;
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/invoice/:orderId" element={<Invoice />} />

        {/* owner routes (protected) */}
        <Route path="/login" element={<AdminLogin />} />
        <Route
          path="/owner-dashboard"
          element={user ? <OwnerDashboard /> : <AdminLogin />}
        />
        <Route
          path="/add-product"
          element={user ? <AddProduct /> : <AdminLogin />}
        />

        {/* fallback to home so no white screen */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
