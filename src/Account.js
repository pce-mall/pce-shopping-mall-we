import React, { useState, useEffect } from "react";
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
import { auth, db, storage } from "./firebase"; // ✅ firebase.js must also export storage

export default function Account() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("USER");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);

  const [search, setSearch] = useState(""); // 🔹 search input state

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  // 🔹 Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const refDoc = doc(db, "users", currentUser.uid);
        const snap = await getDoc(refDoc);
        if (snap.exists()) {
          setRole(snap.data().role || "USER");
        }
        fetchProducts();
        fetchOrders(currentUser.email);
        fetchSellerOrders(currentUser.email);
        if (snap.exists() && snap.data().role === "OWNER") fetchAllOrders();
      } else {
        setUser(null);
        setRole("USER");
      }
    });
    fetchProducts();
    return () => unsubscribe();
  }, []);

  // 🔹 Firestore fetchers
  const fetchProducts = async () => {
    const q = query(collection(db, "products"));
    const snap = await getDocs(q);
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchOrders = async (email) => {
    const q = query(collection(db, "orders"), where("buyer", "==", email));
    const snap = await getDocs(q);
    setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchSellerOrders = async (email) => {
    const q = query(collection(db, "orders"), where("seller", "==", email));
    const snap = await getDocs(q);
    setSellerOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const fetchAllOrders = async () => {
    const q = query(collection(db, "orders"));
    const snap = await getDocs(q);
    setAllOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  // 🔹 Authentication
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

  const handleLogout = async () => {
    await signOut(auth);
  };

  // 🔹 Add Product (with image upload)
  const addProduct = async () => {
    if (!newProduct || !newPrice || !newDescription || !newImage) return;

    const imgRef = ref(storage, `products/${Date.now()}_${newImage.name}`);
    await uploadBytes(imgRef, newImage);
    const imageUrl = await getDownloadURL(imgRef);

    await addDoc(collection(db, "products"), {
      name: newProduct,
      price: parseFloat(newPrice),
      description: newDescription,
      imageUrl,
      owner: user.email,
      createdAt: new Date().toISOString(),
    });

    setNewProduct("");
    setNewPrice("");
    setNewDescription("");
    setNewImage(null);
    fetchProducts();
  };

  // 🔹 Cart functions
  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const checkout = async () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, p) => sum + p.price, 0) + 200;
    await addDoc(collection(db, "orders"), {
      buyer: user.email,
      items: cart,
      total,
      commission: 200,
      status: "Pending Delivery",
      createdAt: new Date().toISOString(),
      seller: cart[0]?.owner || "unknown",
    });

    setCart([]);
    fetchOrders(user.email);
    fetchSellerOrders(user.email);
    if (role === "OWNER") fetchAllOrders();
    alert("Order placed successfully!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {!user ? (
        // 🔹 Login / Signup Form
        <form onSubmit={handleAuth} className="space-y-4 bg-white p-6 rounded shadow">
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
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Welcome {user.email}</h2>
            <p className="text-gray-600">Role: {role}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>

          {/* 🔹 Product Form (Sellers) */}
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
              onChange={(e) => setNewImage(e.target.files[0])}
              className="w-full mb-2"
            />
            <button onClick={addProduct} className="w-full bg-blue-600 text-white p-2 rounded">
              Add Product
            </button>
          </div>

          {/* 🔹 Products List with Search */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-bold mb-2">Available Products</h3>

            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(search.toLowerCase()) ||
                    p.description.toLowerCase().includes(search.toLowerCase())
                )
                .map((p) => (
                  <div key={p.id} className="p-4 border rounded bg-gray-50">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-40 object-cover rounded"
                    />
                    <h4 className="text-lg font-bold mt-2">{p.name}</h4>
                    <p className="text-green-600 font-semibold">₦{p.price}</p>
                    <p className="text-sm text-gray-600">{p.description}</p>
                    <p className="text-xs text-gray-500">Seller: {p.owner}</p>
                    <button
                      onClick={() => addToCart(p)}
                      className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* 🔹 Cart Section */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-bold mb-2">My Cart</h3>
            {cart.length === 0 ? (
              <p className="text-gray-500">Cart is empty</p>
            ) : (
              <>
                <ul className="space-y-2">
                  {cart.map((c) => (
                    <li key={c.id} className="flex justify-between items-center border-b py-2">
                      <span>{c.name} - ₦{c.price}</span>
                      <button
                        onClick={() => removeFromCart(c.id)}
                        className="text-red-500 text-sm"
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

          {/* 🔹 Orders Section */}
          <div className="bg-white p-4 rounded shadow mb-6">
            <h3 className="font-bold mb-2">My Orders</h3>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet</p>
            ) : (
              <ul className="space-y-2">
                {orders.map((o) => (
                  <li key={o.id} className="p-2 border rounded bg-gray-50">
                    {o.items.map((i) => (
                      <p key={i.id}>{i.name} - ₦{i.price}</p>
                    ))}
                    <p>Total: ₦{o.total}</p>
                    <p>Status: {o.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 🔹 Seller Orders */}
          {role === "SELLER" || role === "OWNER" ? (
            <div className="bg-white p-4 rounded shadow mb-6">
              <h3 className="font-bold mb-2">Orders for My Products</h3>
              {sellerOrders.length === 0 ? (
                <p className="text-gray-500">No seller orders</p>
              ) : (
                <ul className="space-y-2">
                  {sellerOrders.map((o) => (
                    <li key={o.id} className="p-2 border rounded bg-gray-50">
                      {o.items.map((i) => (
                        <p key={i.id}>{i.name} - ₦{i.price}</p>
                      ))}
                      <p>Buyer: {o.buyer}</p>
                      <p>Status: {o.status}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}

          {/* 🔹 Owner Orders */}
          {role === "OWNER" && (
            <div className="bg-white p-4 rounded shadow mb-6">
              <h3 className="font-bold mb-2">All Orders (Owner)</h3>
              {allOrders.length === 0 ? (
                <p className="text-gray-500">No orders</p>
              ) : (
                <ul className="space-y-2">
                  {allOrders.map((o) => (
                    <li key={o.id} className="p-2 border rounded bg-gray-50">
                      Buyer: {o.buyer}, Total: ₦{o.total}, Status: {o.status}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
        }
