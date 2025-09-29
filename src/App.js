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

// 🔑 Owner email
const OWNER_EMAIL = "pceshoppingmall@gmail.com";

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Owner product input
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImg, setNewImg] = useState("");

  // Edit product state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImg, setEditImg] = useState("");

  // Orders
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Receipts (for customer)
  const [myOrders, setMyOrders] = useState([]);
  const [loadingMyOrders, setLoadingMyOrders] = useState(true);

  // Track login
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  // Load products
  const loadProducts = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "products"));
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProducts(items);
    setLoading(false);
  };

  // Load all orders (Owner only)
  const loadOrders = async () => {
    setLoadingOrders(true);
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setOrders(list);
    setLoadingOrders(false);
  };

  // Load my orders (Customer receipts)
  const loadMyOrders = async (userEmail) => {
    setLoadingMyOrders(true);
    const q = query(
      collection(db, "orders"),
      where("user", "==", userEmail),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMyOrders(list);
    setLoadingMyOrders(false);
  };

  useEffect(() => {
    loadProducts();
    if (user?.email === OWNER_EMAIL) loadOrders();
    if (user && user.email !== OWNER_EMAIL) loadMyOrders(user.email);
  }, [user]);

  // Search filter
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q.length
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products;
  }, [search, products]);

  // Cart functions
  const addToCart = (p) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found)
        return prev.map((i) =>
          i.id === p.id ? { ...i, qty: i.qty + 1 } : i
        );
      return [...prev, { ...p, qty: 1 }];
    });
  };
  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((i) => i.id !== id));
  const incQty = (id) =>
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
    );
  const decQty = (id) =>
    setCart((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i
      )
    );
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Auth
  const doRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (e) {
      alert(e.message);
    }
  };
  const doLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail("");
      setPassword("");
    } catch (e) {
      alert(e.message);
    }
  };
  const doLogout = async () => {
    await signOut(auth);
  };

  // Checkout
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
    loadMyOrders(user.email); // Refresh receipts
  };

  // Add product
  const addProduct = async () => {
    if (!newName || !newPrice || !newImg) return alert("Fill all fields");
    await addDoc(collection(db, "products"), {
      name: newName,
      price: Number(newPrice),
      img: newImg,
      createdAt: serverTimestamp(),
    });
    setNewName("");
    setNewPrice("");
    setNewImg("");
    loadProducts();
    alert("✅ Product added!");
  };

  // Delete product
  const deleteProduct = async (productId) => {
    if (!window.confirm("⚠️ Delete this product?")) return;
    try {
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
      alert("🗑️ Product deleted!");
      loadProducts();
    } catch (e) {
      alert("❌ Failed to delete product: " + e.message);
    }
  };

  // Edit product
  const startEdit = (p) => {
    setEditingProduct(p.id);
    setEditName(p.name);
    setEditPrice(p.price);
    setEditImg(p.img);
  };
  const saveEdit = async () => {
    if (!editName || !editPrice || !editImg) return alert("Fill all fields");
    try {
      const productRef = doc(db, "products", editingProduct);
      await updateDoc(productRef, {
        name: editName,
        price: Number(editPrice),
        img: editImg,
      });
      alert("✏️ Product updated!");
      setEditingProduct(null);
      loadProducts();
    } catch (e) {
      alert("❌ Failed to update product: " + e.message);
    }
  };
  const cancelEdit = () => {
    setEditingProduct(null);
    setEditName("");
    setEditPrice("");
    setEditImg("");
  };

  // Mark order as paid
  const markAsPaid = async (orderId) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { paid: true });
      alert("✅ Order marked as Paid!");
      loadOrders();
    } catch (e) {
      alert("❌ Failed: " + e.message);
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (!window.confirm("⚠️ Delete this order?")) return;
    try {
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);
      alert("🗑️ Order deleted!");
      loadOrders();
    } catch (e) {
      alert("❌ Failed to delete order: " + e.message);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(90deg, blue, green, black)",
        minHeight: "100vh",
        color: "white",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Mall Heading */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: "2.5rem", margin: 0, color: "yellow" }}>
          🛍️ PCE Shopping Mall 🛍️
        </h1>
        <p style={{ fontSize: "1.2rem", margin: 0 }}>
          The easiest way to shop and pay by transfer
        </p>
      </div>

      {!user ? (
        // Login/Register
        <div
          style={{
            maxWidth: 400,
            background: "rgba(0,0,0,0.6)",
            padding: 16,
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setAuthMode("login")}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "none",
                background:
                  authMode === "login"
                    ? "#1f6feb"
                    : "rgba(255,255,255,0.2)",
                color: "white",
              }}
            >
              Login
            </button>
            <button
              onClick={() => setAuthMode("register")}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "none",
                background:
                  authMode === "register"
                    ? "#1f6feb"
                    : "rgba(255,255,255,0.2)",
                color: "white",
              }}
            >
              Register
            </button>
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 8,
              borderRadius: 8,
              border: "none",
            }}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 12,
              borderRadius: 8,
              border: "none",
            }}
          />
          {authMode === "login" ? (
            <button
              onClick={doLogin}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "none",
                background: "#0ea5e9",
                color: "white",
              }}
            >
              Login
            </button>
          ) : (
            <button
              onClick={doRegister}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 8,
                border: "none",
                background: "#22c55e",
                color: "white",
              }}
            >
              Create Account
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              Welcome <strong>{user.email}</strong>
              {user.email === OWNER_EMAIL && (
                <span style={{ marginLeft: 10, color: "yellow" }}>
                  🔑 Owner Mode
                </span>
              )}
            </div>
            <button
              onClick={doLogout}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
              }}
            >
              Logout
            </button>
          </div>

          {/* Owner Dashboard */}
          {user.email === OWNER_EMAIL ? (
            <div
              style={{
                marginBottom: 24,
                background: "rgba(0,0,0,0.6)",
                padding: 16,
                borderRadius: 12,
              }}
            >
              <h3>📦 Owner Dashboard</h3>

              {/* Add product */}
              <h4>Add Product</h4>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Product Name"
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Price (₦)"
                type="number"
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <input
                value={newImg}
                onChange={(e) => setNewImg(e.target.value)}
                placeholder="Image URL"
                style={{ width: "100%", padding: 8, marginBottom: 8 }}
              />
              <button
                onClick={addProduct}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "none",
                  background: "#22c55e",
                  color: "white",
                }}
              >
                Add Product
              </button>

              {/* Manage products */}
              <h4 style={{ marginTop: 20 }}>🛍️ Manage Products</h4>
              {products.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  {editingProduct === p.id ? (
                    <>
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Name"
                        style={{ width: "100%", padding: 6, marginBottom: 6 }}
                      />
                      <input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="Price"
                        type="number"
                        style={{ width: "100%", padding: 6, marginBottom: 6 }}
                      />
                      <input
                        value={editImg}
                        onChange={(e) => setEditImg(e.target.value)}
                        placeholder="Image URL"
                        style={{ width: "100%", padding: 6, marginBottom: 6 }}
                      />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={saveEdit}
                          style={{
                            flex: 1,
                            padding: 8,
                            borderRadius: 6,
                            border: "none",
                            background: "#16a34a",
                            color: "white",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            flex: 1,
                            padding: 8,
                            borderRadius: 6,
                            border: "none",
                            background: "#6b7280",
                            color: "white",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <strong>{p.name}</strong> - ₦
                        {p.price.toLocaleString()}
                      </div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                        <button
                          onClick={() => startEdit(p)}
                          style={{
                            flex: 1,
                            padding: 6,
                            borderRadius: 6,
                            border: "none",
                            background: "#0ea5e9",
                            color: "white",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          style={{
                            flex: 1,
                            padding: 6,
                            borderRadius: 6,
                            border: "none",
                            background: "#dc2626",
                            color: "white",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Orders list */}
              <h4 style={{ marginTop: 20 }}>📑 Orders</h4>
              {orders.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <strong>Customer:</strong> {order.user}
                  </div>
                  <div>
                    <strong>Total:</strong> ₦{order.total.toLocaleString()}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    {order.paid ? "✅ Paid" : "❌ Not Paid"}
                  </div>
                  <h4>Items:</h4>
                  <ul>
                    {order.cart.map((item, idx) => (
                      <li key={idx}>
                        {item.qty} × {item.name} (₦{item.price.toLocaleString()}
                        )
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    {!order.paid
