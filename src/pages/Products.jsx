import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { products } from "../data/products";

export default function Products() {
  const { addToCart } = useContext(CartContext);

  return (
    <section className="container">
      <h2>Our Products</h2>
      <div className="grid">
        {products.map((p) => (
          <div key={p.id} className="card">
            <img src={p.image} alt={p.name} />
            <h3>{p.name}</h3>
            <p>₦{p.price.toLocaleString()}</p>
            <button onClick={() => addToCart(p)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </section>
  );
}
