export default function Hero(){
  return (
    <section className="hero">
      <div>
        <div className="kicker">Shop Smart. Earn Easy.</div>
        <h1 className="h1">Everything you love — Fashion, Electronics & Beauty — delivered worldwide.</h1>
        <p className="sub">Secure checkout • Fast delivery • Global payments • Pre-order & cart options</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="https://wa.me/2347089724573" target="_blank" rel="noreferrer">Shop on WhatsApp</a>
          <a className="btn btn-outline" href="/categories">Browse Categories</a>
        </div>
        <div className="badges">
          <span className="badge">Trusted Store</span>
          <span className="badge">Worldwide Delivery</span>
          <span className="badge">Secure Payments</span>
        </div>
      </div>
      <div>
        <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop" alt="Shopping illustration" />
      </div>
    </section>
  );
}
