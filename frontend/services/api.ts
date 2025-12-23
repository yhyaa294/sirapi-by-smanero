// SmartAPD API Client Service
// Connects frontend to Go backend API

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Types
export interface Camera {
  id: string;
  name: string;
  location: string;
  rtspUrl: string;
  status: 'online' | 'offline';
  zone: string;
}

export interface Detection {
  id: string;
  cameraId: string;
  type: string; // NO_HELMET, NO_VEST, NO_GLOVES, etc.
  timestamp: string;
  severity: 'BAHAYA' | 'PERINGATAN' | 'AMAN';
  imageUrl?: string;
  acknowledged: boolean;
}

export interface Alert {
  id: string;
  detectionId: string;
  type: string;
  zone: string;
  timestamp: string;
  severity: string;
  status: 'open' | 'acknowledged' | 'resolved';
}

export interface Stats {
  compliance: number;
  totalDetections: number;
  violationsToday: number;
  workersActive: number;
}

// Risk types for heatmap
export interface RiskArea {
  camera: string;
  location: string;
  riskScore: number;
  totalViolations: number;
  recentViolations: number;
  topViolations?: string[];
  shiftRisks?: { shift: string; riskScore: number }[];
}

export interface RiskMap {
  areas: RiskArea[];
  generated_at: string;
  summary: {
    total_areas: number;
    average_risk: number;
    highest_risk: {
      location: string;
      riskScore: number;
      trend: string;
    };
  };
}

// API Functions
export const api = {
  // Health check
  async health() {
    const res = await fetch(`${API_BASE.replace('/api/v1', '')}/health`);
    return res.json();
  },

  // Cameras
  async getCameras(): Promise<Camera[]> {
    try {
      const res = await fetch(`${API_BASE}/cameras`);
      if (!res.ok) throw new Error('Failed to fetch cameras');
      const data = await res.json();
      return data.data || [];
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async getCamera(id: string): Promise<Camera | null> {
    try {
      const res = await fetch(`${API_BASE}/cameras/${id}`);
      if (!res.ok) throw new Error('Camera not found');
      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  // Detections
  async getDetections(limit = 50): Promise<Detection[]> {
    try {
      const res = await fetch(`${API_BASE}/detections?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch detections');
      const data = await res.json();
      return data.data || [];
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async getDetectionStats(): Promise<Stats> {
    try {
      const res = await fetch(`${API_BASE}/detections/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const json = await res.json();
      const data = json.data || {};

      // Map backend fields to frontend Stats interface
      // Backend returns: TotalDetections, TotalViolations, ComplianceRate, ByViolationType
      // Frontend expects: compliance, totalDetections, violationsToday, workersActive
      return {
        compliance: data.ComplianceRate ?? data.compliance ?? 94.2,
        totalDetections: data.TotalDetections ?? data.totalDetections ?? 0,
        violationsToday: data.TotalViolations ?? data.violationsToday ?? 0,
        workersActive: data.workersActive ?? 248 // Backend doesn't track this, use default
      };
    } catch (error) {
      console.error('API Error:', error);
      // Return mock data if backend not available
      return { compliance: 94.2, totalDetections: 1247, violationsToday: 12, workersActive: 248 };
    }
  },

  // Alerts
  async getAlerts(status?: string): Promise<Alert[]> {
    try {
      const url = status ? `${API_BASE}/alerts?status=${status}` : `${API_BASE}/alerts`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const data = await res.json();
      return data.data || [];
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async acknowledgeAlert(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, { method: 'PUT' });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  // Reports
  async getDailyReport(date?: string) {
    try {
      const url = date ? `${API_BASE}/reports/daily?date=${date}` : `${API_BASE}/reports/daily`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch daily report');
      return res.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  async getWeeklyReport() {
    try {
      const res = await fetch(`${API_BASE}/reports/weekly`);
      if (!res.ok) throw new Error('Failed to fetch weekly report');
      return res.json();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  async exportReport(format: 'pdf' | 'excel', type: 'daily' | 'weekly' | 'monthly') {
    try {
      const res = await fetch(`${API_BASE}/reports/export?format=${format}&type=${type}`);
      if (!res.ok) throw new Error('Failed to export report');
      return res.blob();
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  // Create Detection (for Demo Mode)
  async createDetection(detection: {
    camera_id: number;
    violation_type: string;
    confidence: number;
    image_path?: string;
    location: string;
    is_violation: boolean;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/detections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...detection,
          detected_at: new Date().toISOString(),
        }),
      });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  // Create Alert
  async createAlert(alert: {
    detection_id: number;
    severity: string;
    message: string;
    status?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...alert,
          status: alert.status || 'pending',
        }),
      });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  // Telegram Settings (via backend config endpoint)
  async updateTelegramSettings(settings: {
    bot_token: string;
    chat_id: string;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/settings/telegram`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  // Test Telegram Connection
  async testTelegram(settings: {
    bot_token: string;
    chat_id: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/settings/telegram/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      return { success: res.ok, message: data.message || (res.ok ? 'Connected!' : 'Failed') };
    } catch (error) {
      console.error('API Error:', error);
      return { success: false, message: 'Connection failed' };
    }
  },

  // Send Telegram Notification
  async sendTelegramNotification(notification: {
    type: 'violation' | 'daily_summary' | 'system';
    data: Record<string, unknown>;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/notifications/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  // Create Camera
  async createCamera(camera: {
    name: string;
    location: string;
    rtsp_url?: string;
    status?: string;
    resolution?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/cameras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...camera,
          status: camera.status || 'online',
          resolution: camera.resolution || '1920x1080',
          is_active: true,
        }),
      });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },
};

// WebSocket Connection for Real-time Updates
export class RealtimeConnection {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data.payload);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        this.emit('disconnected', {});
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), 3000 * this.reconnectAttempts);
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export singleton instance
export const realtime = new RealtimeConnection();
