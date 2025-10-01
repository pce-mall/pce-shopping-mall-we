// src/App.js
import React, { useState } from "react";
import AdminLogin from "./components/AdminLogin";
import AddProduct from "./components/AddProduct";
import ProductList from "./components/ProductList";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛍️ PCE Shopping Mall</h1>
      {!isAdmin ? (
        <>
          <ProductList />
          <AdminLogin setIsAdmin={setIsAdmin} />
        </>
      ) : (
        <AddProduct />
      )}
    </div>
  );
}

export default App;
