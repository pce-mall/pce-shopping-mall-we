import React from "react";

export default function Invoice() {
  return (
    <div className="p-6 max-w-4xl mx-auto text-gray-900 border rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-green-700">Invoice</h1>

      <p className="mb-4 text-lg">
        This is your official invoice from <strong>PCE Shopping Mall</strong>.
      </p>

      {/* Customer Order Details (example placeholder) */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">🛍 Order Summary</h2>
        <p>Product Name: Example Item</p>
        <p>Quantity: 1</p>
        <p>Total: ₦25,000</p>
      </div>

      {/* Bank Details Section */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">💳 Payment Details</h2>
        <p><strong>Bank Name:</strong> First City Monument Bank (FCMB)</p>
        <p><strong>Account Number:</strong> 2005586667</p>
        <p><strong>Account Name:</strong> Paul Chuk Enterprise</p>
      </div>

      <p className="text-gray-700">
        Kindly make your payment and share your proof of payment with us via WhatsApp:{" "}
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
