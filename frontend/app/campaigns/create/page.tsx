"use client";

import { useRouter } from "next/navigation";
import CampaignForm from "../../components/CampaignForm";

export default function CreateCampaignPage() {
  const router = useRouter();
  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow mt-8">
      <button onClick={() => router.back()} className="mb-4 text-violet-600 hover:underline">&larr; Back</button>
      <h2 className="text-2xl font-bold mb-6">Create Campaign</h2>
      <CampaignForm onSuccess={() => router.push('/campaigns')} onClose={() => router.back()} />
    </div>
  );
} 