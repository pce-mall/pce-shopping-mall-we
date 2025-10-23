export default function Footer(){
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>© {new Date().getFullYear()} PCE Shopping Mall — pceshoppingmall.it.com</div>
        <div style={{display:"flex",gap:"12px"}}>
          <a href="mailto:pceshoppingmall@gmail.com">Email</a>
          <a href="https://wa.me/2347089724573" target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="https://tiktok.com/@onlyoneinvestorpaul" target="_blank" rel="noreferrer">TikTok</a>
        </div>
      </div>
    </footer>
  );
}
