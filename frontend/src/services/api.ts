const API_BASE_URL = 'http://localhost:8001/api';
const ML_API_URL = 'http://localhost:8000';

// API client configuration
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.request<{ access: string; refresh: string }>('/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.token = response.access;
    localStorage.setItem('authToken', response.access);
    localStorage.setItem('refreshToken', response.refresh);
    
    return response;
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  // Dashboard Analytics
  async getDashboardStats() {
    return this.request<DashboardStats>('/analytics/dashboard/dashboard_stats/');
  }

  // Threats
  async getThreats(params?: ThreatFilters) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<PaginatedResponse<Threat>>(`/threats/threats/?${queryString}`);
  }

  async getThreatById(id: string) {
    return this.request<Threat>(`/threats/threats/${id}/`);
  }

  async markThreatFalsePositive(id: string) {
    return this.request(`/threats/threats/${id}/mark_false_positive/`, {
      method: 'POST',
    });
  }

  async reprocessThreatWithAI(id: string) {
    return this.request(`/threats/threats/${id}/reprocess_ai/`, {
      method: 'POST',
    });
  }

  // Alerts
  async getAlerts(params?: AlertFilters) {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    return this.request<PaginatedResponse<Alert>>(`/alerts/alerts/?${queryString}`);
  }

  async acknowledgeAlert(id: string) {
    return this.request(`/alerts/alerts/${id}/acknowledge/`, {
      method: 'POST',
    });
  }

  async resolveAlert(id: string) {
    return this.request(`/alerts/alerts/${id}/resolve/`, {
      method: 'POST',
    });
  }

  async escalateAlert(id: string) {
    return this.request(`/alerts/alerts/${id}/escalate/`, {
      method: 'POST',
    });
  }

  // ML Predictions
  async predictThreatResolution(threatId: string) {
    return this.request<ThreatPrediction>('/analytics/dashboard/predict_threat_resolution/', {
      method: 'POST',
      body: JSON.stringify({ threat_id: threatId }),
    });
  }

  // Threat Feeds
  async getThreatFeeds() {
    return this.request<ThreatFeed[]>('/threats/feeds/');
  }

  async triggerFeedFetch(feedId: string) {
    return this.request(`/threats/feeds/${feedId}/fetch_now/`, {
      method: 'POST',
    });
  }
}

// ML Model API client
class MLApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`ML API error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`ML API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async getHealth() {
    return this.request<MLHealthResponse>('/health');
  }

  async predict(data: ThreatPredictionRequest) {
    return this.request<ThreatPredictionResponse>('/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getModelInfo() {
    return this.request<MLModelInfo>('/model-info');
  }
}

// Type definitions
export interface DashboardStats {
  total_threats: number;
  critical_threats: number;
  high_threats: number;
  medium_threats: number;
  low_threats: number;
  resolved_threats: number;
  false_positives: number;
  avg_resolution_time: number;
  threat_trend: Array<{ date: string; threats: number }>;
  threat_types_distribution: Record<string, number>;
  top_sources: Array<{ source: string; count: number }>;
  model_accuracy: number;
  prediction_confidence: number;
  active_feeds: number;
  last_update: string;
}

export interface Threat {
  id: string;
  title: string;
  description: string;
  threat_type: string;
  severity: number;
  risk_score: number;
  source: string;
  date_detected: string;
  is_active: boolean;
  is_false_positive: boolean;
  ai_classification: string;
  incident_response_suggestion: string;
  created_at: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  alert_type: string;
  priority: number;
  status: string;
  assigned_to: string | null;
  threat: string;
  created_at: string;
  escalated: boolean;
}

export interface ThreatPrediction {
  id: string;
  threat: string;
  predicted_resolution_time: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  risk_level: string;
  model_used: string;
  prediction_date: string;
}

export interface ThreatFeed {
  id: string;
  name: string;
  feed_type: string;
  is_active: boolean;
  last_fetched: string | null;
  total_threats_imported: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ThreatFilters {
  threat_type?: string;
  severity_min?: number;
  severity_max?: number;
  is_active?: boolean;
  search?: string;
}

export interface AlertFilters {
  status?: string;
  priority?: number;
  alert_type?: string;
  assigned_to?: string;
}

export interface ThreatPredictionRequest {
  country: string;
  year: number;
  attack_type: string;
  target_industry: string;
  financial_loss: number;
  affected_users: number;
  attack_source: string;
  vulnerability_type: string;
  defense_mechanism: string;
}

export interface ThreatPredictionResponse {
  predicted_resolution_time: number;
  confidence_interval: {
    lower_bound: number;
    upper_bound: number;
  };
  risk_level: string;
  recommendations: string[];
  model_used: string;
}

export interface MLHealthResponse {
  status: string;
  message: string;
  model_loaded: boolean;
}

export interface MLModelInfo {
  model_loaded: boolean;
  model_name: string | null;
  features_count: number;
}

// Export configured clients
export const apiClient = new ApiClient(API_BASE_URL);
export const mlApiClient = new MLApiClient(ML_API_URL);