import React from 'react';
import { Shield, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface HeaderProps {
  totalThreats: number;
  criticalThreats: number;
  blockedThreats: number;
  activeFeedsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  totalThreats, 
  criticalThreats, 
  blockedThreats, 
  activeFeedsCount 
}) => {
  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">CyberShield AI</h1>
          </div>
          <div className="h-6 w-px bg-gray-600" />
          <span className="text-gray-300 text-sm">Threat Intelligence Dashboard</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-400" />
            <span className="text-green-400 text-sm font-medium">{activeFeedsCount} Active Feeds</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalThreats}</div>
              <div className="text-xs text-gray-400">Total Threats</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{criticalThreats}</div>
              <div className="text-xs text-gray-400">Critical</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{blockedThreats}</div>
              <div className="text-xs text-gray-400">Blocked</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">Live</span>
          </div>
        </div>
      </div>
    </header>
  );
};