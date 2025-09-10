import React from "react";
import ErrorBoundary from "./ErrorBoundary";
import Account from "./Account";   // Or whatever your main page is

export default function App() {
  return (
    <ErrorBoundary>
      <Account />
    </ErrorBoundary>
  );
}
