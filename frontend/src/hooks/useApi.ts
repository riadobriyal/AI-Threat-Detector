import { useState, useEffect, useCallback } from 'react';
import { apiClient, DashboardStats, Threat, Alert, ThreatFeed } from '../services/api';

// Custom hook for dashboard data
export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

// Custom hook for threats data
export const useThreats = (filters?: any) => {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const fetchThreats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getThreats(filters);
      setThreats(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch threats');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchThreats();
  }, [fetchThreats]);

  const markFalsePositive = async (threatId: string) => {
    try {
      await apiClient.markThreatFalsePositive(threatId);
      setThreats(prev => prev.filter(t => t.id !== threatId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as false positive');
    }
  };

  const reprocessWithAI = async (threatId: string) => {
    try {
      await apiClient.reprocessThreatWithAI(threatId);
      await fetchThreats(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reprocess threat');
    }
  };

  return {
    threats,
    loading,
    error,
    pagination,
    refetch: fetchThreats,
    markFalsePositive,
    reprocessWithAI,
  };
};

// Custom hook for alerts data
export const useAlerts = (filters?: any) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAlerts(filters);
      setAlerts(response.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await apiClient.acknowledgeAlert(alertId);
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? { ...alert, status: 'acknowledged' }
            : alert
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await apiClient.resolveAlert(alertId);
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? { ...alert, status: 'resolved' }
            : alert
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve alert');
    }
  };

  const escalateAlert = async (alertId: string) => {
    try {
      await apiClient.escalateAlert(alertId);
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? { ...alert, escalated: true }
            : alert
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to escalate alert');
    }
  };

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
    acknowledgeAlert,
    resolveAlert,
    escalateAlert,
  };
};

// Custom hook for threat feeds
export const useThreatFeeds = () => {
  const [feeds, setFeeds] = useState<ThreatFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getThreatFeeds();
      setFeeds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch threat feeds');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeds();
  }, [fetchFeeds]);

  const triggerFetch = async (feedId: string) => {
    try {
      await apiClient.triggerFeedFetch(feedId);
      await fetchFeeds(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger feed fetch');
    }
  };

  return {
    feeds,
    loading,
    error,
    refetch: fetchFeeds,
    triggerFetch,
  };
};

// Custom hook for ML predictions
export const useThreatPrediction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictResolution = async (threatId: string) => {
    try {
      setLoading(true);
      setError(null);
      const prediction = await apiClient.predictThreatResolution(threatId);
      return prediction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    predictResolution,
    loading,
    error,
  };
};