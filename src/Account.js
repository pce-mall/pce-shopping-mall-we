import React, { useState, useEffect } from "react";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
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
  where 
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

// TODO: Replace with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyB31kOw965UN-2_Gi4pNjOBtVCIDuh3Ef0",
  authDomain: "pce-shopping-mall.firebaseapp.com",
  projectId: "pce-shopping-mall",
  storageBucket: "pce-shopping-mall.firebasestorage.app",
  messagingSenderId: "10570005342",
  appId: "1:10570005342:web:c30283e51d78a3b879adcf",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function Account() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("USER");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRole(snap.data().role || "USER");
        }
        fetchProducts();
        fetchOrders(currentUser.email);
        fetchSellerOrders(currentUser.email);
        if (snap.exists() && snap.data().role === "OWNER") {
          fetchAllOrders();
        }
      } else {
        setUser(null);
        setRole("USER");
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    const q = query(collection(db, "products"));
    const querySnapshot = await getDocs(q);
    setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchOrders = async (email) => {
    const q = query(collection(db, "orders"), where("buyer", "==", email));
    const querySnapshot = await getDocs(q);
    setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchAllOrders = async () => {
    const q = query(collection(db, "orders"));
    const querySnapshot = await getDocs(q);
    setAllOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchSellerOrders = async (email) => {
    const q = query(collection(db, "orders"), where("seller", "==", email));
    const querySnapshot = await getDocs(q);
    setSellerOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

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

  const addProduct = async () => {
    if (!newProduct.trim() || !newPrice.trim()) return;
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
    if (user.email !== owner) {
      alert("You can only delete your own products");
      return;
    }
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  const startEditProduct = (product) => {
    setEditingProduct(product.id);
    setEditName(product.name);
    setEditPrice(product.price);
  };

  const saveEditProduct = async (id, owner) => {
    if (user.email !== owner) {
      alert("You can only edit your own products");
      return;
    }
    const ref = doc(db, "products", id);
    await updateDoc(ref, { name: editName, price: parseFloat(editPrice) });
    setEditingProduct(null);
    setEditName("");
    setEditPrice("");
    fetchProducts();
  };

  const handleFlutterwavePayment = (product) => {
    const totalAmount = (product.price + 200);

    if (!window.FlutterwaveCheckout) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => launchFlutterwave(product, totalAmount);
    } else {
      launchFlutterwave(product, totalAmount);
    }
  };

  const launchFlutterwave = (product, totalAmount) => {
    window.FlutterwaveCheckout({
      public_key: "YOUR_FLUTTERWAVE_PUBLIC_KEY",
      tx_ref: Date.now(),
      amount: totalAmount,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: {
        email: user.email,
      },
      callback: async (data) => {
        alert("Payment successful! Ref: " + data.transaction_id);
        await addDoc(collection(db, "orders"), {
          productId: product.id,
          productName: product.name,
          buyer: user.email,
          seller: product.owner,
          price: product.price,
          commission: 200,
          totalPaid: product.price + 200,
          reference: data.transaction_id,
          status: "Pending Delivery",
          createdAt: new Date().toISOString(),
        });
        fetchOrders(user.email);
        fetchSellerOrders(user.email);
        if (role === "OWNER") fetchAllOrders();
      },
      onclose: () => {
        alert("Payment window closed");
      },
    });
  };

  const markAsDelivered = async (orderId) => {
    const ref = doc(db, "orders", orderId);
    await updateDoc(ref, { status: "Delivered" });
    fetchSellerOrders(user.email);
    fetchOrders(user.email);
    if (role === "OWNER") fetchAllOrders();
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      {!user ? (
        <form onSubmit={handleAuth} className="space-y-4">
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

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
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
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold">Welcome {user.email}</h2>
            <p className="text-gray-600">Role: {role}</p>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {/* Product Adding Section */}
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold">Sell a Product</h3>
            <input
              type="text"
              placeholder="Product name"
              value={newProduct}
              onChange={(e) => setNewProduct(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />
            <input
              type="number"
              placeholder="Price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            />
            <button
              onClick={addProduct}
              className="mt-2 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>

          {/* Product List Section */}
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Available Products</h3>
            {products.length === 0 ? (
              <p className="text-gray-500">No products yet.</p>
            ) : (
              <ul className="space-y-2">
                {products.map((p) => (
                  <li key={p.id} className="p-2 border rounded bg-white flex justify-between items-center">
                    {editingProduct === p.id ? (
                      <>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border p-1 rounded"
                        />
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="border p-1 rounded ml-2"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveEditProduct(p.id, p.owner)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingProduct(null)}
                            className="bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span>
                          {p.name} - ₦{p.price} <span className="text-sm text-gray-500">({p.owner})</span>
                        </span>
                        <div className="flex space-x-2">
                          {p.owner === user.email && (
                            <>
                              <button
                                onClick={() => startEditProduct(p)}
                                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id, p.owner)}
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleFlutterwavePayment(p)}
                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 text-sm"
                          >
                            Buy with Flutterwave
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Orders Section */}
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">My Orders</h3>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <ul className="space-y-2">
                {orders.map((o) => (
                  <li key={o.id} className="p-2 border rounded bg-white">
                    <span className="font-semibold">{o.productName}</span> - ₦{o.price} + ₦{o.commission} fee
                    <p className="text-sm text-gray-500">Ref: {o.reference}</p>
                    <p className="text-sm text-gray-500">Seller: {o.seller}</p>
                    <p className="text-sm text-gray-500">Status: {o.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Seller Orders Section */}
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">Orders for My Products</h3>
            {sellerOrders.length === 0 ? (
              <p className="text-gray-500">No orders for your products yet.</p>
            ) : (
              <ul className="space-y-2">
                {sellerOrders.map((o) => (
                  <li key={o.id} className="p-2 border rounded bg-white">
                    <span className="font-semibold">{o.productName}</span> - ₦{o.price} + ₦{o.commission} fee
                    <p className="text-sm text-gray-500">Buyer: {o.buyer}</p>
                    <p className="text-sm text-gray-500">Ref: {o.reference}</p>
                    <p className="text-sm text-gray-500">Status: {o.status}</p>
                    {o.status !== "Delivered" && (
                      <button
                        onClick={() => markAsDelivered(o.id)}
                        className="mt-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-sm"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* All Orders for Owner */}
          {role === "OWNER" && (
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-bold mb-2">All User Orders (Owner Only)</h3>
              {allOrders.length === 0 ? (
                <p className="text-gray-500">No orders yet.</p>
              ) : (
                <ul className="space-y-2">
                  {allOrders.map((o) => (
                    <li key={o.id} className="p-2 border rounded bg-white">
                      <span className="font-semibold">{o.productName}</span> - ₦{o.price} + ₦{o.commission} fee
                      <p className="text-sm text-gray-500">Buyer:
      
