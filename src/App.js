// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OwnerLogin from "./pages/OwnerLogin";
import OwnerDashboard from "./pages/OwnerDashboard";
import AddProduct from "./pages/AddProduct";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<OwnerLogin />} />
        <Route
          path="/owner-dashboard"
          element={user ? <OwnerDashboard /> : <OwnerLogin />}
        />
        <Route
          path="/add-product"
          element={user ? <AddProduct /> : <OwnerLogin />}
        />
      </Routes>
    </Router>
  );
}

export default App;
