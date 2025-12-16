import time
from datetime import datetime
from typing import List, Dict, Any, Optional, TypedDict
from dataclasses import dataclass

# Constants for Operational Hours
OPERATIONAL_START = 8   # 08:00
OPERATIONAL_END = 17    # 17:00

# Type Definitions for structured data
class BoundingBox(TypedDict):
    x1: int
    y1: int
    x2: int
    y2: int

class DetectionData(TypedDict):
    person_id: str
    bbox: BoundingBox
    has_ppe: bool
    confidence: float
    timestamp: Any # Can be float or ISO string

class VerifiedAlert(TypedDict):
    alert_id: str
    person_id: str
    violation_type: str
    alert_type: str    # 'safety' | 'security'
    severity: str      # 'WARNING' | 'CRITICAL'
    status_message: str
    timestamp: float
    duration: float
    bbox: BoundingBox

class SafetyLogicEngine:
    """
    Engine core untuk memproses logika keselamatan kerja (HSE).
    Bertanggung jawab untuk memvalidasi deteksi mentah menjadi alert yang sah
    berdasarkan aturan waktu (temporal) dan lokasi (spatial).
    """

    def __init__(self, min_violation_duration: float = 3.0):
        """
        Inisialisasi SafetyLogicEngine.

        Args:
            min_violation_duration (float): Durasi minimum (detik) pelanggaran 
                                            sebelum dianggap valid alert. Default 3.0s.
        """
        self.min_violation_duration = min_violation_duration
        
        # Melacak waktu mulai pelanggaran: {person_id: start_timestamp}
        self.violation_trackers: Dict[str, float] = {}
        
        # Melacak status alert yang sudah dikirim agar tidak spamming (opsional, untuk state management)
        self.active_alerts: Dict[str, bool] = {}

        # Definisi Safe Zone (Contoh: Area Kantin/Istirahat)
        # Format: x_min, y_min, x_max, y_max
        self.safe_zone = {
            'x_min': 800,
            'y_min': 0,
            'x_max': 1200,
            'y_max': 400
        }

    def _calculate_centroid(self, bbox: BoundingBox) -> tuple[int, int]:
        """Menghitung titik tengah dari bounding box."""
        center_x = int((bbox['x1'] + bbox['x2']) / 2)
        center_y = int((bbox['y1'] + bbox['y2']) / 2)
        return center_x, center_y

    def _check_zone(self, bbox: BoundingBox) -> bool:
        """
        Fitur 2: Zone Filtering (Geofencing).
        Mengecek apakah objek berada di dalam 'Safe Zone'.
        
        Args:
            bbox (BoundingBox): Koordinat objek.
            
        Returns:
            bool: True jika berada di Safe Zone (abaikan pelanggaran), False jika di Danger Zone.
        """
        cx, cy = self._calculate_centroid(bbox)
        
        is_in_x = self.safe_zone['x_min'] <= cx <= self.safe_zone['x_max']
        is_in_y = self.safe_zone['y_min'] <= cy <= self.safe_zone['y_max']
        
        if is_in_x and is_in_y:
            return True # Inside Safe Zone
        return False

    def process_detections(self, detections: List[DetectionData]) -> List[VerifiedAlert]:
        """
        Memproses raw detections dari AI model.
        Menerapkan logika filtering temporal, spatial, dan SECURITY RULES (Jam Operasional).

        Args:
            detections (List[DetectionData]): List deteksi mentah frame saat ini.

        Returns:
            List[VerifiedAlert]: List alert yang sudah divalidasi.
        """
        verified_alerts: List[VerifiedAlert] = []
        
        # Set person_id yang terdeteksi frame ini untuk cleanup nanti
        current_frame_ids = set()

        # Determine Time Context (Use timestamp from first detection if available, else system time)
        current_time_epoch = time.time()
        current_hour = datetime.now().hour
        
        if detections and 'timestamp' in detections[0]:
            ts = detections[0]['timestamp']
            if isinstance(ts, str):
                try:
                    dt = datetime.fromisoformat(ts)
                    current_hour = dt.hour
                    current_time_epoch = dt.timestamp()
                except ValueError:
                    pass # Fallback to system time
            elif isinstance(ts, (int, float)):
                 current_time_epoch = float(ts)
                 current_hour = datetime.fromtimestamp(current_time_epoch).hour

        # Check Operational Hours
        is_operational_hours = OPERATIONAL_START <= current_hour < OPERATIONAL_END
        
        for detection in detections:
            pid = detection['person_id']
            current_frame_ids.add(pid)
            bbox = detection['bbox']
            has_ppe = detection['has_ppe']

            # --- SECURITY & SAFETY LOGIC ---
            
            violation_type = None
            alert_type = 'safety'
            severity = 'WARNING'
            status_message = ""

            if not is_operational_hours:
                # NIGHT MODE / RESTRICTED HOURS LOGIC
                if has_ppe:
                    # Pekerja lembur tanpa izin (Asumsi: jika lembur harusnya terdaftar/khusus, 
                    # tapi untuk rule ini dianggap Unauthorized Overtime)
                    violation_type = "UNAUTHORIZED_OVERTIME"
                    alert_type = "security"
                    severity = "CRITICAL"
                    status_message = "⚠️ UNAUTHORIZED OVERTIME DETECTED"
                else:
                    # Tidak pakai APD di jam malam -> Suspicious / Intruder
                    violation_type = "SECURITY_BREACH"
                    alert_type = "security"
                    severity = "CRITICAL"
                    status_message = "🚨 SECURITY BREACH / POTENTIAL INTRUDER"
            else:
                # STANDARD OPERATIONAL HOURS LOGIC
                if not has_ppe:
                    violation_type = "NO_PPE"
                    alert_type = "safety"
                    severity = "WARNING"
                    status_message = "⚠️ PPE VIOLATION DETECTED"
                else:
                    # Safe in operational hours -> Check Zone
                    if self._check_zone(bbox):
                        # Inside Safe Zone (Kantin/Office) -> OK
                        if pid in self.violation_trackers: del self.violation_trackers[pid]
                        continue
                    
                    # Safe outside zone -> OK
                    if pid in self.violation_trackers: del self.violation_trackers[pid]
                    continue

            # Jika ada violation (baik Safety atau Security)
            if violation_type:
                # 3. Cek Temporal (Debouncing)
                if pid not in self.violation_trackers:
                    self.violation_trackers[pid] = current_time_epoch
                
                start_time = self.violation_trackers[pid]
                duration = current_time_epoch - start_time

                # Security alerts might need faster trigger than safety, but using same duration for now
                if duration >= self.min_violation_duration:
                    alert = VerifiedAlert(
                        alert_id=f"alert_{pid}_{int(current_time_epoch)}",
                        person_id=pid,
                        violation_type=violation_type,
                        alert_type=alert_type,
                        severity=severity,
                        status_message=status_message,
                        timestamp=current_time_epoch,
                        duration=round(duration, 2),
                        bbox=bbox
                    )
                    verified_alerts.append(alert)

        # Cleanup tracker
        ids_to_remove = [pid for pid in self.violation_trackers if pid not in current_frame_ids]
        for pid in ids_to_remove:
            del self.violation_trackers[pid]

        return verified_alerts
