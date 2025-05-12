'use client';

import { useState, useEffect } from 'react';

interface Segment {
  id: number;
  name: string;
  rules: any;
}

export default function CampaignForm({ onSuccess, onClose }: { onSuccess?: () => void; onClose?: () => void }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    segmentId: '',
    messageTemplate: '',
    scheduledAt: '',
  });
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [segmentsLoading, setSegmentsLoading] = useState(true);

  useEffect(() => {
    async function fetchSegments() {
      setSegmentsLoading(true);
      try {
        const res = await fetch('http://localhost:3001/api/segments', {
          headers: {
            Authorization: typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
          }
        });
        const data = await res.json();
        setSegments(data?.data?.segments || []);
      } catch {
        setSegments([]);
      } finally {
        setSegmentsLoading(false);
      }
    }
    fetchSegments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    const selectedSegment = segments.find(s => String(s.id) === String(form.segmentId));
    try {
      const res = await fetch('http://localhost:3001/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          segmentRules: selectedSegment ? selectedSegment.rules : {},
          messageTemplate: form.messageTemplate,
          scheduledAt: form.scheduledAt || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Campaign created successfully!');
        setForm({ name: '', description: '', segmentId: '', messageTemplate: '', scheduledAt: '' });
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        setError(data.message || 'Failed to create campaign');
      }
    } catch (err) {
      setError('Failed to create campaign');
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
        <label className="block font-medium mb-1">Target Segment</label>
        <select
          name="segmentId"
          value={form.segmentId}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          required
          disabled={segmentsLoading}
        >
          <option value="">{segmentsLoading ? 'Loading segments...' : 'Select a segment'}</option>
          {segments.map((segment) => (
            <option key={segment.id} value={segment.id}>{segment.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Message Template</label>
        <textarea
          name="messageTemplate"
          value={form.messageTemplate}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          rows={3}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Schedule (optional)</label>
        <input
          type="datetime-local"
          name="scheduledAt"
          value={form.scheduledAt}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
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
          {loading ? 'Creating...' : 'Create Campaign'}
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