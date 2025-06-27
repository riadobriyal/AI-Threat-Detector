import React from 'react';
import { BarChart3 } from 'lucide-react';

const SeverityChart: React.FC = () => {
  const data = [
    { label: 'Critical', value: 23, color: 'bg-red-500', percentage: 85 },
    { label: 'High', value: 67, color: 'bg-orange-500', percentage: 65 },
    { label: 'Medium', value: 124, color: 'bg-yellow-500', percentage: 45 },
    { label: 'Low', value: 33, color: 'bg-green-500', percentage: 25 }
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Severity Levels</h3>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">{item.label}</span>
              <span className="text-sm font-semibold text-white">{item.value}</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${item.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Average Response Time</span>
          <span className="text-sm font-semibold text-white">4.2 min</span>
        </div>
      </div>
    </div>
  );
};

export default SeverityChart;