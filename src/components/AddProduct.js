// src/components/AddProduct.js
import React, { useState } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("⚠️ Please upload a product image");

    try {
      // Upload image
      const imageRef = ref(storage, `products/${image.name}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // Save product to Firestore
      await addDoc(collection(db, "products"), {
        name,
        price,
        imageUrl,
        createdAt: new Date(),
      });

      setName("");
      setPrice("");
      setImage(null);
      alert("✅ Product added successfully!");
    } catch (err) {
      console.error("Error adding product:", err);
      alert("❌ Failed to add product");
    }
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>➕ Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        /><br /><br />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        /><br /><br />
        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          accept="image/*"
        /><br /><br />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
