export interface ThreatIndicator {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'cve';
  value: string;
  source: string;
  timestamp: Date;
  threatScore: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
  tags: string[];
  description: string;
  recommendedAction: string;
  reasoning: string;
  assetRelevance: number;
  correlatedThreats: string[];
}

export interface ThreatFeed {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  lastUpdate: Date;
  threatCount: number;
  reliability: number;
}

export interface Asset {
  id: string;
  type: 'server' | 'workstation' | 'network' | 'application';
  name: string;
  ip: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  vulnerabilities: string[];
  lastScan: Date;
}

export interface ThreatAnalytics {
  totalThreats: number;
  criticalThreats: number;
  blockedThreats: number;
  falsePositives: number;
  trendData: Array<{
    date: string;
    threats: number;
    blocked: number;
  }>;
  topSources: Array<{
    source: string;
    count: number;
  }>;
  threatTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}