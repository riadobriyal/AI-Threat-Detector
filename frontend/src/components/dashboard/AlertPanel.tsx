import React, { useState } from 'react';
import { AlertTriangle, Clock, User, CheckCircle, XCircle, Play } from 'lucide-react';

interface AlertPanelProps {
  expanded?: boolean;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium';
  status: 'open' | 'in-progress' | 'resolved';
  assignee?: string;
  suggestedActions: string[];
  timestamp: string;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ expanded = false }) => {
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'Multiple Failed Login Attempts',
      description: 'Detected 50+ failed login attempts from IP 192.168.1.100 targeting admin accounts',
      severity: 'critical',
      status: 'open',
      assignee: 'Sarah Chen',
      suggestedActions: [
        'Block suspicious IP address',
        'Force password reset for targeted accounts',
        'Enable MFA for admin accounts'
      ],
      timestamp: '2 minutes ago'
    },
    {
      id: '2',
      title: 'Malware Detected on Workstation',
      description: 'Trojan.Generic detected on WS-001 (Marketing Department)',
      severity: 'high',
      status: 'in-progress',
      assignee: 'Mike Johnson',
      suggestedActions: [
        'Isolate infected workstation',
        'Run full system scan',
        'Check for lateral movement'
      ],
      timestamp: '15 minutes ago'
    },
    {
      id: '3',
      title: 'Unusual Network Traffic Pattern',
      description: 'Abnormal data exfiltration pattern detected on network segment 10.0.1.0/24',
      severity: 'medium',
      status: 'open',
      suggestedActions: [
        'Analyze network traffic logs',
        'Identify affected systems',
        'Monitor for data exfiltration'
      ],
      timestamp: '1 hour ago'
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      default: return 'text-slate-400 bg-slate-900/20 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-400 bg-red-900/20';
      case 'in-progress': return 'text-blue-400 bg-blue-900/20';
      case 'resolved': return 'text-green-400 bg-green-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return XCircle;
      case 'in-progress': return Play;
      case 'resolved': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 h-full">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">AI-Prioritized Alerts</h2>
          </div>
          <span className="px-2 py-1 bg-red-900/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
            {alerts.filter(a => a.status === 'open').length} Open
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {alerts.map((alert) => {
          const StatusIcon = getStatusIcon(alert.status);
          
          return (
            <div
              key={alert.id}
              className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-white">{alert.title}</h3>
                  <div className={`px-2 py-0.5 rounded-full border text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </div>
                </div>
                
                <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{alert.status.replace('-', ' ').toUpperCase()}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                {alert.description}
              </p>

              <div className="space-y-2 mb-3">
                <h4 className="text-xs font-medium text-slate-300">AI Suggested Actions:</h4>
                <ul className="space-y-1">
                  {alert.suggestedActions.slice(0, expanded ? undefined : 2).map((action, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-slate-400">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  {alert.assignee && (
                    <>
                      <User className="w-3 h-3" />
                      <span>{alert.assignee}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              <div className="flex space-x-2 mt-3">
                <button className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors">
                  Investigate
                </button>
                <button className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium rounded transition-colors">
                  Assign
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!expanded && (
        <div className="p-4 border-t border-slate-700">
          <button className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all alerts →
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertPanel;