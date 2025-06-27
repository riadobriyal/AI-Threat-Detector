import React from 'react';
import { PieChart } from 'lucide-react';

const ThreatTypesChart: React.FC = () => {
  const data = [
    { name: 'Malware', value: 35, color: 'bg-red-500' },
    { name: 'Phishing', value: 28, color: 'bg-orange-500' },
    { name: 'APT', value: 20, color: 'bg-yellow-500' },
    { name: 'Ransomware', value: 12, color: 'bg-purple-500' },
    { name: 'Other', value: 5, color: 'bg-slate-500' }
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <PieChart className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Threat Types</h3>
      </div>

      {/* Simplified Donut Chart */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 shadow-inner">
          <div className="absolute inset-4 rounded-full bg-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">247</div>
              <div className="text-xs text-slate-400">Total Threats</div>
            </div>
          </div>
        </div>
        
        {/* Gradient rings to simulate chart segments */}
        <div className="absolute inset-0 rounded-full bg-gradient-conic from-red-500 via-orange-500 via-yellow-500 via-purple-500 to-slate-500 opacity-80"></div>
        <div className="absolute inset-4 rounded-full bg-slate-800"></div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-sm text-slate-300">{item.name}</span>
            </div>
            <div className="text-sm font-semibold text-white">{item.value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatTypesChart;