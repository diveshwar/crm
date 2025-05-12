"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Campaign {
  id: number;
  name: string;
  status: string;
  scheduledAt?: string;
  createdAt?: string;
  segmentId?: number;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3001/api/campaigns");
        const data = await res.json();
        setCampaigns(data?.data?.campaigns || []);
      } catch (err) {
        setError("Failed to fetch campaigns");
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/campaigns/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert('Failed to delete campaign');
      }
    } catch {
      alert('Failed to delete campaign');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link href="/campaigns/create" className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded font-semibold transition">
          + Create Campaign
        </Link>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Scheduled At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">No campaigns found.</td></tr>
            ) : (
              campaigns.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2 capitalize">{c.status}</td>
                  <td className="px-4 py-2">{c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : "-"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Link href={`/campaigns/${c.id}`} className="text-violet-600 hover:underline">View</Link>
                    <Link href={`/campaigns/${c.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Delete</button>
                    {c.segmentId && (
                      <Link href={`/segments/${c.segmentId}`} className="text-green-600 hover:underline">Segment</Link>
                    )}
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