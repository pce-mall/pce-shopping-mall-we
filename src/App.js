import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import About from "./pages/About";

function Home() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-4xl font-bold text-green-700 mb-4">
        Welcome to PCE Shopping Mall
      </h1>
      <p className="text-lg text-gray-700">
        Your one-stop shop for fashion, electronics, food, and more 🚀
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
