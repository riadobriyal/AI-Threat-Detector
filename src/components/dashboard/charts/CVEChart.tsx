import React from 'react';
import { TrendingUp } from 'lucide-react';

const CVEChart: React.FC = () => {
  const data = [
    { day: 'Mon', value: 12, height: 20 },
    { day: 'Tue', value: 18, height: 35 },
    { day: 'Wed', value: 8, height: 15 },
    { day: 'Thu', value: 25, height: 50 },
    { day: 'Fri', value: 32, height: 65 },
    { day: 'Sat', value: 15, height: 30 },
    { day: 'Sun', value: 22, height: 45 }
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">CVEs This Week</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">132</div>
          <div className="text-xs text-green-400">+12% vs last week</div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="flex items-end space-x-2 h-32 mb-4">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="relative w-full bg-slate-700 rounded-t-lg overflow-hidden">
              <div 
                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-1000 ease-out rounded-t-lg"
                style={{ height: `${item.height * 2}px` }}
              ></div>
            </div>
            <span className="text-xs text-slate-400 mt-2">{item.day}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="text-lg font-bold text-red-400">23</div>
          <div className="text-xs text-slate-400">Critical CVEs</div>
        </div>
        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
          <div className="text-lg font-bold text-green-400">94%</div>
          <div className="text-xs text-slate-400">Patched</div>
        </div>
      </div>
    </div>
  );
};

export default CVEChart;