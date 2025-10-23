export default function Home() {
  return (
    <section className="home">
      <div className="hero">
        <div className="overlay">
          <h1>Welcome to <span>PCE Shopping Mall</span></h1>
          <p>Shop Smart. Earn Easy. Worldwide Delivery.</p>
          <a href="https://wa.me/2347089724573" className="button">
            Shop Now
          </a>
        </div>
      </div>

      {/* ==== CUSTOM AREA YOU CAN EDIT ANYTIME ==== */}
      <div className="custom-section">
        <h2>🛍 Latest Offers</h2>
        <p>Add your latest products, promotions, or announcements here!</p>
      </div>
      {/* ========================================== */}
    </section>
  );
}
