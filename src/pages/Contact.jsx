export default function Contact(){
  return (
    <section className="section">
      <h2>Contact Us</h2>
      <p className="lead">Have questions or want to place a bulk order? Reach us anytime.</p>

      <div className="contact">
        <div className="block">
          <h3>WhatsApp</h3>
          <p>Tap below to chat with our team instantly.</p>
          <a className="btn btn-primary" href="https://wa.me/2347089724573" target="_blank" rel="noreferrer">Chat on WhatsApp</a>
        </div>
        <div className="block">
          <h3>Email</h3>
          <p>Prefer email? Send us your request.</p>
          <a className="btn btn-outline" href="mailto:pceshoppingmall@gmail.com">pceshoppingmall@gmail.com</a>
        </div>
      </div>
    </section>
  );
}
