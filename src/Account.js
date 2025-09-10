import React, { useState, useEffect } from "react";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore, doc, setDoc, getDoc, collection, addDoc,
  query, getDocs, deleteDoc, updateDoc, where
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

// ✅ Replace with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function Account() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("USER");
  const [products, setProducts] = useState([]);

  // login/signup state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null);
      if (currentUser) {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) setRole(snap.data().role || "USER");
      }
    });
    fetchProducts();
    return () => unsubscribe();
  }, []);

  const fetchProducts = async () => {
    const q = query(collection(db, "products"));
    const querySnapshot = await getDocs(q);
    setProducts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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

  const placeOrderGuest = async (product) => {
    alert("Order placed for " + product.name + " (Cash on Delivery).");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-500 to-blue-600 text-white p-6">
      {/* Welcome Banner */}
      <div className="text-center py-10">
        <h1 className="text-4xl font-extrabold mb-4">
          Welcome to Paul Chuk Enterprises
        </h1>
        <p className="text-lg">
          Your trusted online shopping mall – browse and purchase products instantly.
        </p>
      </div>

      {/* Product Preview */}
      <div className="bg-white text-black rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Available Products</h2>
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products available yet.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <li key={p.id} className="p-4 border rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="text-green-600 font-bold">₦{p.price}</p>
                <p className="text-sm text-gray-500 mt-1">Seller: {p.owner}</p>
                <button
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => placeOrderGuest(p)}
                >
                  Purchase (Guest COD)
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Login/Signup only if not logged in */}
      {!user && (
        <div className="bg-white text-black rounded-xl shadow-lg p-6 max-w-md mx-auto mt-10">
          <form onSubmit={handleAuth} className="space-y-4">
            <h2 className="text-xl font-bold text-center">
              {isLogin ? "Login to Sell/Track Orders" : "Create an Account"}
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
        </div>
      )}

      {user && (
        <div className="text-center mt-10">
          <h2 className="text-xl">Hello {user.email} (Role: {role})</h2>
          <button
            onClick={handleLogout}
            className="mt-3 bg-red-500 px-4 py-2 rounded text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
                                                         }
