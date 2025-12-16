""

import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import logging
from ultralytics import YOLO

from utils import (
    draw_bbox, get_violation_color, save_frame,
    is_wearing_ppe, validate_bbox
)

logger = logging.getLogger(__name__)


class PPEDetector:
    
    
    def __init__(self, model_path: str, confidence: float = 0.5,
                 iou_threshold: float = 0.45, device: str = 'cpu'):
        """
        Initialize PPE detector
        
        Args:
            model_path: Path to YOLOv8 model weights
            confidence: Confidence threshold for detections
            iou_threshold: IoU threshold for NMS
            device: Device to run inference on ('cpu' or 'cuda')
        """
        self.model_path = model_path
        self.confidence = confidence
        self.iou_threshold = iou_threshold
        self.device = device
        
        # Load model
        self.model = self._load_model()
        
        # Detection classes
        self.ppe_classes = ['helmet', 'vest', 'gloves', 'boots']
        self.violation_classes = ['no_helmet', 'no_vest', 'no_gloves']
        self.person_class = 'person'
        
        # Statistics
        self.total_detections = 0
        self.total_violations = 0
        
        logger.info(f"PPE Detector initialized with model: {model_path}")
    
    def _load_model(self) -> YOLO:
       
        try:
            if not Path(self.model_path).exists():
                logger.warning(f"Model not found at {self.model_path}, using default YOLOv8n")
                model = YOLO('yolov8n.pt')
            else:
                model = YOLO(self.model_path)
            
            logger.info(f"Model loaded successfully on {self.device}")
            return model
        
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def detect(self, frame: np.ndarray, visualize: bool = True) -> Tuple[np.ndarray, List[Dict]]:
        """
        Perform PPE detection on frame
        
        Args:
            frame: Input frame (BGR format)
            visualize: Whether to draw bounding boxes on frame
            
        Returns:
            Tuple of (annotated frame, list of detections)
        """
        # Run inference
        results = self.model(frame, conf=self.confidence, iou=self.iou_threshold,
                           device=self.device, verbose=False)
        
        # Parse results
        detections = self._parse_results(results[0])
        
        # Analyze PPE compliance
        compliance_results = self._analyze_compliance(detections)
        
        # Update statistics
        self.total_detections += 1
        if compliance_results['violations']:
            self.total_violations += len(compliance_results['violations'])
        
        # Visualize if requested
        if visualize:
            frame = self._draw_detections(frame, detections, compliance_results)
        
        return frame, compliance_results
    
    def _parse_results(self, result) -> List[Dict]:
        """
        Parse YOLO detection results
        
        Args:
            result: YOLO result object
            
        Returns:
            List of detection dictionaries
        """
        detections = []
        
        if result.boxes is None or len(result.boxes) == 0:
            return detections
        
        boxes = result.boxes.xyxy.cpu().numpy()
        confidences = result.boxes.conf.cpu().numpy()
        class_ids = result.boxes.cls.cpu().numpy().astype(int)
        
        for i, (box, conf, cls_id) in enumerate(zip(boxes, confidences, class_ids)):
            # Get class name
            class_name = result.names[cls_id]
            
            detection = {
                'id': i,
                'class': class_name,
                'confidence': float(conf),
                'bbox': box.tolist(),
                'class_id': int(cls_id)
            }
            
            detections.append(detection)
        
        return detections
    
    def _analyze_compliance(self, detections: List[Dict]) -> Dict[str, Any]:
        """
        Analyze PPE compliance from detections
        
        Args:
            detections: List of detections
            
        Returns:
            Dictionary with compliance analysis
        """
        persons = [d for d in detections if d['class'] == self.person_class]
        ppe_items = [d for d in detections if d['class'] in self.ppe_classes]
        violations_detected = [d for d in detections if d['class'] in self.violation_classes]
        
        violations = []
        compliant_persons = []
        
        # Check each person for PPE compliance
        for person in persons:
            person_violations = []
            
            # Check for helmet
            if not is_wearing_ppe(ppe_items, person['bbox'], 'helmet', iou_threshold=0.3):
                # Check if explicitly detected as no_helmet
                has_no_helmet = any(
                    d['class'] == 'no_helmet' and 
                    self._boxes_overlap(person['bbox'], d['bbox'])
                    for d in violations_detected
                )
                
                if has_no_helmet or len(violations_detected) > 0:
                    person_violations.append({
                        'type': 'no_helmet',
                        'person_bbox': person['bbox'],
                        'confidence': person['confidence']
                    })
            
            # Check for vest
            if not is_wearing_ppe(ppe_items, person['bbox'], 'vest', iou_threshold=0.3):
                has_no_vest = any(
                    d['class'] == 'no_vest' and 
                    self._boxes_overlap(person['bbox'], d['bbox'])
                    for d in violations_detected
                )
                
                if has_no_vest:
                    person_violations.append({
                        'type': 'no_vest',
                        'person_bbox': person['bbox'],
                        'confidence': person['confidence']
                    })
            
            # Add to violations or compliant list
            if person_violations:
                violations.extend(person_violations)
            else:
                compliant_persons.append(person)
        
        # Also add explicitly detected violations
        for violation in violations_detected:
            violations.append({
                'type': violation['class'],
                'person_bbox': violation['bbox'],
                'confidence': violation['confidence']
            })
        
        return {
            'total_persons': len(persons),
            'compliant_persons': len(compliant_persons),
            'violations': violations,
            'violation_count': len(violations),
            'compliance_rate': (len(compliant_persons) / len(persons) * 100) if persons else 100.0,
            'all_detections': detections
        }
    
    def _boxes_overlap(self, box1: List[float], box2: List[float], 
                      threshold: float = 0.1) -> bool:
        """
        Check if two bounding boxes overlap
        
        Args:
            box1: First bounding box
            box2: Second bounding box
            threshold: Minimum IoU to consider overlap
            
        Returns:
            True if boxes overlap, False otherwise
        """
        from utils import calculate_iou
        return calculate_iou(box1, box2) > threshold
    
    def _draw_detections(self, frame: np.ndarray, detections: List[Dict],
                        compliance_results: Dict) -> np.ndarray:
        """
        Draw detection results on frame
        
        Args:
            frame: Input frame
            detections: List of detections
            compliance_results: Compliance analysis results
            
        Returns:
            Annotated frame
        """
        annotated_frame = frame.copy()
        h, w = frame.shape[:2]
        
        # Draw all detections
        for detection in detections:
            bbox = detection['bbox']
            
            # Validate bbox
            if not validate_bbox(bbox, w, h):
                continue
            
            class_name = detection['class']
            confidence = detection['confidence']
            
            # Get color based on class
            color = get_violation_color(class_name)
            
            # Draw bounding box
            annotated_frame = draw_bbox(
                annotated_frame,
                bbox,
                class_name,
                confidence,
                color
            )
        
        # Add summary overlay
        summary = {
            'Total Persons': compliance_results['total_persons'],
            'Compliant': compliance_results['compliant_persons'],
            'Violations': compliance_results['violation_count'],
            'Compliance': f"{compliance_results['compliance_rate']:.1f}%"
        }
        
        from utils import create_info_overlay
        annotated_frame = create_info_overlay(annotated_frame, summary, position='top-left')
        
        return annotated_frame
    
    def process_video(self, video_source: Any, output_path: str = None,
                     show_preview: bool = True, save_violations: bool = True) -> Dict[str, Any]:
        """
        Process video stream for PPE detection
        
        Args:
            video_source: Video source (camera index, file path, or URL)
            output_path: Path to save output video (optional)
            show_preview: Whether to show live preview
            save_violations: Whether to save violation frames
            
        Returns:
            Dictionary with processing statistics
        """
        # Open video source
        cap = cv2.VideoCapture(video_source)
        
        if not cap.isOpened():
            logger.error(f"Failed to open video source: {video_source}")
            return {}
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        logger.info(f"Video source opened: {width}x{height} @ {fps} FPS")
        
        # Initialize video writer if output path provided
        writer = None
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # Processing statistics
        stats = {
            'total_frames': 0,
            'total_violations': 0,
            'violation_frames': []
        }
        
        try:
            while True:
                ret, frame = cap.read()
                
                if not ret:
                    break
                
                stats['total_frames'] += 1
                
                # Perform detection
                annotated_frame, results = self.detect(frame, visualize=True)
                
                # Check for violations
                if results['violations']:
                    stats['total_violations'] += len(results['violations'])
                    
                    # Save violation frame
                    if save_violations:
                        violation_path = save_frame(annotated_frame, prefix='violation')
                        stats['violation_frames'].append(violation_path)
                
                # Write to output video
                if writer:
                    writer.write(annotated_frame)
                
                # Show preview
                if show_preview:
                    cv2.imshow('PPE Detection', annotated_frame)
                    
                    # Break on 'q' key
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
        
        finally:
            cap.release()
            if writer:
                writer.release()
            if show_preview:
                cv2.destroyAllWindows()
        
        logger.info(f"Processing complete: {stats['total_frames']} frames, "
                   f"{stats['total_violations']} violations")
        
        return stats
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get detection statistics
        
        Returns:
            Dictionary with statistics
        """
        return {
            'total_detections': self.total_detections,
            'total_violations': self.total_violations,
            'violation_rate': (self.total_violations / self.total_detections * 100) 
                            if self.total_detections > 0 else 0.0
        }


if __name__ == "__main__":
    # Test detector
    logging.basicConfig(level=logging.INFO)
    
    print("🔍 Testing PPE Detector...")
    
    # Initialize detector (will use default YOLOv8n if custom model not found)
    detector = PPEDetector(
        model_path="models/best.pt",
        confidence=0.5,
        device='cpu'
    )
    
    print("✅ Detector initialized successfully!")
    print("\nTo test with webcam, run:")
    print("  python src/detector.py --webcam")
    print("\nTo test with video file, run:")
    print("  python src/detector.py --video path/to/video.mp4")
