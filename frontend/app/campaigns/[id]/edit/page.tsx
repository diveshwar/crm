"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Campaign {
  id: number;
  name: string;
  description?: string;
  status: string;
  scheduledAt?: string;
  messageTemplate?: string;
  segmentRules?: any;
}

export default function EditCampaignPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchCampaign() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/api/campaigns/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setCampaign(data?.data?.campaign || null);
      } catch {
        setError("Failed to fetch campaign");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCampaign();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    setSaving(true);
    try {
      const res = await fetch(`http://localhost:3001/api/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaign),
      });

      if (!res.ok) throw new Error('Failed to update campaign');
      
      router.push('/campaigns');
    } catch (err) {
      setError('Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!campaign) return <div className="p-8 text-gray-400">Campaign not found.</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={() => router.back()} className="mb-4 text-violet-600 hover:underline">&larr; Back</button>
      <h1 className="text-2xl font-bold mb-6">Edit Campaign</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={campaign.name}
            onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={campaign.description || ''}
            onChange={(e) => setCampaign({ ...campaign, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message Template</label>
          <textarea
            value={campaign.messageTemplate || ''}
            onChange={(e) => setCampaign({ ...campaign, messageTemplate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={5}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled At</label>
          <input
            type="datetime-local"
            value={campaign.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => setCampaign({ ...campaign, scheduledAt: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
} 