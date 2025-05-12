'use client';

import { useState } from 'react';

export default function SegmentForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose?: () => void }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    rules: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    let rulesObj = {};
    try {
      rulesObj = form.rules ? JSON.parse(form.rules) : {};
    } catch {
      setError('Rules must be valid JSON');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          rules: rulesObj,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Segment created successfully!');
        setForm({ name: '', description: '', rules: '' });
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        setError(data.message || 'Failed to create segment');
      }
    } catch (err) {
      setError('Failed to create segment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          rows={2}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Rules (JSON)</label>
        <textarea
          name="rules"
          value={form.rules}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 font-mono"
          rows={4}
          placeholder='e.g. { "field": "totalSpend", "operator": "gt", "value": 100 }'
          required
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded font-semibold transition"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Segment'}
        </button>
        {onClose && (
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded font-semibold transition"
            onClick={onClose}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
} 