// src/components/AddProduct.js
import React, { useState } from "react";
import { storage, db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select an image");
    if (!name || !price) return alert("Name and price are required");

    try {
      setBusy(true);
      const path = `products/${Date.now()}_${file.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file);
      const imageUrl = await getDownloadURL(fileRef);

      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        description: desc,
        imageUrl,
        createdAt: serverTimestamp(),
      });

      setName(""); setPrice(""); setDesc(""); setFile(null); setPreview("");
      alert("✅ Product added");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check firebase.js & Storage rules.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "24px auto", padding: "0 16px" }}>
      <h2 style={{ fontWeight: 800 }}>📦 Add Product</h2>
      <form onSubmit={submit}>
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Product name" required style={{width:"100%",padding:10,marginTop:8}} />
        <input type="number" value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Price (₦)" required style={{width:"100%",padding:10,marginTop:8}} />
        <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} rows={3} placeholder="Short description (optional)" style={{width:"100%",padding:10,marginTop:8}} />
        <input type="file" accept="image/*" onChange={onFile} style={{marginTop:8}} />
        {preview && (
          <img src={preview} alt="preview" style={{width:"100%",height:220,objectFit:"cover",borderRadius:10,marginTop:8,background:"#f3f4f6"}} />
        )}
        <button type="submit" disabled={busy}
          style={{width:"100%",marginTop:12,padding:10,border:0,borderRadius:10,color:"#fff",fontWeight:800,background:"linear-gradient(90deg,#0b5fff,#10b981,#0b0b0b)"}}
        >
          {busy ? "Uploading…" : "Add Product"}
        </button>
      </form>
    </div>
  );
}
