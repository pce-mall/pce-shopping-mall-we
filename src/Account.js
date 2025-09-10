import React, { useState, useEffect } from "react"; import { getFirestore, collection, getDocs } from "firebase/firestore"; import { initializeApp } from "firebase/app";

// Firebase config const firebaseConfig = { apiKey: "AIzaSyB31kOw965UN-2_Gi4pNjOBtVCIDuh3Ef0", authDomain: "pce-shopping-mall.firebaseapp.com", projectId: "pce-shopping-mall", storageBucket: "pce-shopping-mall.firebasestorage.app", messagingSenderId: "10570005342", appId: "1:10570005342:web:c30283e51d78a3b879adcf", };

const app = initializeApp(firebaseConfig); const db = getFirestore(app);

export default function LandingPage() { const [products, setProducts] = useState([]);

useEffect(() => { const fetchProducts = async () => { const querySnapshot = await getDocs(collection(db, "products")); setProducts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))); }; fetchProducts(); }, []);

return ( <div className="min-h-screen bg-gradient-to-r from-green-500 to-blue-600 text-white p-6"> {/* Welcome Section */} <div className="text-center py-10"> <h1 className="text-4xl font-extrabold mb-4">Welcome to Paul Chuk Enterprises</h1> <p className="text-lg">Your trusted online shopping mall – browse and purchase products instantly.</p> </div>

{/* Product Preview Section */}
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
            <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Purchase
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>

  {/* Footer */}
  <div className="text-center mt-10">
    <p className="text-sm">© {new Date().getFullYear()} Paul Chuk Enterprises. All rights reserved.</p>
  </div>
</div>

); }

