import React, { useState, useEffect } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "./firebase";

export default function Landing() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, "products"));
      const snap = await getDocs(q);
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchProducts();
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #007bff, #28a745)",
        color: "white",
        textAlign: "center",
        padding: "40px 20px",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
        Welcome to Paul Chuk Enterprises
      </h1>
      <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
        Buy and sell with ease – just like Jumia!
      </p>

      {/* 🔹 Search Bar */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            outline: "none",
            fontSize: "1rem",
          }}
        />
      </div>

      {/* 🔹 Product Grid */}
      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.description.toLowerCase().includes(search.toLowerCase())
          )
          .map((p) => (
            <div
              key={p.id}
              style={{
                background: "white",
                color: "black",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <img
                src={p.imageUrl}
                alt={p.name}
                style={{ width: "100%", borderRadius: "8px", height: "150px", objectFit: "cover" }}
              />
              <h3>{p.name}</h3>
              <p>₦{p.price}</p>
              <p style={{ fontSize: "0.9rem", color: "#555" }}>{p.description}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
