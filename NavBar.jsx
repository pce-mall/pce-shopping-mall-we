import { NavLink } from "react-router-dom";

export default function NavBar(){
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">
          <span className="dot"></span>
          PCE Shopping Mall
        </div>
        <div className="menu">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/categories">Categories</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          <a className="cta" href="https://wa.me/2347089724573" target="_blank" rel="noreferrer">Shop Now</a>
        </div>
      </div>
    </nav>
  );
}
