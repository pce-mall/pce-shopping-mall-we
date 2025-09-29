import React, { useEffect, useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  // Product form (owner)
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImg, setNewImg] = useState("");
  const [editing, setEditing] = useState(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  // Load products
  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // Load all orders (owner)
  const loadOrders = async () => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // Load my orders (customer)
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
    alert(`Please pay ₦${total.toLocaleString()} via transfer:

Bank: First City Monument Bank (FCMB)
Account Name: Paul Chuk Enterprise
Account Number: 2005586667

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
    if (!newName || !newPrice || !newImg) return;
    await addDoc(collection(db, "products"), {
      name: newName,
      price: Number(newPrice),
      img: newImg,
    });
    setNewName("");
    setNewPrice("");
    setNewImg("");
    loadProducts();
  };
  const updateProduct = async (id) => {
    await updateDoc(doc(db, "products", id), {
      name: newName,
      price: Number(newPrice),
      img: newImg,
    });
    setEditing(null);
    loadProducts();
  };
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  // Orders (owner)
  const markPaid = async (id) => {
    await updateDoc(doc(db, "orders", id), { paid: true });
    loadOrders();
  };
  const deleteOrder = async (id) => {
    if (!window.confirm("Delete order?")) return;
    await deleteDoc(doc(db, "orders", id));
    loadOrders();
  };

  // Filtered products
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products;
  }, [search, products]);

  return (
    <div
      style={{
        background: "linear-gradient(90deg, blue, green, black)",
        minHeight: "100vh",
        color: "white",
        padding: 20,
      }}
    >
      <h1 style={{ textAlign: "center", color: "yellow" }}>🛍 PCE Shopping Mall</h1>

      {!user ? (
        // Auth form
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button onClick={() => setAuthMode("login")}>Login</button>
            <button onClick={() => setAuthMode("register")}>Register</button>
          </div>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button onClick={authMode === "login" ? doLogin : doRegister}>
            {authMode === "login" ? "Login" : "Create Account"}
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            Welcome <b>{user.email}</b>{" "}
            {user.email === OWNER_EMAIL && "🔑 (Owner)"}
            <button onClick={doLogout} style={{ marginLeft: 10 }}>
              Logout
            </button>
          </div>

          {user.email === OWNER_EMAIL ? (
            // Owner dashboard
            <div>
              <h3>📦 Add Product</h3>
              <input
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <input
                placeholder="Price"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
              <input
                placeholder="Image URL"
                value={newImg}
                onChange={(e) => setNewImg(e.target.value)}
              />
              <button onClick={addProduct}>Add</button>

              <h3>🛍 Manage Products</h3>
              {products.map((p) => (
                <div key={p.id}>
                  {editing === p.id ? (
                    <>
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                      />
                      <input
                        value={newImg}
                        onChange={(e) => setNewImg(e.target.value)}
                      />
                      <button onClick={() => updateProduct(p.id)}>Save</button>
                      <button onClick={() => setEditing(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <b>{p.name}</b> ₦{p.price}
                      <button
                        onClick={() => {
                          setEditing(p.id);
                          setNewName(p.name);
                          setNewPrice(p.price);
                          setNewImg(p.img);
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
                  <div>
                    <b>{o.user}</b> — ₦{o.total} {o.paid ? "✅" : "❌"}
                  </div>
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
            </div>
          ) : (
            // Customer shop
            <div>
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
                  <b>Order {o.id}</b> ₦{o.total} {o.paid ? "✅" : "❌"}
                  <ul>
                    {o.cart.map((i, idx) => (
                      <li key={idx}>
                        {i.qty} × {i.name} ₦{i.price}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
