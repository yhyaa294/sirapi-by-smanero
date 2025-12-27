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

export interface Detection {
  id: number;
  camera_id: number;
  violation_type: string;
  confidence: number;
  image_path: string;
  location: string;
  detected_at: string;
  created_at: string;
  is_violation: boolean;
  review_status?: string;
  priority?: number;
}

export interface DetectionStats {
  compliance: number;
  totalDetections: number;
  violationsToday: number;
  workersActive: number;
}

export interface Violation {
  id: number;
  camera_id: number;
  violation: string;
  worker: string;
  location: string;
  time: string;
  status: 'resolved' | 'unresolved';
  image: string;
  video: string;
  evidence?: string;
}

export interface AlertAction {
  id?: number;
  alert_id: number;
  action: string;
  level?: string;
  notes?: string;
  actor: string;
  severity: string;
  auto?: boolean;
  evidence?: string;
  timestamp: string;
}

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
      return { compliance: 100, totalDetections: 0, violationsToday: 0, workersActive: 0 };
    }
  },

  // Get Detection Stats (alias for getStats with proper typing)
  async getDetectionStats(): Promise<DetectionStats> {
    return this.getStats();
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

  async deleteDetection(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/detections/${id}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (error) {
      console.error('API Error:', error);
      return false;
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

  // Alerts Workflow Adapter
  async getViolations(limit: number = 50): Promise<Violation[]> {
    try {
      const detections = await this.getDetections(limit);
      return detections
        .filter(d => d.is_violation)
        .map(d => ({
          id: d.id,
          camera_id: d.camera_id,
          violation: d.violation_type,
          worker: 'Unknown Worker', // Placeholder until face rec is active
          location: d.location || 'Area 1',
          time: d.detected_at,
          status: d.review_status === 'resolved' ? 'resolved' : 'unresolved',
          image: d.image_path ? `http://localhost:8000${d.image_path}` : '/placeholder.jpg',
          video: '',
        }));
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  async getAlertActions(): Promise<AlertAction[]> {
    // Mock for now, or implement backend endpoint
    return [];
  },

  async createAlertAction(action: Partial<AlertAction>): Promise<boolean> {
    // Mock call
    console.log('Action created:', action);
    return true;
  },

  async resolveAlert(data: { alert_id: number; actor: string; notes?: string; evidence?: string }): Promise<boolean> {
    // Map to backend delete/update
    return this.deleteDetection(data.alert_id);
  }
};

// WebSocket Connection for Real-time Updates
export class RealtimeConnection {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    const token = localStorage.getItem('auth-token');
    const wsUrl = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws') + (token ? `?token=${token}` : '');

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // Backend sends 'data', internal mocks might use 'payload'. Support both.
          this.emit(msg.type, msg.data || msg.payload);
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
        console.warn("WS Error - ensure Backend is running on port 8080");
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
