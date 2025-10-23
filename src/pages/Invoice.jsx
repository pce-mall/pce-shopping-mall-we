import { useContext } from "react";
import { CartContext } from "../context/CartContext";

export default function Invoice() {
  const { cart, total } = useContext(CartContext);

  return (
    <section className="container">
      <h2>Invoice</h2>
      <table>
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.qty}</td>
              <td>₦{(item.price * item.qty).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Total: ₦{total.toLocaleString()}</h3>
      <button onClick={() => window.print()}>🖨 Print Invoice</button>
    </section>
  );
}
