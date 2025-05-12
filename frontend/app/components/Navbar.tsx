'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="w-full bg-gray-800 p-4 text-white flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <span className="font-bold text-lg hover:underline cursor-pointer">Home</span>
        </Link>
        <Link href="/customers">
          <span className="hover:underline cursor-pointer">Customers</span>
        </Link>
        <Link href="/campaigns">
          <span className="hover:underline cursor-pointer">Campaigns</span>
        </Link>
        <Link href="/profile">
          <span className="hover:underline cursor-pointer">Profile</span>
        </Link>
      </div>
      {session && (
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
        >
          Logout
        </button>
      )}
    </nav>
  );
} 