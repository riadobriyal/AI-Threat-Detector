import React, { useState } from 'react';
import { useDashboardData, useThreats, useAlerts, useThreatFeeds } from '../../hooks/useApi';
import { Shield, AlertTriangle, Activity, TrendingUp, RefreshCw, Zap } from 'lucide-react';
import ThreatTypesChart from './charts/ThreatTypesChart';
import SeverityChart from './charts/SeverityChart';
import CVEChart from './charts/CVEChart';
import RealTimeThreatFeed from './RealTimeThreatFeed';
import IntegratedAlertPanel from './IntegratedAlertPanel';
import MLInsightsPanel from './MLInsightsPanel';

const IntegratedDashboard: React.FC = () => {
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardData();
  const { threats, loading: threatsLoading, markFalsePositive, reprocessWithAI } = useThreats({ 
    is_active: true,
    ordering: '-risk_score'
  });
  const { alerts, acknowledgeAlert, resolveAlert, escalateAlert } = useAlerts({
    status: 'open,acknowledged,investigating'
  });
  const { feeds, triggerFetch } = useThreatFeeds();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchStats();
    } finally {
      setRefreshing(false);
    }
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading threat intelligence...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Failed to load dashboard data</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Active Threats',
      value: stats?.total_threats?.toString() || '0',
      change: '+12%',
      trend: 'up',
      icon: Shield,
      color: 'text-red-400'
    },
    {
      title: 'Critical Alerts',
      value: stats?.critical_threats?.toString() || '0',
      change: '-8%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'text-amber-400'
    },
    {
      title: 'ML Accuracy',
      value: `${((stats?.model_accuracy || 0) * 100).toFixed(1)}%`,
      change: '+1.1%',
      trend: 'up',
      icon: Zap,
      color: 'text-green-400'
    },
    {
      title: 'Avg Resolution',
      value: `${stats?.avg_resolution_time?.toFixed(1) || '0'}h`,
      change: '-15%',
      trend: 'down',
      icon: TrendingUp,
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Threat Intelligence Dashboard</h1>
          <p className="text-slate-400">
            Last updated: {stats?.last_update ? new Date(stats.last_update).toLocaleString() : 'Never'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
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
        <ThreatTypesChart data={stats?.threat_types_distribution} />
        <SeverityChart 
          data={{
            critical: stats?.critical_threats || 0,
            high: stats?.high_threats || 0,
            medium: stats?.medium_threats || 0,
            low: stats?.low_threats || 0
          }}
        />
        <CVEChart trendData={stats?.threat_trend} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-time Threat Feed */}
        <div className="lg:col-span-4">
          <RealTimeThreatFeed
            threats={threats}
            loading={threatsLoading}
            onMarkFalsePositive={markFalsePositive}
            onReprocessWithAI={reprocessWithAI}
            feeds={feeds}
            onTriggerFetch={triggerFetch}
          />
        </div>

        {/* Integrated Alert Panel */}
        <div className="lg:col-span-5">
          <IntegratedAlertPanel
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
            onResolve={resolveAlert}
            onEscalate={escalateAlert}
          />
        </div>

        {/* ML Insights Panel */}
        <div className="lg:col-span-3">
          <MLInsightsPanel
            modelAccuracy={stats?.model_accuracy || 0}
            predictionConfidence={stats?.prediction_confidence || 0}
            topSources={stats?.top_sources || []}
          />
        </div>
      </div>
    </div>
  );
};

export default IntegratedDashboard;