import React from 'react';
import { Header } from './components/Header';
import { ThreatList } from './components/ThreatList';
import { Analytics } from './components/Analytics';
import { FeedStatus } from './components/FeedStatus';
import { AssetMonitor } from './components/AssetMonitor';
import { useThreatData } from './hooks/useThreatData';

function App() {
  const { 
    threats, 
    feeds, 
    assets, 
    analytics, 
    markThreatAsFalsePositive, 
    blockThreat 
  } = useThreatData();

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading threat intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        totalThreats={analytics.totalThreats}
        criticalThreats={analytics.criticalThreats}
        blockedThreats={analytics.blockedThreats}
        activeFeedsCount={feeds.filter(f => f.status === 'active').length}
      />
      
      <main className="p-6 space-y-6">
        {/* Analytics Section */}
        <Analytics analytics={analytics} />
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threat List - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <ThreatList
              threats={threats}
              onMarkFalsePositive={markThreatAsFalsePositive}
              onBlockThreat={blockThreat}
            />
          </div>
          
          {/* Sidebar - Feed Status and Assets */}
          <div className="space-y-6">
            <FeedStatus feeds={feeds} />
            <AssetMonitor assets={assets} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;