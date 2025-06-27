import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  ChevronDown,
  Settings,
  LogOut,
  UserCircle
} from 'lucide-react';

interface TopNavbarProps {
  onMenuClick: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuClick }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, type: 'critical', message: 'Critical vulnerability detected in production', time: '2 min ago' },
    { id: 2, type: 'warning', message: 'Unusual login pattern from IP 192.168.1.100', time: '5 min ago' },
    { id: 3, type: 'info', message: 'Weekly security report generated', time: '1 hour ago' },
  ];

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 lg:px-6 h-16 flex items-center justify-between">
      {/* Left Side */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search threats, IPs, domains..."
            className="block w-80 pl-10 pr-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b border-slate-700 hover:bg-slate-700 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'critical' ? 'bg-red-500' :
                        notification.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{notification.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-slate-700">
                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-2 text-slate-300 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">Sarah Chen</p>
              <p className="text-xs text-slate-400">Security Analyst</p>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Sarah Chen</p>
                    <p className="text-xs text-slate-400">Security Analyst</p>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                  <UserCircle className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <div className="border-t border-slate-700 mt-2 pt-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default TopNavbar;