'use client';

import { signOut, useSession } from 'next-auth/react';

export default function Topbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '';

  return (
    <header className="flex items-center justify-end h-16 px-8 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-lg">
            {initials}
          </div>
          <span className="font-medium text-gray-800">{user?.name}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
} 