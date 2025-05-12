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
  phone?: string;
}

interface MessageLogEntry {
  customer: Customer | null;
  message: string;
  status: string;
  timestamp: string;
}

interface Campaign {
  id: number;
  name: string;
  description?: string;
  status: string;
  scheduledAt?: string;
  createdAt?: string;
  messageTemplate?: string;
  segmentId?: number;
}

interface Stats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [messageLog, setMessageLog] = useState<MessageLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaign() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3001/api/campaigns/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setCampaign(data?.data?.campaign || null);
        setStats(data?.data?.stats || null);
        setMessageLog(data?.data?.messageLog || []);
      } catch {
        setError("Failed to fetch campaign");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCampaign();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!campaign) return <div className="p-8 text-gray-400">Campaign not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="mb-4 text-violet-600 hover:underline">&larr; Back</button>
      <h1 className="text-2xl font-bold mb-1">{campaign.name}</h1>
      <div className="mb-2 text-gray-500">Status: <span className="capitalize">{campaign.status}</span></div>
      <div className="mb-2 text-gray-500">Scheduled At: {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : "-"}</div>
      <div className="mb-2 text-gray-500">Created At: {campaign.createdAt ? new Date(campaign.createdAt).toLocaleString() : "-"}</div>
      <div className="mb-4 text-gray-700">{campaign.description}</div>
      {campaign.segmentId && (
        <div className="mb-4">
          <span className="font-medium">Target Segment: </span>
          <a href={`/segments/${campaign.segmentId}`} className="text-violet-600 hover:underline">View Segment</a>
        </div>
      )}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded shadow p-4 text-center">
            <div className="text-lg font-bold">{stats?.total ?? '-'}</div>
            <div className="text-gray-500">Total</div>
          </div>
          <div className="bg-white rounded shadow p-4 text-center">
            <div className="text-lg font-bold text-green-600">{stats?.delivered ?? '-'}</div>
            <div className="text-gray-500">Delivered</div>
          </div>
          <div className="bg-white rounded shadow p-4 text-center">
            <div className="text-lg font-bold text-yellow-600">{stats?.pending ?? '-'}</div>
            <div className="text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded shadow p-4 text-center">
            <div className="text-lg font-bold text-red-600">{stats?.failed ?? '-'}</div>
            <div className="text-gray-500">Failed</div>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="font-semibold mb-1">Message Template:</div>
        <div className="bg-gray-100 rounded p-3 font-mono text-sm whitespace-pre-wrap">{campaign.messageTemplate}</div>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Message Log</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Message</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {messageLog.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No messages found.</td></tr>
              ) : (
                messageLog.map((log, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-4 py-2 font-medium">{log.customer?.name || '-'}</td>
                    <td className="px-4 py-2">{log.customer?.email || '-'}</td>
                    <td className="px-4 py-2 max-w-xs truncate" title={log.message}>{log.message}</td>
                    <td className="px-4 py-2">
                      <span className={
                        log.status === 'delivered' ? 'text-green-600 font-semibold' :
                        log.status === 'failed' ? 'text-red-600 font-semibold' :
                        log.status === 'pending' ? 'text-yellow-600 font-semibold' :
                        'text-gray-600 font-semibold'
                      }>
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => router.push(`/campaigns/${campaign.id}/edit`)}
          className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700"
        >
          Edit Campaign
        </button>
        <button
          onClick={() => router.push('/campaigns')}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Back to List
        </button>
      </div>
    </div>
  );
} 