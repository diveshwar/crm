"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditSegmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [form, setForm] = useState({
    name: '',
    description: '',
    rules: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSegment() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/api/segments/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        const segment = data?.data?.segment;
        setForm({
          name: segment?.name || '',
          description: segment?.description || '',
          rules: segment?.rules ? JSON.stringify(segment.rules, null, 2) : '',
        });
      } catch {
        setError("Failed to fetch segment");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchSegment();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    let rulesObj = {};
    try {
      rulesObj = form.rules ? JSON.parse(form.rules) : {};
    } catch {
      setError('Rules must be valid JSON');
      setSaving(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3001/api/segments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, description: form.description, rules: rulesObj }),
      });
      if (!res.ok) throw new Error("Failed to update segment");
      router.push(`/segments/${id}`);
    } catch {
      setError("Failed to update segment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <button onClick={() => router.back()} className="mb-4 text-violet-600 hover:underline">&larr; Back</button>
      <h1 className="text-2xl font-bold mb-6">Edit Segment</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rules (JSON)</label>
          <textarea
            name="rules"
            value={form.rules}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md font-mono"
            rows={4}
            placeholder='e.g. { "field": "totalSpend", "operator": "gt", "value": 100 }'
            required
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 