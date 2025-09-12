// src/Account.js
import React, { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase"; // <- make sure firebase.js exports storage

export default function Account() {
  // auth / role
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("USER");

  // auth form
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // products + create
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);

  // search
  const [search, setSearch] = useState("");

  // cart + orders
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  // auth listener + initial load
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const uref = doc(db, "users", u.uid);
        const usnap = await getDoc(uref);
        if (usnap.exists()) setRole(usnap.data().role || "USER");
        await fetchProducts();
        await fetchOrders(u.email);
        await fetchSellerOrders(u.email);
        if (usnap.exists() && usnap.data().role === "OWNER") await fetchAllOrders();
      } else {
        setUser(null);
        setRole("USER");
        await fetchProducts();
      }
    });
    fetchProducts();
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Firestore helpers =====
  const fetchProducts = async () => {
    const qy = query(collection(db, "products"));
    const snap = await getDocs(qy);
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchOrders = async (buyerEmail) => {
    const qy = query(collection(db, "orders"), where("buyer", "==", buyerEmail));
    const snap = await getDocs(qy);
    setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchSellerOrders = async (sellerEmail) => {
    const qy = query(collection(db, "orders"), where("seller", "==", sellerEmail));
    const snap = await getDocs(qy);
    setSellerOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchAllOrders = async () => {
    const qy = query(collection(db, "orders"));
    const snap = await getDocs(qy);
    setAllOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // ===== Auth handlers =====
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
          role: "USER", // default role
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // ===== Product create (with image upload) =====
  const addProduct = async () => {
    if (!user) return alert("Login to add products.");
    if (!newProduct || !newPrice || !newDescription || !newImage)
      return alert("Fill name, price, description and choose an image.");

    const imgRef = ref(storage, `products/${Date.now()}_${newImage.name}`);
    await uploadBytes(imgRef, newImage);
    const imageUrl = await getDownloadURL(imgRef);

    await addDoc(collection(db, "products"), {
      name: newProduct.trim(),
      price: parseFloat(newPrice),
      description: newDescription.trim(),
      imageUrl,
      owner: user.email,
      createdAt: new Date().toISOString(),
    });

    setNewProduct("");
    setNewPrice("");
    setNewDescription("");
    setNewImage(null);
    await fetchProducts();
  };

  // ===== Product delete (owner OR OWNER role) =====
  const deleteProduct = async (product) => {
    if (!user) return;
    const canDelete = product.owner === user.email || role === "OWNER";
    if (!canDelete) return alert("You can only delete your own products.");
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    await deleteDoc(doc(db, "products", product.id));
    setCart((prev) => prev.filter((c) => c.id !== product.id));
    await fetchProducts();
  };

  // ===== Cart & checkout =====
  const addToCart = (p) => {
    if (!user) return alert("Login to add to cart.");
    setCart((prev) => [...prev, p]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const checkout = async () => {
    if (!user) return alert("Login to checkout.");
    if (cart.length === 0) return alert("Cart is empty.");
    const commission = 200;
    const itemsTotal = cart.reduce((s, p) => s + Number(p.price || 0), 0);
    const total = itemsTotal + commission;

    await addDoc(collection(db, "orders"), {
      buyer: user.email,
      seller: cart[0]?.owner || "unknown", // simple 1-seller assumption
      items: cart.map((p) => ({ id: p.id, name: p.name, price: p.price })),
      commission,
      total,
      status: "Pending Delivery",
      createdAt: new Date().toISOString(),
    });

    setCart([]);
    await fetchOrders(user.email);
    await fetchSellerOrders(user.email);
    if (role === "OWNER") await fetchAllOrders();
    alert("Order placed successfully (Cash on Delivery).");
  };

  // ===== UI =====
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* PUBLIC BANNER */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: "linear-gradient(135deg, #16a34a, #2563eb)",
          color: "#fff",
        }}
      >
        <h1 className="text-2xl font-extrabold">Welcome to Paul Chuk Enterprises</h1>
        <p className="opacity-90">Trusted & reliable — buy and sell instantly.</p>
      </div>

      {!user ? (
        // ===== Login / Signup =====
        <form onSubmit={handleAuth} className="space-y-4 bg-white p-6 rounded shadow max-w-md mx-auto mb-8">
          <h2 className="text-xl font-bold text-center">
            {isLogin ? "Login to PCE Shopping Mall" : "Create an Account"}
          </h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
            {isLogin ? "Login" : "Sign Up"}
          </button>
          <p
            className="text-blue-600 cursor-pointer text-center"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </p>
        </form>
      ) : (
        <>
          {/* USER HEADER */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Welcome {user.email}</h2>
            <p className="text-gray-600">Role: {role}</p>
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>

          {/* SELL A PRODUCT */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-bold mb-2">Sell a Product</h3>
            <input
              type="text"
              placeholder="Product name"
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="number"
              placeholder="Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <textarea
              placeholder="Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImage(e.target.files?.[0] || null)}
              className="w-full mb-2"
            />
            <button onClick={addProduct} className="w-full bg-blue-600 text-white p-2 rounded">
              Add Product
            </button>
          </div>
        </>
      )}

      {/* PRODUCTS (Public + Logged-in) */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-bold mb-2">Available Products</h3>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products
            .filter((p) => {
              if (!search.trim()) return true;
              const s = search.toLowerCase();
              return (
                (p.name || "").toLowerCase().includes(s) ||
                (p.description || "").toLowerCase().includes(s) ||
                (p.owner || "").toLowerCase().includes(s)
              );
            })
            .map((p) => (
              <div key={p.id} className="p-4 border rounded bg-gray-50">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-40 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 rounded grid place-items-center">
                    No Image
                  </div>
                )}

                <h4 className="text-lg font-bold mt-2">{p.name}</h4>
                <p className="text-green-600 font-semibold">₦{p.price}</p>
                <p className="text-sm text-gray-600">{p.description}</p>
                <p className="text-xs text-gray-500">Seller: {p.owner}</p>

                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => addToCart(p)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Add to Cart
                  </button>

                  {(p.owner === user?.email || role === "OWNER") && (
                    <button
                      onClick={() => deleteProduct(p)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* CART */}
      {user && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold mb-2">My Cart</h3>
          {cart.length === 0 ? (
            <p className="text-gray-500">Cart is empty</p>
          ) : (
            <>
              <ul className="space-y-2">
                {cart.map((c) => (
                  <li key={c.id} className="flex justify-between items-center border-b py-2">
                    <span>
                      {c.name} - ₦{c.price}
                    </span>
                    <button
                      onClick={() => removeFromCart(c.id)}
                      className="text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <button onClick={checkout} className="mt-4 w-full bg-blue-600 text-white p-2 rounded">
                Checkout (₦200 fee included)
              </button>
            </>
          )}
        </div>
      )}

      {/* ORDERS (Buyer) */}
      {user && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold mb-2">My Orders</h3>
          {orders.length === 0 ? (
            <p className="text-gray-500">No orders yet</p>
          ) : (
            <ul className="space-y-2">
              {orders.map((o) => (
                <li key={o.id} className="p-2 border rounded bg-gray-50">
                  {o.items?.map((i) => (
                    <p key={i.id}>
                      {i.name} - ₦{i.price}
                    </p>
                  ))}
                  <p className="font-semibold">Total: ₦{o.total}</p>
                  <p>Status: {o.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* SELLER ORDERS */}
      {user && (role === "SELLER" || role === "OWNER") && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold mb-2">Orders for My Products</h3>
          {sellerOrders.length === 0 ? (
            <p className="text-gray-500">No seller orders</p>
          ) : (
            <ul className="space-y-2">
              {sellerOrders.map((o) => (
                <li key={o.id} className="p-2 border rounded bg-gray-50">
                  {o.items?.map((i) => (
                    <p key={i.id}>
                      {i.name} - ₦{i.price}
                    </p>
                  ))}
                  <p>Buyer: {o.buyer}</p>
                  <p>Status: {o.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* OWNER: ALL ORDERS */}
      {user && role === "OWNER" && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3 className="font-bold mb-2">All Orders (Owner)</h3>
          {allOrders.length === 0 ? (
            <p className="text-gray-500">No orders</p>
          ) : (
            <ul className="space-y-2">
              {allOrders.map((o) => (
                <li key={o.id} className="p-2 border rounded bg-gray-50">
                  Buyer: {o.buyer} • Total: ₦{o.total} • Status: {o.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
          }
