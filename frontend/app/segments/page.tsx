"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSegments() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3001/api/segments");
        const data = await res.json();
        setSegments(data?.data?.segments || []);
      } catch (err) {
        setError("Failed to fetch segments");
      } finally {
        setLoading(false);
      }
    }
    fetchSegments();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this segment?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/segments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSegments((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert('Failed to delete segment');
      }
    } catch {
      alert('Failed to delete segment');
    }
  };

  const formatRules = (rules: Segment['rules']) => {
    if (!rules?.conditions?.length) return 'No rules';
    
    return rules.conditions.map(condition => {
      const { field, operator, value } = condition;
      return `${field} ${operator} ${value}`;
    }).join(` ${rules.operator} `);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Segments</h1>
        <Link href="/segments/create" className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded font-semibold transition">
          + Create Segment
        </Link>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Rules</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
            ) : segments.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No segments found.</td></tr>
            ) : (
              segments.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="px-4 py-2 font-medium">
                    <Link href={`/segments/${s.id}`} className="text-violet-600 hover:underline">{s.name}</Link>
                  </td>
                  <td className="px-4 py-2">{s.description || "-"}</td>
                  <td className="px-4 py-2 max-w-md truncate" title={formatRules(s.rules)}>
                    {formatRules(s.rules)}
                  </td>
                  <td className="px-4 py-2">{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Link href={`/segments/${s.id}`} className="text-violet-600 hover:underline">View</Link>
                    <Link href={`/segments/${s.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 