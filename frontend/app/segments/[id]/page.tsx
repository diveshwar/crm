"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Segment {
  id: number;
  name: string;
  description?: string;
  rules: {
    conditions: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    operator: 'AND' | 'OR';
  };
  createdAt?: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  country?: string;
  totalSpend?: number;
  visitCount?: number;
  phone?: string;
}

export default function SegmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [segment, setSegment] = useState<Segment | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSegment() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/api/segments/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setSegment(data?.data?.segment || null);
        setCustomers(data?.data?.customers || []);
      } catch {
        setError("Failed to fetch segment");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSegment();
  }, [id]);

  const formatRule = (condition: Segment['rules']['conditions'][0]) => {
    const { field, operator, value } = condition;
    return `${field} ${operator} ${value}`;
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!segment) return <div className="p-8 text-gray-400">Segment not found.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => router.push(`/segments/${id}/edit`)}
          className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
        >
          Edit Segment
        </button>
        <button
          onClick={() => router.push('/segments')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Back to List
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-2">{segment.name}</h1>
      <div className="mb-2 text-gray-500">Created At: {segment.createdAt ? new Date(segment.createdAt).toLocaleString() : "-"}</div>
      <div className="mb-4 text-gray-700">{segment.description}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Segment Information</h2>
          <div className="mb-2"><span className="font-medium">Description:</span> {segment.description || '-'}</div>
          <div className="mb-2"><span className="font-medium">Created At:</span> {segment.createdAt ? new Date(segment.createdAt).toLocaleString() : '-'}</div>
          <div className="mb-2"><span className="font-medium">Total Customers:</span> {customers.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Segment Criteria</h2>
          <pre className="bg-gray-50 rounded p-3 text-sm overflow-x-auto">{JSON.stringify(segment.rules, null, 2)}</pre>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Customers in Segment</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Country</th>
                <th className="px-4 py-2 text-left">Total Spent</th>
                <th className="px-4 py-2 text-left">Visit Count</th>
                <th className="px-4 py-2 text-left">Phone</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No customers found in this segment.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-b">
                    <td className="px-4 py-2 font-medium">
                      <a href={`/customers/${c.id}`} className="text-violet-600 hover:underline">{c.name}</a>
                    </td>
                    <td className="px-4 py-2">{c.email}</td>
                    <td className="px-4 py-2">{c.country || '-'}</td>
                    <td className="px-4 py-2">{c.totalSpend !== undefined ? `$${Number(c.totalSpend).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}</td>
                    <td className="px-4 py-2">{c.visitCount ?? '-'}</td>
                    <td className="px-4 py-2">{c.phone || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => router.push(`/segments/${id}/edit`)}
          className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
        >
          Edit Segment
        </button>
        <button
          onClick={() => {
            if (confirm("Are you sure you want to delete this segment?")) {
              fetch(`http://localhost:3001/api/segments/${id}`, {
                method: 'DELETE',
              }).then(() => {
                router.push('/segments');
              }).catch(() => {
                alert('Failed to delete segment');
              });
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Delete Segment
        </button>
      </div>
    </div>
  );
} 