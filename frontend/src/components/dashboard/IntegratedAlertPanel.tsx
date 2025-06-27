import React, { useState } from 'react';
import { AlertTriangle, Clock, User, CheckCircle, XCircle, Play, ArrowUp } from 'lucide-react';
import { Alert } from '../../services/api';
import { useThreatPrediction } from '../../hooks/useApi';

interface IntegratedAlertPanelProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onEscalate: (alertId: string) => void;
}

const IntegratedAlertPanel: React.FC<IntegratedAlertPanelProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  onEscalate
}) => {
  const [processingAlert, setProcessingAlert] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, any>>({});
  const { predictResolution } = useThreatPrediction();

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'text-red-400 bg-red-900/20 border-red-500/30';
    if (priority === 3) return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
    if (priority === 2) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    return 'text-green-400 bg-green-900/20 border-green-500/30';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return 'Critical';
    if (priority === 3) return 'High';
    if (priority === 2) return 'Medium';
    return 'Low';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-red-400 bg-red-900/20';
      case 'acknowledged': return 'text-yellow-400 bg-yellow-900/20';
      case 'investigating': return 'text-blue-400 bg-blue-900/20';
      case 'resolved': return 'text-green-400 bg-green-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return XCircle;
      case 'acknowledged': return Play;
      case 'investigating': return Play;
      case 'resolved': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  const handleAction = async (action: () => Promise<void>, alertId: string) => {
    setProcessingAlert(alertId);
    try {
      await action();
    } finally {
      setProcessingAlert(null);
    }
  };

  const handleGetPrediction = async (alertId: string, threatId: string) => {
    if (predictions[alertId]) return; // Already have prediction
    
    try {
      const prediction = await predictResolution(threatId);
      setPredictions(prev => ({
        ...prev,
        [alertId]: prediction
      }));
    } catch (error) {
      console.error('Failed to get prediction:', error);
    }
  };

  const openAlerts = alerts.filter(a => a.status !== 'resolved');

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 h-full">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">AI-Enhanced Alerts</h2>
          </div>
          <span className="px-2 py-1 bg-red-900/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30">
            {openAlerts.length} Open
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {openAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No active alerts</p>
          </div>
        ) : (
          openAlerts.map((alert) => {
            const StatusIcon = getStatusIcon(alert.status);
            const prediction = predictions[alert.id];
            
            return (
              <div
                key={alert.id}
                className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-white">{alert.title}</h3>
                    <div className={`px-2 py-0.5 rounded-full border text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                      {getPriorityLabel(alert.priority)}
                    </div>
                    {alert.escalated && (
                      <div className="flex items-center text-red-400 text-xs">
                        <ArrowUp className="w-3 h-3 mr-1" />
                        Escalated
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{alert.status.replace('_', ' ').toUpperCase()}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                  {alert.description}
                </p>

                {/* ML Prediction Section */}
                {alert.threat && (
                  <div className="mb-3 p-2 bg-slate-600/50 rounded">
                    {prediction ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-cyan-400">🤖 AI Prediction:</span>
                          <span className="text-white font-medium">
                            {prediction.predicted_resolution_time.toFixed(1)}h
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Risk Level:</span>
                          <span className={`font-medium ${
                            prediction.risk_level === 'Critical' ? 'text-red-400' :
                            prediction.risk_level === 'High' ? 'text-orange-400' :
                            prediction.risk_level === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {prediction.risk_level}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Confidence: {prediction.confidence_interval_lower.toFixed(1)}h - {prediction.confidence_interval_upper.toFixed(1)}h
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGetPrediction(alert.id, alert.threat)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        🤖 Get AI Prediction
                      </button>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <div className="flex items-center space-x-2">
                    {alert.assigned_to && (
                      <>
                        <User className="w-3 h-3" />
                        <span>{alert.assigned_to}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {alert.status === 'open' && (
                    <button
                      onClick={() => handleAction(() => onAcknowledge(alert.id), alert.id)}
                      disabled={processingAlert === alert.id}
                      className="flex-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white text-xs font-medium rounded transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  
                  {(alert.status === 'acknowledged' || alert.status === 'investigating') && (
                    <button
                      onClick={() => handleAction(() => onResolve(alert.id), alert.id)}
                      disabled={processingAlert === alert.id}
                      className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white text-xs font-medium rounded transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  
                  {!alert.escalated && alert.priority >= 3 && (
                    <button
                      onClick={() => handleAction(() => onEscalate(alert.id), alert.id)}
                      disabled={processingAlert === alert.id}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-xs font-medium rounded transition-colors"
                    >
                      Escalate
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-slate-700">
        <button className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">
          View all alerts →
        </button>
      </div>
    </div>
  );
};

export default IntegratedAlertPanel;