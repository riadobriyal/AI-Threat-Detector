import React from 'react';
import ThreatTypesChart from './charts/ThreatTypesChart';
import SeverityChart from './charts/SeverityChart';
import CVEChart from './charts/CVEChart';
import ThreatFeed from './ThreatFeed';
import AlertPanel from './AlertPanel';
import CollaborationPanel from './CollaborationPanel';
import { Shield, AlertTriangle, Activity, TrendingUp } from 'lucide-react';

const MainDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Active Threats',
      value: '247',
      change: '+12%',
      trend: 'up',
      icon: Shield,
      color: 'text-red-400'
    },
    {
      title: 'Critical Alerts',
      value: '23',
      change: '-8%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-amber-400'
    },
    {
      title: 'System Health',
      value: '98.7%',
      change: '+0.3%',
      trend: 'up',
      icon: Activity,
      color: 'text-green-400'
    },
    {
      title: 'Detection Rate',
      value: '99.2%',
      change: '+1.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 flex items-center ${
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change} from last week
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-slate-700 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ThreatTypesChart />
        <SeverityChart />
        <CVEChart />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Threat Feed */}
        <div className="lg:col-span-4">
          <ThreatFeed />
        </div>

        {/* Alert Panel */}
        <div className="lg:col-span-5">
          <AlertPanel />
        </div>

        {/* Collaboration Panel */}
        <div className="lg:col-span-3">
          <CollaborationPanel />
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;