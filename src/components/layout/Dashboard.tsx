import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MainDashboard from '../dashboard/MainDashboard';
import ThreatFeed from '../dashboard/ThreatFeed';
import AlertPanel from '../dashboard/AlertPanel';
import CollaborationPanel from '../dashboard/CollaborationPanel';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');

  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return <MainDashboard />;
      case 'live-threats':
        return <ThreatFeed expanded />;
      case 'incident-response':
        return <AlertPanel expanded />;
      case 'reports':
        return <div className="p-6 text-slate-300">Reports module coming soon...</div>;
      case 'settings':
        return <div className="p-6 text-slate-300">Settings panel coming soon...</div>;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Top Navigation */}
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Main Dashboard Content */}
        <main className="p-4 lg:p-6">
          {renderMainContent()}
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;