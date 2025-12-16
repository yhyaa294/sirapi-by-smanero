"""
Database Management Module
Handles SQLite database operations for logging detections and violations
"""

import sqlite3
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)


class Database:
    """Database manager for PPE detection system"""
    
    def __init__(self, db_path: str = "logs/detections.db"):
        """
        Initialize database connection
        
        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        
        # Create directory if it doesn't exist
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize database
        self.conn = None
        self.connect()
        self.create_tables()
    
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self.conn.row_factory = sqlite3.Row  # Enable column access by name
            logger.info(f"Connected to database: {self.db_path}")
        except sqlite3.Error as e:
            logger.error(f"Database connection error: {e}")
            raise
    
    def create_tables(self):
        """Create necessary database tables"""
        cursor = self.conn.cursor()
        
        # Detections table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                camera_source TEXT,
                total_persons INTEGER,
                compliant_persons INTEGER,
                violations INTEGER,
                detection_data TEXT,
                frame_path TEXT
            )
        ''')
        
        # Violations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS violations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                camera_source TEXT,
                violation_type TEXT,
                person_id INTEGER,
                confidence REAL,
                bbox TEXT,
                image_path TEXT,
                alert_sent BOOLEAN DEFAULT 0,
                resolved BOOLEAN DEFAULT 0,
                notes TEXT
            )
        ''')
        
        # Statistics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS statistics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE DEFAULT CURRENT_DATE,
                total_detections INTEGER DEFAULT 0,
                total_violations INTEGER DEFAULT 0,
                compliance_rate REAL DEFAULT 0.0,
                camera_source TEXT
            )
        ''')
        
        # Alerts table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                violation_id INTEGER,
                alert_type TEXT,
                recipient TEXT,
                status TEXT,
                message TEXT,
                FOREIGN KEY (violation_id) REFERENCES violations(id)
            )
        ''')
        
        self.conn.commit()
        logger.info("Database tables created/verified successfully")
    
    def log_detection(self, camera_source: str, total_persons: int, 
                     compliant_persons: int, violations: int,
                     detection_data: Dict[str, Any], frame_path: str = None) -> int:
        """
        Log a detection event
        
        Args:
            camera_source: Camera identifier
            total_persons: Total number of persons detected
            compliant_persons: Number of compliant persons
            violations: Number of violations detected
            detection_data: Detailed detection data (as dict)
            frame_path: Path to saved frame image
            
        Returns:
            ID of inserted record
        """
        cursor = self.conn.cursor()
        
        cursor.execute('''
            INSERT INTO detections 
            (camera_source, total_persons, compliant_persons, violations, detection_data, frame_path)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (camera_source, total_persons, compliant_persons, violations, 
              json.dumps(detection_data), frame_path))
        
        self.conn.commit()
        return cursor.lastrowid
    
    def log_violation(self, camera_source: str, violation_type: str,
                     person_id: int, confidence: float, bbox: List[float],
                     image_path: str = None, notes: str = None) -> int:
        """
        Log a PPE violation
        
        Args:
            camera_source: Camera identifier
            violation_type: Type of violation (e.g., 'no_helmet')
            person_id: Person tracking ID
            confidence: Detection confidence score
            bbox: Bounding box coordinates [x1, y1, x2, y2]
            image_path: Path to violation image
            notes: Additional notes
            
        Returns:
            ID of inserted record
        """
        cursor = self.conn.cursor()
        
        cursor.execute('''
            INSERT INTO violations 
            (camera_source, violation_type, person_id, confidence, bbox, image_path, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (camera_source, violation_type, person_id, confidence, 
              json.dumps(bbox), image_path, notes))
        
        self.conn.commit()
        violation_id = cursor.lastrowid
        
        logger.info(f"Violation logged: {violation_type} (ID: {violation_id})")
        return violation_id
    
    def log_alert(self, violation_id: int, alert_type: str, 
                  recipient: str, status: str, message: str) -> int:
        """
        Log an alert sent for a violation
        
        Args:
            violation_id: ID of the violation
            alert_type: Type of alert (e.g., 'telegram', 'email')
            recipient: Alert recipient
            status: Alert status (e.g., 'sent', 'failed')
            message: Alert message content
            
        Returns:
            ID of inserted record
        """
        cursor = self.conn.cursor()
        
        cursor.execute('''
            INSERT INTO alerts (violation_id, alert_type, recipient, status, message)
            VALUES (?, ?, ?, ?, ?)
        ''', (violation_id, alert_type, recipient, status, message))
        
        self.conn.commit()
        return cursor.lastrowid
    
    def get_violations(self, limit: int = 100, resolved: bool = None,
                      start_date: datetime = None, end_date: datetime = None) -> List[Dict]:
        """
        Retrieve violations from database
        
        Args:
            limit: Maximum number of records to retrieve
            resolved: Filter by resolved status (None = all)
            start_date: Start date filter
            end_date: End date filter
            
        Returns:
            List of violation records
        """
        cursor = self.conn.cursor()
        
        query = "SELECT * FROM violations WHERE 1=1"
        params = []
        
        if resolved is not None:
            query += " AND resolved = ?"
            params.append(resolved)
        
        if start_date:
            query += " AND timestamp >= ?"
            params.append(start_date.isoformat())
        
        if end_date:
            query += " AND timestamp <= ?"
            params.append(end_date.isoformat())
        
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        return [dict(row) for row in rows]
    
    def get_statistics(self, days: int = 7) -> Dict[str, Any]:
        """
        Get detection statistics for the last N days
        
        Args:
            days: Number of days to retrieve statistics for
            
        Returns:
            Dictionary with statistics
        """
        cursor = self.conn.cursor()
        
        start_date = datetime.now() - timedelta(days=days)
        
        # Total detections
        cursor.execute('''
            SELECT COUNT(*) as total_detections,
                   SUM(violations) as total_violations,
                   SUM(compliant_persons) as total_compliant
            FROM detections
            WHERE timestamp >= ?
        ''', (start_date.isoformat(),))
        
        stats = dict(cursor.fetchone())
        
        # Calculate compliance rate
        total_persons = (stats['total_compliant'] or 0) + (stats['total_violations'] or 0)
        if total_persons > 0:
            stats['compliance_rate'] = (stats['total_compliant'] / total_persons) * 100
        else:
            stats['compliance_rate'] = 0.0
        
        # Daily breakdown
        cursor.execute('''
            SELECT DATE(timestamp) as date,
                   COUNT(*) as detections,
                   SUM(violations) as violations
            FROM detections
            WHERE timestamp >= ?
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
        ''', (start_date.isoformat(),))
        
        stats['daily_breakdown'] = [dict(row) for row in cursor.fetchall()]
        
        return stats
    
    def get_violation_types_count(self, days: int = 7) -> List[Dict]:
        """
        Get count of violations by type
        
        Args:
            days: Number of days to analyze
            
        Returns:
            List of violation types with counts
        """
        cursor = self.conn.cursor()
        
        start_date = datetime.now() - timedelta(days=days)
        
        cursor.execute('''
            SELECT violation_type, COUNT(*) as count
            FROM violations
            WHERE timestamp >= ?
            GROUP BY violation_type
            ORDER BY count DESC
        ''', (start_date.isoformat(),))
        
        return [dict(row) for row in cursor.fetchall()]
    
    def mark_violation_resolved(self, violation_id: int, notes: str = None):
        """
        Mark a violation as resolved
        
        Args:
            violation_id: ID of the violation
            notes: Resolution notes
        """
        cursor = self.conn.cursor()
        
        cursor.execute('''
            UPDATE violations
            SET resolved = 1, notes = ?
            WHERE id = ?
        ''', (notes, violation_id))
        
        self.conn.commit()
        logger.info(f"Violation {violation_id} marked as resolved")
    
    def cleanup_old_records(self, days: int = 30):
        """
        Delete records older than specified days
        
        Args:
            days: Number of days to retain
        """
        cursor = self.conn.cursor()
        
        cutoff_date = datetime.now() - timedelta(days=days)
        
        cursor.execute('DELETE FROM detections WHERE timestamp < ?', 
                      (cutoff_date.isoformat(),))
        cursor.execute('DELETE FROM violations WHERE timestamp < ?', 
                      (cutoff_date.isoformat(),))
        cursor.execute('DELETE FROM alerts WHERE timestamp < ?', 
                      (cutoff_date.isoformat(),))
        
        self.conn.commit()
        logger.info(f"Cleaned up records older than {days} days")
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


if __name__ == "__main__":
    # Test database operations
    logging.basicConfig(level=logging.INFO)
    
    db = Database()
    
    # Test logging detection
    detection_id = db.log_detection(
        camera_source="Camera_1",
        total_persons=5,
        compliant_persons=3,
        violations=2,
        detection_data={"test": "data"}
    )
    print(f"Detection logged with ID: {detection_id}")
    
    # Test logging violation
    violation_id = db.log_violation(
        camera_source="Camera_1",
        violation_type="no_helmet",
        person_id=1,
        confidence=0.85,
        bbox=[100, 200, 300, 400]
    )
    print(f"Violation logged with ID: {violation_id}")
    
    # Test getting statistics
    stats = db.get_statistics(days=7)
    print(f"Statistics: {stats}")
    
    db.close()
