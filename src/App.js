import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function App() {
  const [me, setMe] = useState(null);       // {email, role}
  const [tab, setTab] = useState("login");  // login | signup | reset
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg,  setMsg]  = useState("");
  const [busy, setBusy] = useState(false);

  // When auth state changes, fetch role from Firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { setMe(null); return; }
      const snap = await getDoc(doc(db, "users", u.uid));
      const role = snap.exists() ? snap.data().role : "USER";
      setMe({ email: u.email, uid: u.uid, role });
    });
    return unsub;
  }, []);

  async function doLogin(e){
    e.preventDefault(); setBusy(true); setMsg("");
    try { await signInWithEmailAndPassword(auth, email.trim(), pass); }
    catch(err){ setMsg(err.message); }
    finally{ setBusy(false); }
  }

  async function doSignup(e){
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await setDoc(doc(db, "users", cred.user.uid), {
        email: cred.user.email, role: "USER", createdAt: new Date().toISOString(),
      });
      setMsg("Account created 🎉");
    } catch(err){ setMsg(err.message); }
    finally{ setBusy(false); }
  }

  async function doReset(e){
    e.preventDefault(); setBusy(true); setMsg("");
    try { await sendPasswordResetEmail(auth, email.trim()); setMsg("Reset email sent ✉️"); }
    catch(err){ setMsg(err.message); }
    finally{ setBusy(false); }
  }

  if (!me) {
    return (
      <div style={card}>
        <h1 style={{marginTop:0}}>PCE Shopping Mall</h1>
        <p>Login / Sign Up</p>

        <div style={tabs}>
          <button onClick={()=>setTab("login")}  style={t(tab==="login")}>Login</button>
          <button onClick={()=>setTab("signup")} style={t(tab==="signup")}>Sign Up</button>
          <button onClick={()=>setTab("reset")}  style={t(tab==="reset")}>Reset</button>
        </div>

        {tab==="login" && (
          <form onSubmit={doLogin} style={form}>
            <input style={inp} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input style={inp} type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} required />
            <button style={primary} disabled={busy}>{busy?"Please wait…":"Login"}</button>
          </form>
        )}
        {tab==="signup" && (
          <form onSubmit={doSignup} style={form}>
            <input style={inp} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input style={inp} type="password" placeholder="Password (min 6)" value={pass} onChange={e=>setPass(e.target.value)} required />
            <button style={primary} disabled={busy}>{busy?"Please wait…":"Create account"}</button>
          </form>
        )}
        {tab==="reset" && (
          <form onSubmit={doReset} style={form}>
            <input style={inp} type="email" placeholder="Your account email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <button style={primary} disabled={busy}>{busy?"Please wait…":"Send reset link"}</button>
          </form>
        )}

        {msg && <p style={{marginTop:10}}>{msg}</p>}
      </div>
    );
  }

  // Logged-in view
  return (
    <div style={card}>
      <h2>Welcome, {me.email}</h2>
      <p>Role: <b>{me.role}</b></p>
      <p style={{marginTop:10}}>Owner features appear when your role is OWNER.</p>
      <button onClick={()=>signOut(auth)} style={danger}>Logout</button>
    </div>
  );
}

/* tiny inline styles */
const card   = {maxWidth:420, margin:"40px auto", background:"#fff", padding:16, borderRadius:12,
                boxShadow:"0 8px 24px rgba(0,0,0,.08)", fontFamily:"system-ui, Arial, sans-serif", textAlign:"center"};
const tabs   = {display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12};
const form   = {display:"grid", gap:10, marginTop:8};
const inp    = {padding:10, borderRadius:8, border:"1px solid #cbd5e1", width:"100%"};
const primary= {background:"#2563eb", color:"#fff", border:0, borderRadius:8, padding:"10px 14px"};
const danger = {background:"#ef4444", color:"#fff", border:0, borderRadius:8, padding:"10px 14px"};
const t = (a)=>({background:a?"#0ea5e9":"#e2e8f0", color:a?"#fff":"#0f172a", border:0, borderRadius:8, padding:"10px 8px"});
