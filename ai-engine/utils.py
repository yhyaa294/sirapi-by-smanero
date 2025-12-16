"""
Utility Functions Module
Common helper functions for the Smart Safety Vision system
"""

import cv2
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import Tuple, List, Dict, Any
import logging

logger = logging.getLogger(__name__)


def draw_bbox(image: np.ndarray, bbox: List[float], label: str, 
              confidence: float, color: Tuple[int, int, int] = (0, 255, 0),
              thickness: int = 2) -> np.ndarray:
    """
    Draw bounding box with label on image
    
    Args:
        image: Input image
        bbox: Bounding box coordinates [x1, y1, x2, y2]
        label: Label text
        confidence: Confidence score
        color: Box color in BGR format
        thickness: Line thickness
        
    Returns:
        Image with drawn bounding box
    """
    x1, y1, x2, y2 = map(int, bbox)
    
    # Draw rectangle
    cv2.rectangle(image, (x1, y1), (x2, y2), color, thickness)
    
    # Prepare label text
    label_text = f"{label} {confidence:.2f}"
    
    # Get text size
    (text_width, text_height), baseline = cv2.getTextSize(
        label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
    )
    
    # Draw label background
    cv2.rectangle(
        image,
        (x1, y1 - text_height - baseline - 10),
        (x1 + text_width + 10, y1),
        color,
        -1
    )
    
    # Draw label text
    cv2.putText(
        image,
        label_text,
        (x1 + 5, y1 - 5),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2
    )
    
    return image


def get_violation_color(violation_type: str) -> Tuple[int, int, int]:
    """
    Get color for violation type
    
    Args:
        violation_type: Type of violation
        
    Returns:
        BGR color tuple
    """
    colors = {
        'no_helmet': (0, 0, 255),      # Red
        'no_vest': (0, 165, 255),      # Orange
        'no_gloves': (0, 255, 255),    # Yellow
        'helmet': (0, 255, 0),         # Green
        'vest': (0, 255, 0),           # Green
        'gloves': (0, 255, 0),         # Green
        'person': (255, 0, 0),         # Blue
    }
    
    return colors.get(violation_type, (128, 128, 128))  # Gray default


def save_frame(frame: np.ndarray, output_dir: str = "logs/violations",
               prefix: str = "violation") -> str:
    """
    Save frame to file with timestamp
    
    Args:
        frame: Image frame to save
        output_dir: Output directory
        prefix: Filename prefix
        
    Returns:
        Path to saved file
    """
    # Create directory if it doesn't exist
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    filename = f"{prefix}_{timestamp}.jpg"
    filepath = Path(output_dir) / filename
    
    # Save image
    cv2.imwrite(str(filepath), frame)
    logger.info(f"Frame saved: {filepath}")
    
    return str(filepath)


def resize_frame(frame: np.ndarray, width: int = None, height: int = None,
                 maintain_aspect: bool = True) -> np.ndarray:
    """
    Resize frame to specified dimensions
    
    Args:
        frame: Input frame
        width: Target width
        height: Target height
        maintain_aspect: Whether to maintain aspect ratio
        
    Returns:
        Resized frame
    """
    if width is None and height is None:
        return frame
    
    h, w = frame.shape[:2]
    
    if maintain_aspect:
        if width is not None:
            ratio = width / w
            new_width = width
            new_height = int(h * ratio)
        else:
            ratio = height / h
            new_height = height
            new_width = int(w * ratio)
    else:
        new_width = width or w
        new_height = height or h
    
    resized = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
    return resized


def calculate_iou(box1: List[float], box2: List[float]) -> float:
    """
    Calculate Intersection over Union (IoU) between two bounding boxes
    
    Args:
        box1: First bounding box [x1, y1, x2, y2]
        box2: Second bounding box [x1, y1, x2, y2]
        
    Returns:
        IoU score
    """
    x1_1, y1_1, x2_1, y2_1 = box1
    x1_2, y1_2, x2_2, y2_2 = box2
    
    # Calculate intersection area
    x1_i = max(x1_1, x1_2)
    y1_i = max(y1_1, y1_2)
    x2_i = min(x2_1, x2_2)
    y2_i = min(y2_1, y2_2)
    
    if x2_i < x1_i or y2_i < y1_i:
        return 0.0
    
    intersection = (x2_i - x1_i) * (y2_i - y1_i)
    
    # Calculate union area
    area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
    area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
    union = area1 + area2 - intersection
    
    # Calculate IoU
    iou = intersection / union if union > 0 else 0.0
    
    return iou


def is_wearing_ppe(detections: List[Dict], person_bbox: List[float],
                   ppe_type: str, iou_threshold: float = 0.3) -> bool:
    """
    Check if person is wearing specific PPE item
    
    Args:
        detections: List of all detections
        person_bbox: Person's bounding box
        ppe_type: Type of PPE to check (e.g., 'helmet')
        iou_threshold: Minimum IoU to consider PPE as worn
        
    Returns:
        True if wearing PPE, False otherwise
    """
    for detection in detections:
        if detection['class'] == ppe_type:
            ppe_bbox = detection['bbox']
            iou = calculate_iou(person_bbox, ppe_bbox)
            
            if iou > iou_threshold:
                return True
    
    return False


def format_timestamp(timestamp: datetime = None, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Format timestamp to string
    
    Args:
        timestamp: Datetime object (default: now)
        format_str: Format string
        
    Returns:
        Formatted timestamp string
    """
    if timestamp is None:
        timestamp = datetime.now()
    
    return timestamp.strftime(format_str)


def create_info_overlay(frame: np.ndarray, info: Dict[str, Any],
                       position: str = "top-left") -> np.ndarray:
    """
    Create information overlay on frame
    
    Args:
        frame: Input frame
        info: Dictionary with information to display
        position: Position of overlay (top-left, top-right, bottom-left, bottom-right)
        
    Returns:
        Frame with overlay
    """
    overlay = frame.copy()
    h, w = frame.shape[:2]
    
    # Prepare text lines
    lines = []
    for key, value in info.items():
        lines.append(f"{key}: {value}")
    
    # Calculate overlay size
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.6
    thickness = 2
    padding = 10
    
    max_width = 0
    total_height = padding
    
    for line in lines:
        (text_width, text_height), baseline = cv2.getTextSize(line, font, font_scale, thickness)
        max_width = max(max_width, text_width)
        total_height += text_height + baseline + 5
    
    # Determine position
    if position == "top-left":
        x, y = padding, padding
    elif position == "top-right":
        x, y = w - max_width - padding * 2, padding
    elif position == "bottom-left":
        x, y = padding, h - total_height - padding
    else:  # bottom-right
        x, y = w - max_width - padding * 2, h - total_height - padding
    
    # Draw semi-transparent background
    cv2.rectangle(
        overlay,
        (x, y),
        (x + max_width + padding * 2, y + total_height),
        (0, 0, 0),
        -1
    )
    
    # Blend overlay with original frame
    alpha = 0.6
    frame = cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0)
    
    # Draw text
    current_y = y + padding + 20
    for line in lines:
        cv2.putText(
            frame,
            line,
            (x + padding, current_y),
            font,
            font_scale,
            (255, 255, 255),
            thickness
        )
        current_y += 25
    
    return frame


def get_camera_source(source: Any) -> Any:
    """
    Parse camera source input
    
    Args:
        source: Camera source (int, string, or path)
        
    Returns:
        Parsed camera source
    """
    # If it's already an integer, return it
    if isinstance(source, int):
        return source
    
    # If it's a string that represents a number, convert to int
    if isinstance(source, str) and source.isdigit():
        return int(source)
    
    # Otherwise, return as is (URL or file path)
    return source


def calculate_fps(start_time: float, frame_count: int) -> float:
    """
    Calculate frames per second
    
    Args:
        start_time: Start time in seconds
        frame_count: Number of frames processed
        
    Returns:
        FPS value
    """
    import time
    elapsed_time = time.time() - start_time
    
    if elapsed_time > 0:
        return frame_count / elapsed_time
    
    return 0.0


def validate_bbox(bbox: List[float], img_width: int, img_height: int) -> bool:
    """
    Validate bounding box coordinates
    
    Args:
        bbox: Bounding box [x1, y1, x2, y2]
        img_width: Image width
        img_height: Image height
        
    Returns:
        True if valid, False otherwise
    """
    x1, y1, x2, y2 = bbox
    
    if x1 < 0 or y1 < 0 or x2 > img_width or y2 > img_height:
        return False
    
    if x2 <= x1 or y2 <= y1:
        return False
    
    return True


if __name__ == "__main__":
    # Test utility functions
    print("Testing utility functions...")
    
    # Test color function
    print(f"Violation color (no_helmet): {get_violation_color('no_helmet')}")
    
    # Test timestamp
    print(f"Current timestamp: {format_timestamp()}")
    
    # Test IoU calculation
    box1 = [100, 100, 200, 200]
    box2 = [150, 150, 250, 250]
    iou = calculate_iou(box1, box2)
    print(f"IoU between boxes: {iou:.2f}")
    
    print("✅ All tests passed!")
