import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Cart() {
  const { cart, removeFromCart, clearCart, total } = useContext(CartContext);

  if (!cart.length)
    return (
      <section className="container">
        <h2>Your Cart is Empty</h2>
        <Link to="/products" className="button">Shop Now</Link>
      </section>
    );

  return (
    <section className="container">
      <h2>Your Cart</h2>
      {cart.map((item) => (
        <div key={item.id} className="cart-item">
          <img src={item.image} alt={item.name} />
          <div>
            <h3>{item.name}</h3>
            <p>₦{item.price.toLocaleString()}</p>
            <p>Qty: {item.qty}</p>
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </div>
        </div>
      ))}
      <h3>Total: ₦{total.toLocaleString()}</h3>
      <div style={{ marginTop: "20px" }}>
        <Link to="/invoice" className="button">Generate Invoice</Link>
        <button onClick={clearCart} className="button danger">Clear Cart</button>
      </div>
    </section>
  );
}
