import React from 'react';
import { 
  Home, 
  Shield, 
  AlertTriangle, 
  FileText, 
  Settings, 
  Activity,
  ChevronRight,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activeView, setActiveView }) => {
  const navigationItems = [
    { id: 'home', label: 'Dashboard', icon: Home, badge: null },
    { id: 'live-threats', label: 'Live Threats', icon: Shield, badge: '12' },
    { id: 'incident-response', label: 'Incident Response', icon: AlertTriangle, badge: '3' },
    { id: 'reports', label: 'Reports', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  const handleNavClick = (itemId: string) => {
    setActiveView(itemId);
    onClose();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0">
        {/* Logo/Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ThreatScope</h1>
              <p className="text-xs text-slate-400">AI Security Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isActive 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isActive ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Status Indicator */}
        <div className="absolute bottom-6 left-3 right-3">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">System Status</p>
                <p className="text-xs text-slate-400">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Same content as desktop sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ThreatScope</h1>
              <p className="text-xs text-slate-400">AI Security Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isActive 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isActive ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-6 left-3 right-3">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">System Status</p>
                <p className="text-xs text-slate-400">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;