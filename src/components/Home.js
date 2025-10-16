// src/components/Home.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  const addToCart = (p) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({ id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("✅ Added to cart");
  };

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          background:
            "linear-gradient(90deg, rgba(11,95,255,.15), rgba(16,185,129,.15), rgba(0,0,0,.15))",
          padding: "28px 16px",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0 }}>
            Fresh deals. Easy checkout. Fast delivery.
          </h1>
          <p style={{ marginTop: 8, opacity: 0.9 }}>
            Pay by bank transfer to <b>FCMB 2005586667 — Paul Chuk Enterprise</b>
          </p>

          {/* Search visual (non-functional placeholder) */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 8,
              maxWidth: 520,
              background: "white",
              borderRadius: 10,
              padding: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            <input
              placeholder="Search products…"
              style={{
                flex: 1,
                border: "0",
                outline: "none",
                fontSize: 15,
              }}
            />
            <button
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: 0,
                background: "#0b5fff",
                color: "white",
                fontWeight: 700,
              }}
              onClick={() => alert("Search coming soon")}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: "18px 16px" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
            gap: 16,
          }}
        >
          {products.map((p) => (
            <article
              key={p.id}
              style={{
                background: "white",
                borderRadius: 14,
                overflow: "hidden",
                boxShadow: "0 8px 28px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ width: "100%", height: 160, background: "#f6f6f6" }}>
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                ) : null}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{p.name}</div>
                <div style={{ color: "#059669", fontWeight: 800, marginTop: 4 }}>
                  ₦{Number(p.price).toLocaleString()}
                </div>
                <button
                  onClick={() => addToCart(p)}
                  style={{
                    width: "100%",
                    marginTop: 10,
                    padding: 10,
                    background:
                      "linear-gradient(90deg,#0b5fff,#10b981,#0b0b0b)",
                    color: "#fff",
                    border: 0,
                    borderRadius: 10,
                    fontWeight: 700,
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>

        {products.length === 0 && (
          <p style={{ maxWidth: 1100, margin: "18px auto", opacity: 0.8 }}>
            No products yet. (Owner can add items in the dashboard.)
          </p>
        )}
      </section>
    </main>
  );
}
