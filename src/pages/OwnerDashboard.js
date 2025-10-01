import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function OwnerDashboard() {
  const [orders, setOrders] = useState([]);

  // Load orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const orderList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(orderList);
    };
    fetchOrders();
  }, []);

  // Mark Paid/Unpaid
  const togglePayment = async (id, currentStatus) => {
    const orderRef = doc(db, "orders", id);
    await updateDoc(orderRef, { status: currentStatus === "Paid" ? "Unpaid" : "Paid" });
    setOrders(
      orders.map((order) =>
        order.id === id
          ? { ...order, status: currentStatus === "Paid" ? "Unpaid" : "Paid" }
          : order
      )
    );
  };

  // Delete order
  const deleteOrder = async (id) => {
    await deleteDoc(doc(db, "orders", id));
    setOrders(orders.filter((order) => order.id !== id));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-green-700">👔 Owner Dashboard</h1>

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
          {orders.length > 0 ? (
            orders.map((order) => (
              <tr key={order.id} className="text-center">
                <td className="p-2 border border-gray-300">{order.id}</td>
                <td className="p-2 border border-gray-300">{order.customer}</td>
                <td className="p-2 border border-gray-300">{order.product}</td>
                <td className="p-2 border border-gray-300">₦{order.total?.toLocaleString()}</td>
                <td
                  className={`p-2 border border-gray-300 font-bold ${
                    order.status === "Paid" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {order.status}
                </td>
                <td className="p-2 border border-gray-300 space-x-2">
                  <button
                    onClick={() => togglePayment(order.id, order.status)}
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
            ))
          ) : (
            <tr>
              <td colSpan="6" className="p-4 text-gray-500">No orders yet...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
