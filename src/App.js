// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function Ping() {
  return (
    <div style={{ padding: 24 }}>
      <h1>✅ App is Alive</h1>
      <p>Routing works. Now wire your real pages.</p>
      <p><Link to="/login">Go to Owner Login</Link></p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Ping />} />
        <Route path="*" element={<Ping />} />
      </Routes>
    </Router>
  );
}

export default App;
