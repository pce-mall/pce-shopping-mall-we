import React, { useState } from "react";

export default function OwnerDashboard() {
  // Dummy orders (later this will connect to Firebase)
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: "John Doe",
      product: "iPhone 15 Pro",
      total: 1200000,
      status: "Unpaid",
    },
    {
      id: 2,
      customer: "Mary Jane",
      product: "Samsung TV",
      total: 450000,
      status: "Paid",
    },
  ]);

  // Toggle Paid/Unpaid
  const togglePayment = (id) => {
    setOrders(
      orders.map((order) =>
        order.id === id
          ? { ...order, status: order.status === "Paid" ? "Unpaid" : "Paid" }
          : order
      )
    );
  };

  // Delete an order
  const deleteOrder = (id) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-green-700">
        👔 Owner Dashboard
      </h1>

      <div className="mb-6 bg-gray-100 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">💳 Bank Details</h2>
        <p><strong>Bank Name:</strong> First City Monument Bank (FCMB)</p>
        <p><strong>Account Number:</strong> 2005586667</p>
        <p><strong>Account Name:</strong> Paul Chuk Enterprise</p>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-green-600 text-white">
            <th className="p-2 border border-gray-300">Order ID</th>
            <th className="p-2 border border-gray-300">Customer</th>
            <th className="p-2 border border-gray-300">Product</th>
            <th className="p-2 border border-gray-300">Total (₦)</th>
            <th className="p-2 border border-gray-300">Status</th>
            <th className="p-2 border border-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="text-center">
              <td className="p-2 border border-gray-300">{order.id}</td>
              <td className="p-2 border border-gray-300">{order.customer}</td>
              <td className="p-2 border border-gray-300">{order.product}</td>
              <td className="p-2 border border-gray-300">
                ₦{order.total.toLocaleString()}
              </td>
              <td
                className={`p-2 border border-gray-300 font-bold ${
                  order.status === "Paid" ? "text-green-600" : "text-red-600"
                }`}
              >
                {order.status}
              </td>
              <td className="p-2 border border-gray-300 space-x-2">
                <button
                  onClick={() => togglePayment(order.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  {order.status === "Paid" ? "Mark Unpaid" : "Mark Paid"}
                </button>
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  }
