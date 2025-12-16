'use client';

import { Bell, User, LogOut } from 'lucide-react';
import Link from 'next/link';

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

interface DashboardHeaderProps {
  title: string;
  user?: UserData;
}

export default function DashboardHeader({ title, user }: DashboardHeaderProps) {
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  
  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
  };
  
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        
        <div className="flex items-center space-x-4">
          <button 
            type="button" 
            className="p-2 text-gray-600 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="sr-only">View notifications</span>
          </button>
          
          <div className="relative ml-3">
            <div>
              <button
                type="button"
                className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                id="user-menu-button"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <span className="sr-only">Open user menu</span>
                {user?.avatar ? (
                  <img 
                    className="w-8 h-8 rounded-full" 
                    src={user.avatar} 
                    alt={user.name} 
                  />
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-blue-600 rounded-full">
                    {userInitial}
                  </div>
                )}
              </button>
            </div>
            
            {/* Dropdown menu - shown on click/hover */}
            <div className="absolute right-0 z-10 hidden w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" 
                 role="menu" 
                 aria-orientation="vertical"
                 aria-labelledby="user-menu-button"
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
              <Link 
                href="/dashboard/settings" 
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                Your Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
