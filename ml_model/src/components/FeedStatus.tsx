import React from 'react';
import { Wifi, WifiOff, Clock, Database } from 'lucide-react';
import { ThreatFeed } from '../types/threat';

interface FeedStatusProps {
  feeds: ThreatFeed[];
}

export const FeedStatus: React.FC<FeedStatusProps> = ({ feeds }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Wifi className="h-4 w-4 text-green-400" />;
      case 'inactive':
        return <WifiOff className="h-4 w-4 text-gray-400" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-400" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/10';
      case 'error':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Database className="h-5 w-5 mr-2 text-cyan-400" />
          Threat Feed Status
        </h2>
      </div>
      
      <div className="p-6 space-y-4">
        {feeds.map((feed) => (
          <div key={feed.id} className="flex items-center justify-between p-4 bg-gray-750 rounded-lg border border-gray-600">
            <div className="flex items-center space-x-3">
              {getStatusIcon(feed.status)}
              <div>
                <h3 className="text-white font-medium">{feed.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {feed.lastUpdate.toLocaleTimeString()}
                  </span>
                  <span>{feed.threatCount} threats</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feed.status)}`}>
                {feed.status.charAt(0).toUpperCase() + feed.status.slice(1)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {(feed.reliability * 100).toFixed(0)}% reliable
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};