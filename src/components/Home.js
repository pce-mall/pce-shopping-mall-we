import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(product);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("✅ Added to cart!");
  };

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((p) => (
        <div key={p.id} className="border rounded-lg p-4 shadow-lg">
          <img src={p.imageUrl} alt={p.name} className="h-40 w-full object-cover rounded" />
          <h2 className="text-lg font-semibold mt-2">{p.name}</h2>
          <p className="text-green-700 font-bold">₦{p.price}</p>
          <button
            onClick={() => addToCart(p)}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded w-full"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
}
