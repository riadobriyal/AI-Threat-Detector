import React, { useState } from 'react';
import { Shield, Clock, AlertCircle, ExternalLink, RefreshCw, X, Zap } from 'lucide-react';
import { Threat, ThreatFeed } from '../../services/api';

interface RealTimeThreatFeedProps {
  threats: Threat[];
  loading: boolean;
  onMarkFalsePositive: (threatId: string) => void;
  onReprocessWithAI: (threatId: string) => void;
  feeds: ThreatFeed[];
  onTriggerFetch: (feedId: string) => void;
}

const RealTimeThreatFeed: React.FC<RealTimeThreatFeedProps> = ({
  threats,
  loading,
  onMarkFalsePositive,
  onReprocessWithAI,
  feeds,
  onTriggerFetch
}) => {
  const [processingThreat, setProcessingThreat] = useState<string | null>(null);

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'text-red-400 bg-red-900/20 border-red-500/30';
    if (severity >= 6) return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
    if (severity >= 4) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    return 'text-green-400 bg-green-900/20 border-green-500/30';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 8) return 'Critical';
    if (severity >= 6) return 'High';
    if (severity >= 4) return 'Medium';
    return 'Low';
  };

  const handleReprocessWithAI = async (threatId: string) => {
    setProcessingThreat(threatId);
    try {
      await onReprocessWithAI(threatId);
    } finally {
      setProcessingThreat(null);
    }
  };

  const activeFeedsCount = feeds.filter(f => f.is_active).length;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 h-full">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Live Threat Feed</h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">{activeFeedsCount} feeds active</span>
            </div>
            <span className="px-2 py-1 bg-blue-900/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
              {threats.length} threats
            </span>
          </div>
        </div>
      </div>

      {/* Feed Status */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">Active Feeds</span>
          <span className="text-xs text-slate-400">Last updated</span>
        </div>
        <div className="space-y-2">
          {feeds.slice(0, 3).map((feed) => (
            <div key={feed.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${feed.is_active ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className="text-slate-300">{feed.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 text-xs">
                  {feed.last_fetched ? new Date(feed.last_fetched).toLocaleTimeString() : 'Never'}
                </span>
                <button
                  onClick={() => onTriggerFetch(feed.id)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Trigger fetch"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Loading threats...</p>
          </div>
        ) : threats.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No active threats detected</p>
          </div>
        ) : (
          threats.slice(0, 10).map((threat) => (
            <div
              key={threat.id}
              className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:bg-slate-700 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                      {threat.title}
                    </h3>
                    <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`px-2 py-0.5 rounded-full border text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                      {getSeverityLabel(threat.severity)}
                    </div>
                    <span className="text-xs text-slate-500 uppercase">{threat.threat_type}</span>
                    <span className="text-xs text-slate-500">Risk: {threat.risk_score.toFixed(1)}</span>
                  </div>
                  
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                    {threat.description}
                  </p>
                  
                  {threat.ai_classification && (
                    <div className="mb-2 text-xs text-cyan-400">
                      🤖 AI Classification: {threat.ai_classification}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500">{threat.source}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-500">
                        {new Date(threat.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1 ml-3">
                  <button
                    onClick={() => handleReprocessWithAI(threat.id)}
                    disabled={processingThreat === threat.id}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-xs rounded transition-colors flex items-center space-x-1"
                  >
                    <Zap className={`w-3 h-3 ${processingThreat === threat.id ? 'animate-pulse' : ''}`} />
                    <span>AI</span>
                  </button>
                  <button
                    onClick={() => onMarkFalsePositive(threat.id)}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors flex items-center space-x-1"
                  >
                    <X className="w-3 h-3" />
                    <span>FP</span>
                  </button>
                </div>
              </div>
              
              {threat.incident_response_suggestion && (
                <div className="mt-3 p-2 bg-slate-600/50 rounded text-xs text-slate-300">
                  <strong>AI Recommendation:</strong> {threat.incident_response_suggestion.slice(0, 100)}...
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-700">
        <button className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">
          View all threats →
        </button>
      </div>
    </div>
  );
};

export default RealTimeThreatFeed;