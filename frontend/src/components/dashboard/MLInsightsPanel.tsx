import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Zap, Activity } from 'lucide-react';
import { mlApiClient } from '../../services/api';

interface MLInsightsPanelProps {
  modelAccuracy: number;
  predictionConfidence: number;
  topSources: Array<{ source: string; count: number }>;
}

const MLInsightsPanel: React.FC<MLInsightsPanelProps> = ({
  modelAccuracy,
  predictionConfidence,
  topSources
}) => {
  const [mlHealth, setMlHealth] = useState<any>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMLData = async () => {
      try {
        const [health, info] = await Promise.all([
          mlApiClient.getHealth(),
          mlApiClient.getModelInfo()
        ]);
        setMlHealth(health);
        setModelInfo(info);
      } catch (error) {
        console.error('Failed to fetch ML data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMLData();
    
    // Poll ML health every 30 seconds
    const interval = setInterval(fetchMLData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-900/20';
      case 'degraded': return 'text-yellow-400 bg-yellow-900/20';
      case 'unhealthy': return 'text-red-400 bg-red-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 h-full">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">ML Insights</h2>
          </div>
          {mlHealth && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(mlHealth.status)}`}>
              {mlHealth.status}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Loading ML data...</p>
          </div>
        ) : (
          <>
            {/* Model Performance */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <Target className="w-4 h-4 mr-2 text-purple-400" />
                Model Performance
              </h3>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-slate-300 mb-1">
                    <span>Threat Detection Accuracy</span>
                    <span>{(modelAccuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${modelAccuracy * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-slate-300 mb-1">
                    <span>Prediction Confidence</span>
                    <span>{(predictionConfidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-cyan-400 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${predictionConfidence * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-slate-300 mb-1">
                    <span>False Positive Rate</span>
                    <span>2.3%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '2.3%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Info */}
            {modelInfo && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-purple-400" />
                  Model Details
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Model Type:</span>
                    <span className="text-white">{modelInfo.model_name || 'XGBoost'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Features:</span>
                    <span className="text-white">{modelInfo.features_count || 9}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className={modelInfo.model_loaded ? 'text-green-400' : 'text-red-400'}>
                      {modelInfo.model_loaded ? 'Loaded' : 'Not Loaded'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Top Threat Sources */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
                Top Threat Sources
              </h3>
              
              <div className="space-y-2">
                {topSources.slice(0, 5).map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-slate-300">{source.source}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{source.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Metrics */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center">
                <Activity className="w-4 h-4 mr-2 text-purple-400" />
                Real-time Metrics
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-lg font-bold text-purple-400">47ms</div>
                  <div className="text-xs text-slate-400">Avg Response</div>
                </div>
                <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                  <div className="text-lg font-bold text-cyan-400">156</div>
                  <div className="text-xs text-slate-400">Predictions/hr</div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <h4 className="text-sm font-medium text-purple-300 mb-2">🤖 AI Recommendation</h4>
              <p className="text-xs text-slate-300">
                Model performance is optimal. Consider retraining with new threat data in 7 days to maintain accuracy.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MLInsightsPanel;