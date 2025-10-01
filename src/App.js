import React, { useState } from "react";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [receipts, setReceipts] = useState([]);

  const products = [
    { id: 1, name: "iPhone 15", price: 1200000 },
    { id: 2, name: "Samsung Galaxy S24", price: 950000 },
    { id: 3, name: "Laptop HP", price: 750000 },
    { id: 4, name: "Nike Sneakers", price: 35000 },
  ];

  const addToCart = (product) => setCart([...cart, product]);

  const checkout = () => {
    if (cart.length === 0) return alert("Cart is empty!");
    setReceipts([...receipts, { items: cart, date: new Date().toLocaleString() }]);
    setCart([]);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "yellow" }}>🛍️ PCE Shopping Mall</h1>
      <p>Welcome, <strong>{user.email}</strong></p>
      <button onClick={handleLogout}>Logout</button>

      {/* Products */}
      <h2>📦 Products</h2>
      {products.map((p) => (
        <div key={p.id}>
          <strong>{p.name}</strong> - ₦{p.price.toLocaleString()}
          <button onClick={() => addToCart(p)}>Add to Cart</button>
        </div>
      ))}

      {/* Cart */}
      <h2>🛒 Cart</h2>
      {cart.length === 0 ? <p>No items in cart</p> : (
        <ul>
          {cart.map((item, i) => <li key={i}>{item.name} - ₦{item.price.toLocaleString()}</li>)}
        </ul>
      )}
      <p><strong>Total:</strong> ₦{total.toLocaleString()}</p>
      <button onClick={checkout}>Checkout</button>

      {/* Receipts */}
      <h2>🧾 My Receipts</h2>
      {receipts.length === 0 ? <p>No receipts yet</p> : (
        receipts.map((r, i) => (
          <div key={i} style={{ border: "1px solid white", padding: "10px", margin: "10px 0" }}>
            <p><strong>Date:</strong> {r.date}</p>
            <ul>
              {r.items.map((it, idx) => (
                <li key={idx}>{it.name} - ₦{it.price.toLocaleString()}</li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
