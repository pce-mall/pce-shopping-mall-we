import React, { useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
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
  where 
} from "firebase/firestore";

// ✅ Use the Firebase exports
import { auth, db } from "./firebase";

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
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold">Welcome {user.email}</h2>
          <p className="text-gray-600">Role: {role}</p>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
