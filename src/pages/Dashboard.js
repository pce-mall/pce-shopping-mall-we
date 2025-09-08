import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

export default function Dashboard() {
  const [me, setMe] = useState(auth.currentUser);
  const [role, setRole] = useState("USER");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [items, setItems] = useState([]);

  // load role & products
  useEffect(() => {
    const load = async () => {
      const u = auth.currentUser;
      setMe(u);
      // fetch products
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);

  const addProduct = async (e) => {
    e.preventDefault();
    if (!name || !price) return;
    await addDoc(collection(db, "products"), {
      name, price: Number(price), owner: me?.email || "unknown",
      createdAt: new Date().toISOString(),
    });
    setName(""); setPrice("");
    // reload
    const snap = await getDocs(collection(db, "products"));
    setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  return (
    <div style={shell}>
      <header style={top}>
        <div>PCE Shopping Mall</div>
        <div>
          {me?.email} &nbsp;|&nbsp; <b>{role}</b>&nbsp; 
          <button onClick={()=>signOut(auth)} style={out}>Logout</button>
        </div>
      </header>

      <main style={{maxWidth:900, margin:"20px auto"}}>
        <section style={card}>
          <h3>Sell a product</h3>
          <form onSubmit={addProduct} style={{display:"grid", gridTemplateColumns:"2fr 1fr 120px", gap:10}}>
            <input style={inp} placeholder="Product name" value={name} onChange={e=>setName(e.target.value)} />
            <input style={inp} type="number" placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} />
            <button style={primary}>Add</button>
          </form>
        </section>

        <section style={card}>
          <h3>Available products</h3>
          {items.length===0 ? <p>No products yet.</p> : (
            <ul style={{listStyle:"none", padding:0, margin:0}}>
              {items.map(p=>(
                <li key={p.id} style={row}>
                  <span>{p.name}</span>
                  <span>₦{p.price}</span>
                  <small style={{opacity:.6}}>{p.owner}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

const shell = {fontFamily:"system-ui, Arial, sans-serif", background:"#f6f8fb", minHeight:"100vh"};
const top   = {display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"#111827", color:"#fff"};
const card  = {background:"#fff", padding:16, borderRadius:12, boxShadow:"0 8px 24px rgba(0,0,0,.06)", marginBottom:16};
const row   = {display:"grid", gridTemplateColumns:"1fr auto auto", gap:12, padding:"10px 0", borderBottom:"1px solid #eee"};
const inp   = {padding:10, border:"1px solid #cbd5e1", borderRadius:8, width:"100%"};
const primary = {background:"#2563eb", color:"#fff", border:0, borderRadius:8, padding:"10px 14px"};
const out   = {background:"#ef4444", color:"#fff", border:0, borderRadius:8, padding:"6px 10px", marginLeft:8};
