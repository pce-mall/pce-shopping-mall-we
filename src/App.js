import React from "react";
import Landing from "./Landing";
import Account from "./Account";

export default function App(){
  return (
    <>
      <Landing />
      {/* seller/user area below the storefront */}
      <div style={{margin:"32px auto",maxWidth:1100,padding:"0 16px"}}>
        <Account />
      </div>
    </>
  );
}
