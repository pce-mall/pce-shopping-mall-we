import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart")) || []);
  }, []);

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, item) => sum + Number(item.price), 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛒 Your Cart</h1>
      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <div>
          {cart.map((item, i) => (
            <div key={i} className="flex justify-between items-center border-b py-2">
              <span>{item.name} - ₦{item.price}</span>
              <button
                onClick={() => removeFromCart(i)}
                className="text-red-600 font-bold"
              >
                ❌ Remove
              </button>
            </div>
          ))}
          <h2 className="text-xl font-bold mt-4">Total: ₦{total}</h2>
          <Link to="/checkout">
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
              Proceed to Checkout
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
