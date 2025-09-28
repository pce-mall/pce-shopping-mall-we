import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  // 🛍️ Add your products here
  const [products] = useState([
    {
      id: 1,
      name: "Blue Shoes",
      price: 20000,
      img: "https://firebasestorage.googleapis.com/v0/b/pce-shopping-mall.appspot.com/o/blue-shoes.jpg?alt=media&token=abc123"
    },
    {
      id: 2,
      name: "Green Shirt",
      price: 15000,
      img: "https://firebasestorage.googleapis.com/v0/b/pce-shopping-mall.appspot.com/o/green-shirt.jpg?alt=media&token=xyz456"
    },
    {
      id: 3,
      name: "Black Bag",
      price: 30000,
      img: "https://firebasestorage.googleapis.com/v0/b/pce-shopping-mall.appspot.com/o/black-bag.jpg?alt=media&token=def789"
    }
  ]);

  // Track login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  // Filter search
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q.length
      ? products.filter(p => p.name.toLowerCase().includes(q))
      : products;
  }, [search, products]);

  // Cart functions
  const addToCart = (p) => {
    setCart(prev => {
      const found = prev.find(i => i.id === p.id);
      if (found) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const incQty = (id) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  const decQty = (id) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i));
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Auth
  const doRegister = async () => {
    if (!email || !password) return alert("Enter email and password");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword("");
    } catch (e) { alert(e.message); }
  };
  const doLogin = async () => {
    if (!email || !password) return alert("Enter email and password");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword("");
    } catch (e) { alert(e.message); }
  };
  const doLogout = async () => { await signOut(auth); };

  // Checkout (Bank Transfer)
  const checkout = async () => {
    if (!user) return alert("Please login first");
    if (!cart.length) return alert("Your cart is empty");

    alert(`
Please transfer ₦${total.toLocaleString()} to:

Bank: First City Monument Bank (FCMB)
Account Name: Paul Chuk Enterprise
Account Number: 2005586667

📧 Send proof of payment to:
Email: pceshoppingmall@gmail.com
WhatsApp: +2347089724573
    `);

    await addDoc(collection(db, "orders"), {
      user: user.email,
      cart,
      total,
      paid: false,
      createdAt: serverTimestamp(),
    });

    setCart([]);
  };

  return (
    <div style={{
      background: "linear-gradient(90deg, blue, green, black)",
      minHeight: "100vh",
      color: "white",
      padding: 20,
      fontFamily: "Arial, sans-serif"
    }}>
      <h1>PCE Shopping Mall</h1>
      <p>Shop easily & pay with bank transfer.</p>

      {!user ? (
        <div style={{ maxWidth: 400, background: "rgba(0,0,0,0.6)", padding: 16, borderRadius: 12 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setAuthMode("login")}
              style={{ flex: 1, padding: 10, borderRadius: 8, border: "none",
                       background: authMode==="login" ? "#1f6feb" : "rgba(255,255,255,0.2)", color: "white" }}>
              Login
            </button>
            <button onClick={() => setAuthMode("register")}
              style={{ flex: 1, padding: 10, borderRadius: 8, border: "none",
                       background: authMode==="register" ? "#1f6feb" : "rgba(255,255,255,0.2)", color: "white" }}>
              Register
            </button>
          </div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email"
                 style={{ width: "100%", padding: 10, marginBottom: 8, borderRadius: 8, border: "none" }} />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password"
                 style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 8, border: "none" }} />
          {authMode === "login"
            ? <button onClick={doLogin} style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#0ea5e9", color: "white" }}>Login</button>
            : <button onClick={doRegister} style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#22c55e", color: "white" }}>Create Account</button>}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div>Welcome <strong>{user.email}</strong></div>
            <button onClick={doLogout} style={{ padding: "8px 12px", borderRadius: 8, border: "none" }}>Logout</button>
          </div>

          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
                 style={{ width: "100%", maxWidth: 420, padding: 10, marginBottom: 16, borderRadius: 8, border: "none" }} />

          <h3>Products</h3>
          {!filteredProducts.length ? (
            <div style={{ opacity: 0.8 }}>⚠️ No products yet. Add some to get started.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {filteredProducts.map(p => (
                <div key={p.id} style={{ background: "rgba(0,0,0,0.6)", borderRadius: 12, padding: 12 }}>
                  <img src={p.img} alt={p.name} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }} />
                  <div style={{ marginTop: 8, fontWeight: 600 }}>{p.name}</div>
                  <div>₦{p.price.toLocaleString()}</div>
                  <button onClick={() => addToCart(p)}
                          style={{ marginTop: 8, width: "100%", padding: 10, borderRadius: 8, border: "none",
                                   background: "#1f6feb", color: "white" }}>
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ marginTop: 24 }}>Cart</h3>
          {!cart.length ? (
            <div>Your cart is empty.</div>
          ) : (
            <div style={{ display: "grid", gap: 12, maxWidth: 720 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 12, alignItems: "center", background: "rgba(0,0,0,0.6)", padding: 10, borderRadius: 12 }}>
                  <img src={item.img} alt={item.name} style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover" }} />
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div>₦{(item.price * item.qty).toLocaleString()} ({item.qty} × ₦{item.price.toLocaleString()})</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <button onClick={() => decQty(item.id)}>-</button>
                      <button onClick={() => incQty(item.id)}>+</button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ padding: "8px 12px", borderRadius: 8, border: "none" }}>
                    Delete
                  </button>
                </div>
              ))}
              <div style={{ textAlign: "right", fontSize: 18, fontWeight: 700 }}>
                Total: ₦{total.toLocaleString()}
              </div>
              <button onClick={checkout} style={{ padding: 12, borderRadius: 10, border: "none", background: "#22c55e", color: "white", fontSize: 16 }}>
                Checkout (Bank Transfer)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
