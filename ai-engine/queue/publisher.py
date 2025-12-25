"""
SmartAPD Detection Queue Publisher

Publishes AI detections to Redis Stream for reliable backend ingestion.
Falls back to direct HTTP if Redis is unavailable.
"""

import os
import json
import time
import logging
from typing import Dict, Any, Optional
from datetime import datetime

# Try redis import
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

import requests

logger = logging.getLogger(__name__)

class DetectionPublisher:
    """Publishes detection events to queue or HTTP backend."""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self.stream_name = "detections:stream"
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:8080/api/v1/detections")
        self.redis_url = os.getenv("REDIS_URL", "")
        
        self._init_redis()
    
    def _init_redis(self):
        """Initialize Redis connection if available."""
        if not REDIS_AVAILABLE:
            logger.warning("redis-py not installed, using HTTP fallback")
            return
        
        if not self.redis_url:
            logger.info("REDIS_URL not set, using HTTP fallback")
            return
        
        try:
            self.redis_client = redis.from_url(self.redis_url)
            self.redis_client.ping()
            logger.info("✅ Redis connected for queue publisher")
        except Exception as e:
            logger.warning(f"Redis connection failed, using HTTP fallback: {e}")
            self.redis_client = None
    
    def publish(self, detection: Dict[str, Any]) -> bool:
        """
        Publish a detection event.
        
        Args:
            detection: Detection data with keys:
                - camera_id: int
                - classes: list[str]
                - boxes: list[list[int]]
                - confidence: list[float]
                - image_path: str
                - is_violation: bool
                - violation_type: str
                - location: str
        
        Returns:
            True if published successfully, False otherwise.
        """
        # Generate unique detection ID
        detection_id = f"{int(time.time() * 1000)}-{detection.get('camera_id', 0)}"
        
        message = {
            "detection_id": detection_id,
            "camera_id": detection.get("camera_id", 0),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "classes": detection.get("classes", []),
            "boxes": detection.get("boxes", []),
            "confidence": detection.get("confidence", []),
            "image_path": detection.get("image_path", ""),
            "model_version": os.getenv("MODEL_VERSION", "yolov8-ppe-v1"),
            "is_violation": detection.get("is_violation", False),
            "violation_type": detection.get("violation_type", ""),
            "location": detection.get("location", ""),
        }
        
        # Try Redis first
        if self.redis_client:
            return self._publish_redis(message)
        
        # Fall back to HTTP
        return self._publish_http(message)
    
    def _publish_redis(self, message: Dict[str, Any]) -> bool:
        """Publish to Redis Stream."""
        try:
            self.redis_client.xadd(
                self.stream_name,
                {"data": json.dumps(message)},
                maxlen=10000  # Keep last 10k messages
            )
            logger.debug(f"Published to Redis: {message['detection_id']}")
            return True
        except Exception as e:
            logger.error(f"Redis publish failed: {e}")
            # Fall back to HTTP
            return self._publish_http(message)
    
    def _publish_http(self, message: Dict[str, Any]) -> bool:
        """Publish via HTTP to backend."""
        try:
            # Transform to backend expected format
            payload = {
                "camera_id": message["camera_id"],
                "violation_type": message["violation_type"],
                "confidence": max(message["confidence"]) if message["confidence"] else 0,
                "image_path": message["image_path"],
                "location": message["location"],
                "detected_at": message["timestamp"],
                "is_violation": message["is_violation"],
            }
            
            response = requests.post(
                self.backend_url,
                json=payload,
                timeout=5
            )
            
            if response.ok:
                logger.debug(f"Published via HTTP: {message['detection_id']}")
                return True
            else:
                logger.error(f"HTTP publish failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"HTTP publish error: {e}")
            return False
    
    def get_queue_length(self) -> int:
        """Get current queue length (Redis only)."""
        if self.redis_client:
            try:
                return self.redis_client.xlen(self.stream_name)
            except:
                return 0
        return 0


# Singleton instance
_publisher: Optional[DetectionPublisher] = None

def get_publisher() -> DetectionPublisher:
    """Get or create singleton publisher instance."""
    global _publisher
    if _publisher is None:
        _publisher = DetectionPublisher()
    return _publisher


def publish_detection(detection: Dict[str, Any]) -> bool:
    """Convenience function to publish detection."""
    return get_publisher().publish(detection)
