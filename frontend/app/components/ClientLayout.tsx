'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  return (
    <>
      {!isLogin && <Sidebar />}
      <div className={!isLogin ? 'ml-64' : ''}>
        {!isLogin && <Topbar />}
        {children}
      </div>
    </>
  );
} 