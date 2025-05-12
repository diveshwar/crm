"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Customer {
  id: number;
  name: string;
  email: string;
  country?: string;
  totalSpend?: number;
  visitCount?: number;
  lastVisitDate?: string;
  phone?: string;
  createdAt?: string;
}

interface Order {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderAmount, setOrderAmount] = useState("");
  const [orderStatus, setOrderStatus] = useState("completed");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSaving, setOrderSaving] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editOrderAmount, setEditOrderAmount] = useState("");
  const [editOrderStatus, setEditOrderStatus] = useState("completed");
  const [editOrderError, setEditOrderError] = useState<string | null>(null);
  const [editOrderSaving, setEditOrderSaving] = useState(false);

  useEffect(() => {
    async function fetchCustomer() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/api/customers/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setCustomer(data?.data?.customer || null);
        setOrders(data?.data?.orders || []);
      } catch {
        setError("Failed to fetch customer");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCustomer();
  }, [id]);

  const handleDelete = async () => {
    if (!customer) return;
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/customers/${customer.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/customers');
      } else {
        alert('Failed to delete customer');
      }
    } catch {
      alert('Failed to delete customer');
    }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSaving(true);
    setOrderError(null);
    try {
      const res = await fetch("http://localhost:3001/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: customer?.id, amount: orderAmount ? Number(orderAmount) : 0, status: orderStatus }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      setOrderAmount("");
      setOrderStatus("completed");
      setShowOrderForm(false);
      const res2 = await fetch(`http://localhost:3001/api/customers/${id}`);
      const data2 = await res2.json();
      setOrders(data2?.data?.orders || []);
    } catch {
      setOrderError("Failed to create order");
    } finally {
      setOrderSaving(false);
    }
  };

  // Edit order handler
  const handleEditOrder = (order: Order) => {
    setEditingOrderId(order.id);
    setEditOrderAmount(String(order.amount));
    setEditOrderStatus(order.status);
    setEditOrderError(null);
  };
  const handleEditOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrderId) return;
    setEditOrderSaving(true);
    setEditOrderError(null);
    try {
      const res = await fetch(`http://localhost:3001/api/orders/${editingOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: editOrderAmount ? Number(editOrderAmount) : 0, status: editOrderStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      setEditingOrderId(null);
      setEditOrderAmount("");
      setEditOrderStatus("completed");
      // Refresh orders
      const res2 = await fetch(`http://localhost:3001/api/customers/${id}`);
      const data2 = await res2.json();
      setOrders(data2?.data?.orders || []);
    } catch {
      setEditOrderError("Failed to update order");
    } finally {
      setEditOrderSaving(false);
    }
  };
  const handleEditOrderCancel = () => {
    setEditingOrderId(null);
    setEditOrderAmount("");
    setEditOrderStatus("completed");
    setEditOrderError(null);
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!customer) return <div className="p-8 text-gray-400">Customer not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => router.push(`/customers/${customer.id}/edit`)}
          className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
        >
          Edit Customer
        </button>
        <button
          onClick={() => router.push('/customers')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Back to List
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-1">{customer.name}</h1>
      <div className="mb-2 text-gray-500">{customer.email}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Customer Details</h2>
          <div className="mb-2"><span className="font-medium">Country:</span> {customer.country || '-'}</div>
          <div className="mb-2"><span className="font-medium">Total Spent:</span> {customer.totalSpend !== undefined ? `$${Number(customer.totalSpend).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}</div>
          <div className="mb-2"><span className="font-medium">Visit Count:</span> {customer.visitCount ?? '-'}</div>
          <div className="mb-2"><span className="font-medium">Last Visit:</span> {customer.lastVisitDate ? new Date(customer.lastVisitDate).toLocaleString() : 'Never'}</div>
          <div className="mb-2"><span className="font-medium">Phone:</span> {customer.phone || '-'}</div>
        </div>
        {/* Segments card can be added here if needed */}
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Order History</h2>
        <button
          className="mb-4 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
          onClick={() => setShowOrderForm(v => !v)}
        >
          {showOrderForm ? "Cancel" : "+ Add Order"}
        </button>
        {showOrderForm && (
          <form onSubmit={handleAddOrder} className="mb-4 flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-lg border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
              <input
                type="number"
                value={orderAmount}
                onChange={e => setOrderAmount(e.target.value)}
                className="px-3 py-2 border rounded-md w-32"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={orderStatus}
                onChange={e => setOrderStatus(e.target.value)}
                className="px-3 py-2 border rounded-md w-32"
                required
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={orderSaving}
              className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50"
            >
              {orderSaving ? "Saving..." : "Add Order"}
            </button>
            {orderError && <div className="text-red-500 ml-4">{orderError}</div>}
          </form>
        )}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-4 py-2 font-medium">{order.id}</td>
                    <td className="px-4 py-2">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                    <td className="px-4 py-2">
                      {editingOrderId === order.id ? (
                        <form onSubmit={handleEditOrderSubmit} className="flex gap-2 items-center">
                          <input
                            type="number"
                            value={editOrderAmount}
                            onChange={e => setEditOrderAmount(e.target.value)}
                            className="px-2 py-1 border rounded w-24"
                            min="0"
                            step="0.01"
                            required
                          />
                        </form>
                      ) : (
                        `$${Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      )}
                    </td>
                    <td className="px-4 py-2 capitalize">
                      {editingOrderId === order.id ? (
                        <form onSubmit={handleEditOrderSubmit} className="flex gap-2 items-center">
                          <select
                            value={editOrderStatus}
                            onChange={e => setEditOrderStatus(e.target.value)}
                            className="px-2 py-1 border rounded"
                            required
                          >
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            type="submit"
                            disabled={editOrderSaving}
                            className="px-2 py-1 bg-violet-600 text-white rounded hover:bg-violet-700 disabled:opacity-50"
                          >
                            {editOrderSaving ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={handleEditOrderCancel}
                            className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                          {editOrderError && <span className="text-red-500 ml-2">{editOrderError}</span>}
                        </form>
                      ) : (
                        <>
                          {order.status}
                          <button
                            type="button"
                            onClick={() => handleEditOrder(order)}
                            className="ml-2 text-blue-600 hover:underline text-xs"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Delete Customer
        </button>
      </div>
    </div>
  );
} 