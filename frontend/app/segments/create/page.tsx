"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSegmentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    rules: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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
      const res = await fetch("http://localhost:3001/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description, rules: rulesObj }),
      });
      if (!res.ok) throw new Error("Failed to create segment");
      router.push("/segments");
    } catch {
      setError("Failed to create segment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <button onClick={() => router.back()} className="mb-4 text-violet-600 hover:underline">&larr; Back</button>
      <h1 className="text-2xl font-bold mb-6">Create Segment</h1>
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
            {saving ? "Saving..." : "Create Segment"}
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