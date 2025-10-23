export default function Home() {
  return (
    <section className="home">
      <div className="hero">
        <div className="overlay">
          <h1>
            Welcome to <span>PCE Shopping Mall</span>
          </h1>
          <p>Shop Smart. Earn Easy. Worldwide Delivery.</p>
          <a
            href="https://wa.me/2347089724573"
            className="button"
            target="_blank"
            rel="noreferrer"
          >
            Shop Now
          </a>
        </div>
      </div>

      {/* ==== YOUR EDITABLE AREA ==== */}
      <div className="custom-section">
        <h2>🛍 Add Your Content Here</h2>
        <p>
          You can add your new offers, latest products, announcements, or
          anything else here — just edit this text directly in
          <strong> Home.jsx</strong>.
        </p>
      </div>
      {/* ============================ */}
    </section>
  );
}
