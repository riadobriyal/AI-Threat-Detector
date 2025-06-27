import React from 'react';
import { AlertTriangle, Shield, ExternalLink, X, CheckCircle } from 'lucide-react';
import { ThreatIndicator } from '../types/threat';

interface ThreatListProps {
  threats: ThreatIndicator[];
  onMarkFalsePositive: (id: string) => void;
  onBlockThreat: (id: string) => void;
}

export const ThreatList: React.FC<ThreatListProps> = ({ 
  threats, 
  onMarkFalsePositive, 
  onBlockThreat 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'High': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ip':
      case 'domain':
      case 'url':
        return <ExternalLink className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
          Live Threat Feed
        </h2>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {threats.slice(0, 10).map((threat) => (
          <div
            key={threat.id}
            className="px-6 py-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(threat.priority)}`}>
                    {threat.priority}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    {getTypeIcon(threat.type)}
                    <span className="ml-1 uppercase">{threat.type}</span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {threat.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="text-white font-mono text-sm mb-2 break-all">
                  {threat.value}
                </div>
                
                <div className="text-gray-300 text-sm mb-2">
                  {threat.description}
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span>Source: {threat.source}</span>
                  <span>Score: {(threat.threatScore * 100).toFixed(0)}%</span>
                  <span>Confidence: {(threat.confidence * 100).toFixed(0)}%</span>
                </div>
                
                <div className="mt-2 text-sm text-cyan-400">
                  💡 {threat.reasoning}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {threat.tags.includes('blocked') ? (
                  <div className="flex items-center text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Blocked
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onBlockThreat(threat.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                    >
                      <Shield className="h-3 w-3 mr-1 inline" />
                      Block
                    </button>
                    <button
                      onClick={() => onMarkFalsePositive(threat.id)}
                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition-colors"
                    >
                      <X className="h-3 w-3 mr-1 inline" />
                      False Positive
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};