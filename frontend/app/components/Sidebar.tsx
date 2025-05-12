import Link from 'next/link';
import { HomeIcon, MegaphoneIcon, UsersIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

const navLinks = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Campaigns', href: '/campaigns', icon: MegaphoneIcon },
  { name: 'Segments', href: '/segments', icon: Squares2X2Icon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-violet-600 to-purple-500 text-white flex flex-col py-8 px-4 shadow-lg z-20">
      <div className="mb-10 text-2xl font-extrabold tracking-wide text-white px-2">Xeno CRM</div>
      <nav className="flex flex-col gap-2">
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-violet-700 transition">
            <link.icon className="h-6 w-6" />
            <span className="font-medium">{link.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
} 