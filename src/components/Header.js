import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-green-700 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">PCE Shopping Mall</h1>
      <nav className="space-x-6">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <Link to="/about" className="hover:underline">
          About
        </Link>
      </nav>
    </header>
  );
}
