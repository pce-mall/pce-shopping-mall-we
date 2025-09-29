// src/App.js
import React, { useState, useEffect, useMemo } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";

const OWNER_EMAIL = "pceshoppingmall@gmail.com";

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  // Product form (owner)
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [img, setImg] = useState("");
  const [editing, setEditing] = useState(null);

  // Auth state
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  // Load products
  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // Load orders
  const loadOrders = async () => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadMyOrders = async (email) => {
    const q = query(
      collection(db, "orders"),
      where("user", "==", email),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    setMyOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadProducts();
    if (user?.email === OWNER_EMAIL) loadOrders();
    if (user && user.email !== OWNER_EMAIL) loadMyOrders(user.email);
  }, [user]);

  // Auth
  const doRegister = () =>
    createUserWithEmailAndPassword(auth, email, password).catch((e) =>
      alert(e.message)
    );
  const doLogin = () =>
    signInWithEmailAndPassword(auth, email, password).catch((e) =>
      alert(e.message)
    );
  const doLogout = () => signOut(auth);

  // Cart
  const addToCart = (p) =>
    setCart((c) => {
      const f = c.find((i) => i.id === p.id);
      return f
        ? c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { ...p, qty: 1 }];
    });
  const inc = (id) =>
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  const dec = (id) =>
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
    );
  const remove = (id) => setCart((c) => c.filter((i) => i.id !== id));
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Checkout
  const checkout = async () => {
    if (!user) return alert("Please login first");
    if (!cart.length) return alert("Cart is empty");
    alert(`Please transfer ₦${total} to:

Bank: FCMB
Account: Paul Chuk Enterprise
Number: 2005586667

Send receipt to:
Email: pceshoppingmall@gmail.com
WhatsApp: +2347089724573`);

    await addDoc(collection(db, "orders"), {
      user: user.email,
      cart,
      total,
      paid: false,
      createdAt: serverTimestamp(),
    });
    setCart([]);
    loadMyOrders(user.email);
  };

  // Products (owner)
  const addProduct = async () => {
    if (!name || !price || !img) return;
    await addDoc(collection(db, "products"), {
      name,
      price: Number(price),
      img,
    });
    setName("");
    setPrice("");
    setImg("");
    loadProducts();
  };

  const updateProduct = async (id) => {
    await updateDoc(doc(db, "products", id), {
      name,
      price: Number(price),
      img,
    });
    setEditing(null);
    loadProducts();
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  // Orders (owner)
  const markPaid = async (id) => {
    await updateDoc(doc(db, "orders", id), { paid: true });
    loadOrders();
  };
  const deleteOrder = async (id) => {
    await deleteDoc(doc(db, "orders", id));
    loadOrders();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [search, products]);

  return (
    <div
      style={{
        background: "linear-gradient(90deg, blue, green, black)",
        minHeight: "100vh",
        padding: 20,
      }}
    >
      <h1 style={{ textAlign: "center" }}>🛍 PCE Shopping Mall</h1>

      {!user ? (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setAuthMode("login")}>Login</button>
            <button onClick={() => setAuthMode("register")}>Register</button>
          </div>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={authMode === "login" ? doLogin : doRegister}>
            {authMode === "login" ? "Login" : "Register"}
          </button>
        </div>
      ) : (
        <>
          <div>
            Welcome <b>{user.email}</b>{" "}
            {user.email === OWNER_EMAIL && "(Owner)"}
            <button onClick={doLogout}>Logout</button>
          </div>

          {user.email === OWNER_EMAIL ? (
            <>
              <h3>📦 Add Product</h3>
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <input
                placeholder="Image URL"
                value={img}
                onChange={(e) => setImg(e.target.value)}
              />
              <button onClick={addProduct}>Add</button>

              <h3>🛍 Manage Products</h3>
              {products.map((p) => (
                <div key={p.id}>
                  {editing === p.id ? (
                    <>
                      <input value={name} onChange={(e) => setName(e.target.value)} />
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                      <input value={img} onChange={(e) => setImg(e.target.value)} />
                      <button onClick={() => updateProduct(p.id)}>Save</button>
                      <button onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <b>{p.name}</b> ₦{p.price}
                      <button
                        onClick={() => {
                          setEditing(p.id);
                          setName(p.name);
                          setPrice(p.price);
                          setImg(p.img);
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => deleteProduct(p.id)}>Delete</button>
                    </>
                  )}
                </div>
              ))}

              <h3>📑 Orders</h3>
              {orders.map((o) => (
                <div key={o.id} style={{ marginBottom: 10 }}>
                  <b>{o.user}</b> — ₦{o.total} {o.paid ? "✅" : "❌"}
                  <ul>
                    {o.cart.map((i, idx) => (
                      <li key={idx}>
                        {i.qty} × {i.name} ₦{i.price}
                      </li>
                    ))}
                  </ul>
                  {!o.paid && <button onClick={() => markPaid(o.id)}>Mark Paid</button>}
                  <button onClick={() => deleteOrder(o.id)}>Delete</button>
                </div>
              ))}
            </>
          ) : (
            <>
              <h3>🛍 Products</h3>
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {filtered.map((p) => (
                <div key={p.id}>
                  <b>{p.name}</b> ₦{p.price}
                  <button onClick={() => addToCart(p)}>Add</button>
                </div>
              ))}

              <h3>🛒 Cart</h3>
              {cart.map((i) => (
                <div key={i.id}>
                  {i.qty} × {i.name} ₦{i.price}
                  <button onClick={() => inc(i.id)}>+</button>
                  <button onClick={() => dec(i.id)}>-</button>
                  <button onClick={() => remove(i.id)}>Remove</button>
                </div>
              ))}
              <div>Total: ₦{total}</div>
              <button onClick={checkout}>Checkout</button>

              <h3>🧾 My Receipts</h3>
              {myOrders.map((o) => (
                <div key={o.id}>
                  <b>Order</b> ₦{o.total} {o.paid ? "✅" : "❌"}
                  <ul>
                    {o.cart.map((i, idx) => (
                      <li key={idx}>
                        {i.qty} × {i.name} ₦{i.price}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
