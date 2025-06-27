import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface ThreatFeedProps {
  expanded?: boolean;
}

interface Threat {
  id: string;
  name: string;
  source: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  time: string;
  description: string;
  category: string;
}

const ThreatFeed: React.FC<ThreatFeedProps> = ({ expanded = false }) => {
  const [threats, setThreats] = useState<Threat[]>([]);

  const mockThreats: Threat[] = [
    {
      id: '1',
      name: 'APT-29 Campaign Detected',
      source: 'Cyber Threat Intelligence',
      riskLevel: 'critical',
      time: '2 minutes ago',
      description: 'Advanced persistent threat group targeting government infrastructure',
      category: 'APT'
    },
    {
      id: '2',
      name: 'Ransomware IOCs Identified',
      source: 'YARA Rules',
      riskLevel: 'high',
      time: '5 minutes ago',
      description: 'New ransomware family targeting healthcare sector',
      category: 'Malware'
    },
    {
      id: '3',
      name: 'Phishing Campaign Active',
      source: 'Email Security Gateway',
      riskLevel: 'medium',
      time: '12 minutes ago',
      description: 'COVID-19 themed phishing emails targeting employees',
      category: 'Phishing'
    },
    {
      id: '4',
      name: 'Suspicious Domain Registered',
      source: 'Domain Intelligence',
      riskLevel: 'medium',
      time: '18 minutes ago',
      description: 'Typosquatting domain mimicking company website',
      category: 'Domain'
    },
    {
      id: '5',
      name: 'CVE-2024-1234 Exploit',
      source: 'Vulnerability Scanner',
      riskLevel: 'high',
      time: '25 minutes ago',
      description: 'Zero-day exploit for Apache vulnerability detected',
      category: 'Vulnerability'
    },
    {
      id: '6',
      name: 'Botnet C2 Communication',
      source: 'Network Monitor',
      riskLevel: 'high',
      time: '32 minutes ago',
      description: 'Infected hosts communicating with known botnet infrastructure',
      category: 'Botnet'
    }
  ];

  useEffect(() => {
    setThreats(mockThreats);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      const newThreat: Threat = {
        id: Date.now().toString(),
        name: `New Threat ${Math.floor(Math.random() * 1000)}`,
        source: 'AI Detection Engine',
        riskLevel: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any,
        time: 'Just now',
        description: 'AI-detected anomalous behavior in network traffic',
        category: 'Anomaly'
      };
      
      setThreats(prev => [newThreat, ...prev.slice(0, 9)]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-500/30';
      default: return 'text-slate-400 bg-slate-900/20 border-slate-500/30';
    }
  };

  const displayThreats = expanded ? threats : threats.slice(0, 6);

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 h-full">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Live Threat Feed</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400">Live</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {displayThreats.map((threat) => (
          <div
            key={threat.id}
            className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:bg-slate-700 transition-colors group cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-sm font-medium text-white truncate group-hover:text-blue-400 transition-colors">
                    {threat.name}
                  </h3>
                  <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                  {threat.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-500">{threat.source}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{threat.category}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-500">{threat.time}</span>
                  </div>
                </div>
              </div>
              
              <div className={`ml-3 px-2 py-1 rounded-full border text-xs font-medium ${getRiskColor(threat.riskLevel)}`}>
                {threat.riskLevel.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!expanded && (
        <div className="p-4 border-t border-slate-700">
          <button className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View all threats →
          </button>
        </div>
      )}
    </div>
  );
};

export default ThreatFeed;