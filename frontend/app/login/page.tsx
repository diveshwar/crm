'use client';

import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 text-center">Sign in to Xeno CRM</h1>
        <p className="mb-8 text-gray-600 text-center">Use your Google account to sign in</p>
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-2 text-gray-700 font-medium shadow-sm hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
            style={{ width: 20, height: 20 }}
          />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
} 