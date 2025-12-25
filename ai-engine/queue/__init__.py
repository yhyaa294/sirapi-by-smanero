"""
Queue module for SmartAPD AI Engine.
Provides reliable message publishing to backend.
"""

from .publisher import (
    DetectionPublisher,
    get_publisher,
    publish_detection,
)

__all__ = [
    "DetectionPublisher",
    "get_publisher", 
    "publish_detection",
]
