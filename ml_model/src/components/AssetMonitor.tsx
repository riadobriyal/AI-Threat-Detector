import React from 'react';
import { Server, Monitor, Network, Shield, AlertTriangle } from 'lucide-react';
import { Asset } from '../types/threat';

interface AssetMonitorProps {
  assets: Asset[];
}

export const AssetMonitor: React.FC<AssetMonitorProps> = ({ assets }) => {
  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server className="h-5 w-5" />;
      case 'workstation':
        return <Monitor className="h-5 w-5" />;
      case 'network':
        return <Network className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'Critical':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'High':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Low':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <Shield className="h-5 w-5 mr-2 text-cyan-400" />
          Asset Monitor
        </h2>
      </div>
      
      <div className="p-6 space-y-4">
        {assets.map((asset) => (
          <div key={asset.id} className="p-4 bg-gray-750 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-cyan-400">
                  {getAssetIcon(asset.type)}
                </div>
                <div>
                  <h3 className="text-white font-medium">{asset.name}</h3>
                  <p className="text-gray-400 text-sm font-mono">{asset.ip}</p>
                </div>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getCriticalityColor(asset.criticality)}`}>
                {asset.criticality}
              </div>
            </div>
            
            {asset.vulnerabilities.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center text-yellow-400 text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {asset.vulnerabilities.length} Vulnerabilities
                </div>
                <div className="flex flex-wrap gap-1">
                  {asset.vulnerabilities.map((vuln) => (
                    <span
                      key={vuln}
                      className="px-2 py-1 bg-yellow-400/10 text-yellow-400 text-xs rounded border border-yellow-400/20 font-mono"
                    >
                      {vuln}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-3 text-xs text-gray-400">
              Last scan: {asset.lastScan.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};