import Hero from "../components/Hero";
import CategoryCard from "../components/CategoryCard";

export default function Home(){
  return (
    <>
      <Hero />
      <section className="section">
        <h2>Why choose PCE?</h2>
        <p className="lead">We make shopping effortless with secure payments, fast delivery and global support.</p>
        <div className="grid">
          <div className="card">
            <h3>Global Payments</h3>
            <p>Pay from any country with trusted gateways.</p>
          </div>
          <div className="card">
            <h3>Fast Delivery</h3>
            <p>We ship swiftly and safely to your location.</p>
          </div>
          <div className="card">
            <h3>Secure Checkout</h3>
            <p>Buyer protection & encrypted transactions.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Popular Categories</h2>
        <div className="grid">
          <CategoryCard icon="👕" title="Fashion" text="Trendy wears & accessories." />
          <CategoryCard icon="📱" title="Electronics" text="Phones, gadgets & computers." />
          <CategoryCard icon="💄" title="Beauty" text="Skincare, makeup & more." />
          <CategoryCard icon="🏠" title="Home & Kitchen" text="Appliances & essentials." />
          <CategoryCard icon="🧒" title="Baby" text="Care items & toys." />
          <CategoryCard icon="🎮" title="Gaming" text="Consoles & accessories." />
        </div>
      </section>
    </>
  );
}
