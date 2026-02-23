'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiHome, FiLogIn, FiTrendingUp, FiTrendingDown, FiTruck, FiEdit, FiLogOut } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';

const navItems = [
  { href: '/dashboard', icon: FiHome, label: '總覽' },
  { href: '/dashboard/check-ins', icon: FiLogIn, label: '入住紀錄' },
  { href: '/dashboard/income', icon: FiTrendingUp, label: '收入表' },
  { href: '/dashboard/expenses', icon: FiTrendingDown, label: '支出表' },
  { href: '/dashboard/housekeeping-pivot', icon: FaUsers, label: '房務人員支出樞紐' },
  { href: '/dashboard/laundry', icon: FiTruck, label: '送洗紀錄' },
  { href: '/dashboard/entry', icon: FiEdit, label: '資料輸入' },
];

interface SidebarProps {
  isOpen: boolean;
  onLinkClick: () => void;
}

export default function Sidebar({ isOpen, onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout');
    if (res.ok) {
      onLinkClick(); // Close sidebar on logout as well
      router.push('/login');
    }
  };

  return (
    <aside className={`bg-gray-800 text-white h-full flex flex-col flex-shrink-0 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'} overflow-hidden md:w-64`}>
      <div className="p-4">
        <h2 className="text-2xl font-bold">日出山丘</h2>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link href={href} onClick={onLinkClick} className={`flex items-center p-4 text-lg hover:bg-gray-700 ${isActive ? 'bg-gray-900' : ''}`}>
                    <Icon className="mr-4" />
                    <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button onClick={handleLogout} className="flex items-center p-4 text-lg hover:bg-gray-700 w-full">
            <FiLogOut className="mr-4" />
            <span>登出</span>
        </button>
      </div>
    </aside>
  );
}
