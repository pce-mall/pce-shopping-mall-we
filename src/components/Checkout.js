import React from "react";

export default function Checkout() {
  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Checkout</h1>

      <p className="mb-4 text-lg">
        Thank you for shopping with <strong>PCE Shopping Mall</strong>. 
        Please make payment to the bank details below to complete your order:
      </p>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">💳 Bank Transfer Details</h2>
        <p><strong>Bank Name:</strong> First City Monument Bank (FCMB)</p>
        <p><strong>Account Number:</strong> 2005586667</p>
        <p><strong>Account Name:</strong> Paul Chuk Enterprise</p>
      </div>

      <p className="text-gray-700">
        After making payment, please send your proof of payment 
        (screenshot or receipt) to our WhatsApp:{" "}
        <a 
          href="https://wa.me/2347089724573"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 font-bold underline"
        >
          +234 708 972 4573
        </a>
      </p>
    </div>
  );
}
