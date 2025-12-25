// SmartAPD API Client Service
// Connects frontend to Go backend API

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// Types
export interface Camera {
  ID: number;  // Backend uses 'ID' (uint) from gorm.Model
  name: string;
  location: string;
  rtsp_url: string;
  status: string;
  resolution: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  last_seen?: string;
  fps?: number;
  latency?: number;
  last_error?: string;
}

export interface DailyReport {
  date: string;
  total_detections: number;
  total_violations: number;
  compliance_rate: number;
  hourly_breakdown: {
    hour: number;
    detections: number;
    violations: number;
  }[];
  top_locations: {
    location: string;
    violations: number;
    risk_score: number;
  }[];
}

// ... (Detection, Alert, Stats interfaces remain the same) ...

// API Functions
export const api = {
  // Stats
  async getStats(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/detections/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      return null;
    }
  },

  async getDetections(limit: number = 50): Promise<Detection[]> {
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

  async getCamera(id: string | number): Promise<Camera | null> {
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

  async createCamera(camera: Partial<Camera>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/cameras`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...camera,
          status: camera.status || 'offline',
          is_active: true,
        }),
      });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  async updateCamera(id: number, camera: Partial<Camera>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/cameras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(camera),
      });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  async deleteCamera(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/cameras/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  async reconnectCamera(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/cameras/${id}/reconnect`, {
        method: 'POST',
      });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
    }
  },

  // Reports
  async getDailyReport(date?: string): Promise<DailyReport | null> {
    try {
      const url = date ? `${API_BASE}/reports/daily?date=${date}` : `${API_BASE}/reports/daily`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch report');
      const data = await res.json();
      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      return null;
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
