import React, { useEffect, useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  getDocs,
  deleteDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey:AIzaSyB31kOw965UN-2_Gi4pNjOBtVCIDuh3Ef0 ,
  authDomain: pce-shopping-mall.firebaseapp.com,
  projectId: pce-shopping-mall,
  storageBucket: pce-shopping-mall.firebasestorage.app,
  messagingSenderId:10570005342,
  appId: "YOUR_APP_ID","1:10570005342:web:c30283e51d78a3b879adcf"
};

initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const COMMISSION_NGN = 200; // ₦200 commission

export default function Account() {
  // === Auth ===
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("USER"); // USER | SELLER | OWNER
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  // === Products ===
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState("");
  const [newPrice, setNewPrice] = useState("");

  // === Cart ===
  const [cart, setCart] = useState([]);

  // === Orders ===
  const [orders, setOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  // === UI Tab ===
  const [tab, setTab] = useState("HOME");

  // Watch auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (current) => {
      if (current) {
        setUser(current);
        const snap = await getDoc(doc(db, "users", current.uid));
        if (snap.exists()) setRole(snap.data().role || "USER");
        fetchProducts();
        fetchMyOrders(current.email);
        fetchSellerOrders(current.email);
        if (role === "OWNER") fetchAllOrders();
      } else {
        setUser(null);
        setRole("USER");
      }
    });
    return () => unsub();
  }, []);

  // === Firestore ===
  const fetchProducts = async () => {
    const qs = await getDocs(query(collection(db, "products")));
    setProducts(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchMyOrders = async (buyerEmail) => {
    const qs = await getDocs(query(collection(db, "orders"), where("buyer", "==", buyerEmail)));
    setOrders(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchSellerOrders = async (sellerEmail) => {
    const qs = await getDocs(query(collection(db, "orders"), where("sellers", "array-contains", sellerEmail)));
    setSellerOrders(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchAllOrders = async () => {
    const qs = await getDocs(collection(db, "orders"));
    setAllOrders(qs.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // === Auth ===
  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          email: res.user.email,
          role: "USER",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => await signOut(auth);

  // === Product CRUD ===
  const addProduct = async () => {
    if (!newProduct || !newPrice) return;
    await addDoc(collection(db, "products"), {
      name: newProduct,
      price: parseFloat(newPrice),
      owner: user.email,
      createdAt: new Date().toISOString(),
    });
    setNewProduct("");
    setNewPrice("");
    fetchProducts();
  };

  const deleteProduct = async (id, owner) => {
    if (user.email !== owner) return alert("Only delete your own products");
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  // === Cart ===
  const addToCart = (p) => {
    setCart((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i].qty += 1;
        return copy;
      }
      return [...prev, { ...p, qty: 1 }];
    });
    setTab("CART");
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it))
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((it) => it.id !== id));

  // === Orders ===
  const placeOrderCOD = async () => {
    if (cart.length === 0) return alert("Cart is empty");

    const sellers = Array.from(new Set(cart.map((x) => x.owner)));
    const order = {
      buyer: user.email,
      items: cart.map((it) => ({ productId: it.id, name: it.name, price: it.price, qty: it.qty, seller: it.owner })),
      sellers,
      subtotal: cart.reduce((s, it) => s + it.price * it.qty, 0),
      commission: COMMISSION_NGN,
      total: cart.reduce((s, it) => s + it.price * it.qty, 0) + COMMISSION_NGN,
      method: "COD",
      status: "Pending Payment",
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "orders"), order);
    setCart([]);
    fetchMyOrders(user.email);
    fetchSellerOrders(user.email);
    if (role === "OWNER") fetchAllOrders();
    setTab("ORDERS");
    alert("Order placed with Cash on Delivery ✅");
  };

  const markAsDelivered = async (id) => {
    await updateDoc(doc(db, "orders", id), { status: "Delivered" });
    fetchMyOrders(user.email);
    fetchSellerOrders(user.email);
    if (role === "OWNER") fetchAllOrders();
  };

  // === UI ===
  const TabBtn = ({ id, children }) => (
    <button onClick={() => setTab(id)} className={`px-3 py-2 ${tab === id ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
      {children}
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Top Nav */}
      <div className="flex justify-between mb-4">
        <h1 className="font-bold text-xl">PCE Shopping Mall</h1>
        <div className="flex gap-2">
          <TabBtn id="HOME">Home</TabBtn>
          <TabBtn id="CART">Cart ({cart.reduce((s, i) => s + i.qty, 0)})</TabBtn>
          <TabBtn id="ORDERS">Orders</TabBtn>
          <TabBtn id="SELL">Sell</TabBtn>
        </div>
      </div>

      {/* Auth */}
      {!user && (
        <form onSubmit={handleAuth} className="p-4 bg-white shadow rounded mb-4">
          <h2>{isLogin ? "Login" : "Sign Up"}</h2>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
          {error && <p>{error}</p>}
          <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
          <p onClick={() => setIsLogin(!isLogin)}>{isLogin ? "Create account" : "Already have an account? Login"}</p>
        </form>
      )}

      {user && (
        <div>
          <p>Welcome {user.email} ({role})</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Tabs */}
      {tab === "HOME" && (
        <div>
          <h3>Products</h3>
          <ul>
            {products.map((p) => (
              <li key={p.id}>
                {p.name} - ₦{p.price} ({p.owner})
                <button onClick={() => addToCart(p)}>Add to Cart</button>
                {p.owner === user?.email && (
                  <button onClick={() => deleteProduct(p.id, p.owner)}>Delete</button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "CART" && (
        <div>
          <h3>Your Cart</h3>
          {cart.map((c) => (
            <div key={c.id}>
              {c.name} - ₦{c.price} x {c.qty}
              <button onClick={() => changeQty(c.id, -1)}>-</button>
              <button onClick={() => changeQty(c.id, 1)}>+</button>
              <button onClick={() => removeFromCart(c.id)}>Remove</button>
            </div>
          ))}
          <p>Total: ₦{cart.reduce((s, i) => s + i.price * i.qty, 0) + COMMISSION_NGN}</p>
          <button onClick={placeOrderCOD}>Place Order (COD)</button>
        </div>
      )}

      {tab === "ORDERS" && (
        <div>
          <h3>My Orders</h3>
          {orders.map((o) => (
            <div key={o.id}>
              <p>Total ₦{o.total} - {o.status}</p>
              {o.items.map((it) => (
                <p key={it.productId}>{it.name} x {it.qty}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      {tab === "SELL" && user && (
        <div>
          <h3>Add Product</h3>
          <input value={newProduct} onChange={(e) => setNewProduct(e.target.value)} placeholder="Name" />
          <input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="Price" />
          <button onClick={addProduct}>Add</button>
        </div>
      )}
    </div>
  );
}
