import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function Checkout() {
  const { cart, total, clearCart } = useContext(CartContext);

  if (!cart.length)
    return (
      <section className="container">
        <h2>Your cart is empty.</h2>
      </section>
    );

  const handlePayment = () => {
    alert(
      `Payment Instructions:\n\nSend ₦${total.toLocaleString()} to:\n\nAccount Name: Paul Chuk Enterprise\nAccount Number: 2005586667\nBank: FCMB\n\nOnce you have paid, please send your payment receipt via WhatsApp for confirmation.`
    );
    clearCart();
  };

  return (
    <section className="container">
      <h2>Checkout</h2>
      <p>Review your order and proceed to payment.</p>

      <ul>
        {cart.map((item) => (
          <li key={item.id}>
            {item.name} × {item.qty} — ₦{(item.price * item.qty).toLocaleString()}
          </li>
        ))}
      </ul>

      <h3>Total: ₦{total.toLocaleString()}</h3>

      <button onClick={handlePayment} className="button">
        Proceed to Payment
      </button>

      <div style={{ marginTop: "20px" }}>
        <a
          href="https://wa.me/2347089724573?text=Hello%20PCE%20Shopping%20Mall!%20I%20have%20completed%20my%20payment%20for%20order%20totaling%20₦%20"
          target="_blank"
          rel="noreferrer"
          className="button"
          style={{ background: '#25D366', marginLeft: '10px' }}
        >
          Send Receipt on WhatsApp
        </a>
      </div>
    </section>
  );
}
