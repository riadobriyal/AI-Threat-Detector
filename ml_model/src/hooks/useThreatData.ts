import { useState, useEffect } from 'react';
import { ThreatIndicator, ThreatFeed, Asset, ThreatAnalytics } from '../types/threat';

// Mock data generators
const generateMockThreat = (): ThreatIndicator => {
  const types = ['ip', 'domain', 'hash', 'url', 'cve'] as const;
  const sources = ['VirusTotal', 'Abuse.ch', 'MISP', 'OpenCTI', 'AlienVault'];
  const priorities = ['Critical', 'High', 'Medium', 'Low'] as const;
  
  const type = types[Math.floor(Math.random() * types.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  const score = Math.random();
  
  const threatValues = {
    ip: () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    domain: () => `malicious-${Math.random().toString(36).substring(7)}.com`,
    hash: () => Math.random().toString(36).substring(2, 34),
    url: () => `https://suspicious-${Math.random().toString(36).substring(7)}.net/payload`,
    cve: () => `CVE-2024-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
  };

  return {
    id: Math.random().toString(36).substring(2),
    type,
    value: threatValues[type](),
    source,
    timestamp: new Date(Date.now() - Math.random() * 86400000),
    threatScore: score,
    priority,
    confidence: 0.7 + Math.random() * 0.3,
    tags: ['malware', 'phishing', 'apt'].slice(0, Math.floor(Math.random() * 3) + 1),
    description: `Malicious ${type} detected by ${source} threat intelligence`,
    recommendedAction: priority === 'Critical' ? 'Block immediately' : priority === 'High' ? 'Investigate and block' : 'Monitor closely',
    reasoning: `High confidence detection from reliable source with ${Math.floor(score * 100)}% threat score`,
    assetRelevance: Math.random(),
    correlatedThreats: []
  };
};

export const useThreatData = () => {
  const [threats, setThreats] = useState<ThreatIndicator[]>([]);
  const [feeds, setFeeds] = useState<ThreatFeed[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [analytics, setAnalytics] = useState<ThreatAnalytics | null>(null);

  useEffect(() => {
    // Initialize mock data
    const initialThreats = Array.from({ length: 50 }, generateMockThreat);
    setThreats(initialThreats);

    const mockFeeds: ThreatFeed[] = [
      {
        id: '1',
        name: 'VirusTotal Intelligence',
        status: 'active',
        lastUpdate: new Date(),
        threatCount: 1247,
        reliability: 0.95
      },
      {
        id: '2',
        name: 'Abuse.ch URLhaus',
        status: 'active',
        lastUpdate: new Date(Date.now() - 300000),
        threatCount: 892,
        reliability: 0.92
      },
      {
        id: '3',
        name: 'MISP Feed',
        status: 'active',
        lastUpdate: new Date(Date.now() - 600000),
        threatCount: 634,
        reliability: 0.88
      }
    ];
    setFeeds(mockFeeds);

    const mockAssets: Asset[] = [
      {
        id: '1',
        type: 'server',
        name: 'Web Server 01',
        ip: '10.0.1.100',
        criticality: 'Critical',
        vulnerabilities: ['CVE-2024-1234', 'CVE-2024-5678'],
        lastScan: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        type: 'workstation',
        name: 'Admin Workstation',
        ip: '10.0.2.50',
        criticality: 'High',
        vulnerabilities: ['CVE-2024-9012'],
        lastScan: new Date(Date.now() - 7200000)
      }
    ];
    setAssets(mockAssets);

    // Generate analytics
    const mockAnalytics: ThreatAnalytics = {
      totalThreats: initialThreats.length,
      criticalThreats: initialThreats.filter(t => t.priority === 'Critical').length,
      blockedThreats: Math.floor(initialThreats.length * 0.3),
      falsePositives: Math.floor(initialThreats.length * 0.05),
      trendData: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString(),
        threats: Math.floor(Math.random() * 100) + 50,
        blocked: Math.floor(Math.random() * 30) + 15
      })),
      topSources: [
        { source: 'VirusTotal', count: 45 },
        { source: 'Abuse.ch', count: 32 },
        { source: 'MISP', count: 28 }
      ],
      threatTypes: [
        { type: 'Malware', count: 25, percentage: 50 },
        { type: 'Phishing', count: 15, percentage: 30 },
        { type: 'APT', count: 10, percentage: 20 }
      ]
    };
    setAnalytics(mockAnalytics);

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const newThreat = generateMockThreat();
        setThreats(prev => [newThreat, ...prev.slice(0, 49)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const markThreatAsFalsePositive = (threatId: string) => {
    setThreats(prev => prev.filter(t => t.id !== threatId));
  };

  const blockThreat = (threatId: string) => {
    setThreats(prev => 
      prev.map(t => 
        t.id === threatId 
          ? { ...t, tags: [...t.tags, 'blocked'] }
          : t
      )
    );
  };

  return {
    threats,
    feeds,
    assets,
    analytics,
    markThreatAsFalsePositive,
    blockThreat
  };
};