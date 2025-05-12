"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MegaphoneIcon, UsersIcon, ClipboardDocumentListIcon, PlusIcon } from '@heroicons/react/24/outline';
import CampaignForm from './components/CampaignForm';
import SegmentForm from './components/SegmentForm';

interface Campaign {
  id: number;
  name: string;
  status: string;
  scheduledAt?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;

  // State for real-time customer count
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<number>(0);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchCustomerCount() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:3001/api/customers', {
          headers: {
            Authorization: typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
          }
        });
        const data = await res.json();
        setCustomerCount(data?.data?.pagination?.total ?? 0);
      } catch (err) {
        setError('Failed to fetch customer count');
      } finally {
        setLoading(false);
      }
    }
    fetchCustomerCount();
  }, []);

  // Fetch recent campaigns and active campaigns count
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const res = await fetch('http://localhost:3001/api/campaigns', {
          headers: {
            Authorization: typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
          }
        });
        const data = await res.json();
        const allCampaigns = data?.data?.campaigns || [];
        setCampaigns(allCampaigns.slice(0, 4)); // Get latest 4 campaigns
        // Count active campaigns (status === 'running')
        const activeCount = allCampaigns.filter((c: Campaign) => c.status === 'running').length;
        setActiveCampaigns(activeCount);
      } catch (err) {
        setCampaigns([]);
        setActiveCampaigns(0);
      }
    }
    fetchCampaigns();
  }, []);

  // Fetch total orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('http://localhost:3001/api/orders/count', {
          headers: {
            Authorization: typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
          }
        });
        const data = await res.json();
        setTotalOrders(data?.data?.count || 0);
      } catch (err) {
        setTotalOrders(0);
      }
    }
    fetchOrders();
  }, []);

  // Fetch recent activities
  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch('http://localhost:3001/api/activities?limit=5', {
          headers: {
            Authorization: typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
          }
        });
        const data = await res.json();
        setActivities(data?.data?.activities || []);
      } catch (err) {
        setActivities([]);
      }
    }
    fetchActivities();
  }, []);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>You are not logged in.</div>;
  }

  // Update stats with real data
  const stats = [
    { label: 'Total Customers', value: loading ? '...' : (customerCount ?? 'N/A'), icon: UsersIcon },
    { label: 'Active Campaigns', value: loading ? '...' : activeCampaigns, icon: MegaphoneIcon },
    { label: 'Total Orders', value: loading ? '...' : totalOrders, icon: ClipboardDocumentListIcon },
  ];

  return (
    <main className="p-8 bg-gray-50 min-h-screen relative">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Welcome to Xeno CRM</h2>
          <span className="text-gray-600">Logged in as {user?.name}</span>
        </div>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 bg-white rounded-lg shadow p-6">
              <stat.icon className="h-8 w-8 text-violet-600" />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Recent Campaigns</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {campaigns.length === 0 ? (
            <div className="col-span-full text-gray-400">No campaigns found.</div>
          ) : (
            campaigns.map((c, i) => (
              <div key={c.id || i} className="bg-white rounded-lg shadow p-4 border-l-4 border-violet-500">
                <div className="font-bold text-violet-700 mb-1">{c.name}</div>
                <div className="text-sm text-gray-500">Status: {c.status || 'Draft'}</div>
                <div className="text-sm text-gray-400">Scheduled: {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : '-'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Activity Feed</h3>
        <ul className="space-y-2">
          {activities.length === 0 ? (
            <li className="text-gray-400">No recent activities</li>
          ) : (
            activities.map((activity) => (
              <li key={activity.id} className="flex items-center gap-2 text-gray-700">
                <span className="text-violet-600">•</span>
                <span>{activity.message}</span>
                <span className="text-xs text-gray-400 ml-2">
                  by {activity.Customer?.name || 'System'} • {new Date(activity.createdAt).toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Floating Action Button with Menu */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg text-3xl"
          onClick={() => setShowMenu((v) => !v)}
          aria-label="Open Create Menu"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
        {showMenu && (
          <div className="absolute bottom-20 right-0 bg-white rounded-xl shadow-lg p-4 flex flex-col gap-2 w-56">
            <button
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded font-semibold transition text-left"
              onClick={() => { setShowCampaignModal(true); setShowMenu(false); }}
            >
              + Create Campaign
            </button>
            <button
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded font-semibold transition text-left"
              onClick={() => { setShowSegmentModal(true); setShowMenu(false); }}
            >
              + Create Segment
            </button>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full relative">
            <h2 className="text-2xl font-bold mb-6">Create Campaign</h2>
            <CampaignForm onSuccess={() => setShowCampaignModal(false)} onClose={() => setShowCampaignModal(false)} />
          </div>
        </div>
      )}
      {/* Segment Modal */}
      {showSegmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full relative">
            <h2 className="text-2xl font-bold mb-6">Create Segment</h2>
            <SegmentForm onSuccess={() => setShowSegmentModal(false)} onClose={() => setShowSegmentModal(false)} />
          </div>
        </div>
      )}
    </main>
  );
} 