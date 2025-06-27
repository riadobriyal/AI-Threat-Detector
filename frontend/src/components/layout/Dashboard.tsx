import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import IntegratedDashboard from '../dashboard/IntegratedDashboard';
import RealTimeThreatFeed from '../dashboard/RealTimeThreatFeed';
import IntegratedAlertPanel from '../dashboard/IntegratedAlertPanel';
import { useThreats, useAlerts, useThreatFeeds } from '../../hooks/useApi';

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('home');

  // Use integrated API hooks
  const { threats, loading: threatsLoading, markFalsePositive, reprocessWithAI } = useThreats({ 
    is_active: true,
    ordering: '-risk_score'
  });
  const { alerts, acknowledgeAlert, resolveAlert, escalateAlert } = useAlerts({
    status: 'open,acknowledged,investigating'
  });
  const { feeds, triggerFetch } = useThreatFeeds();

  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return <IntegratedDashboard />;
      case 'live-threats':
        return (
          <RealTimeThreatFeed
            threats={threats}
            loading={threatsLoading}
            onMarkFalsePositive={markFalsePositive}
            onReprocessWithAI={reprocessWithAI}
            feeds={feeds}
            onTriggerFetch={triggerFetch}
            expanded
          />
        );
      case 'incident-response':
        return (
          <IntegratedAlertPanel
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
            onResolve={resolveAlert}
            onEscalate={escalateAlert}
            expanded
          />
        );
      case 'reports':
        return <div className="p-6 text-slate-300">Reports module coming soon...</div>;
      case 'settings':
        return <div className="p-6 text-slate-300">Settings panel coming soon...</div>;
      default:
        return <IntegratedDashboard />;
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