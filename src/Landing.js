import React, { useEffect, useMemo, useState } from "react";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";

/** ✅ PUT YOUR OWN FIREBASE CONFIG HERE (same one you use in Account.js) */
const firebaseConfig = {
  apiKey: "AIzaSyB31kOw965UN-2_Gi4pNjOBtVCIDuh3Ef0",
  authDomain: "pce-shopping-mall.firebaseapp.com",
  projectId: "pce-shopping-mall",
  storageBucket: "pce-shopping-mall.firebasestorage.app",
  messagingSenderId: "10570005342",
  appId: "1:10570005342:web:c30283e51d78a3b879adcf",
};

// initialize once (avoid re-init)
const app = (() => {
  try { return initializeApp(firebaseConfig); } catch { return undefined; }
})();
const db  = app ? getFirestore(app) : null;
const auth = app ? getAuth(app) : null;

export default function Landing() {
  const [user, setUser] = useState(null);
  const [all, setAll]   = useState([]);
  const [qText, setQ]   = useState("");

  useEffect(() => {
    if (!db) return;
    (async () => {
      const snap = await getDocs(query(collection(db, "products")));
      setAll(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, u => setUser(u || null));
  }, []);

  const filtered = useMemo(() => {
    const t = qText.trim().toLowerCase();
    if (!t) return all;
    return all.filter(p =>
      `${p.name ?? ""} ${p.owner ?? ""}`.toLowerCase().includes(t)
    );
  }, [qText, all]);

  const orderGuest = (p) => {
    // simple guest COD flow for now
    alert(`Order placed for "${p.name}" - ₦${p.price}. We will contact you on delivery. (Guest COD)`);
  };

  return (
    <>
      {/* TOP BAR */}
      <div className="topbar">
        <div className="container wrap row" style={{gap:16}}>
          <div className="brand">PCE <span style={{color:"var(--blue)"}}>Shopping</span> Mall</div>
          <div className="search">
            <span role="img" aria-label="search">🔍</span>
            <input placeholder="Search products, brands and categories"
                   value={qText} onChange={(e)=>setQ(e.target.value)} />
          </div>
          <div className="row">
            <div className="iconbtn" title="Account">👤</div>
            <div className="iconbtn" title="Cart">🛒</div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* CALL TO ORDER */}
        <div className="call">CALL TO ORDER: +2347089724573 • pceshoppingmall@gmail.com</div>

        {/* HERO */}
        <div className="hero card">
          <div>
            <div className="badge">BRAND DAY</div>
            <h1>Welcome to Paul Chuk Enterprises</h1>
            <p style={{opacity:.95,marginTop:6}}>
              Trusted & reliable online shopping ― buy & sell instantly.
            </p>
            <div className="row" style={{marginTop:12}}>
              <button className="btn">Shop now</button>
              <button className="btn" style={{background:"var(--green)"}}>Sell on PCE</button>
            </div>
          </div>
          <div style={{fontSize:64}}>🛍️</div>
        </div>

        {/* CATEGORY SHORTCUTS */}
        <div className="cats grid grid-4" style={{marginTop:16}}>
          {["Awoof deals","Clearance","Join PCE","Buy 2 Pay for 1"].map((t,i)=>(
            <div key={i} className="card">{t}</div>
          ))}
        </div>

        {/* PRODUCT GRID */}
        <div className="wrap">
          <h3 style={{margin:"18px 0 10px"}}>Available products</h3>
          {filtered.length === 0 ? (
            <div className="card" style={{padding:18}}>No products yet.</div>
          ) : (
            <div className="grid grid-3">
              {filtered.map(p => (
                <div key={p.id} className="card" style={{padding:14}}>
                  <div style={{fontWeight:800,marginBottom:6}}>{p.name}</div>
                  <div style={{color:"var(--green)",fontWeight:900,marginBottom:4}}>₦{p.price}</div>
                  <div style={{fontSize:12,color:"#6b7280"}}>Seller: {p.owner || "—"}</div>
                  <div className="row" style={{marginTop:12}}>
                    <button className="btn" onClick={()=>orderGuest(p)}>Buy (COD)</button>
                    {/* You can later wire real payment button here */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COOKIE BAR */}
      <div className="cookie card">
        <div>We use cookies to improve your experience. Read our privacy & cookie notice.</div>
        <button className="btn" onClick={e=>e.currentTarget.parentElement.remove()}>Accept cookies</button>
      </div>
    </>
  );
  }
