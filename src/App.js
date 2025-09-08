import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./AuthPage";
import Dashboard from "./pages/Dashboard";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export default function App() {
  const [ready, setReady] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setReady(true); });
    return unsub;
  }, []);

  if (!ready) return <p style={{padding:20}}>Loading…</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
        />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/auth"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
