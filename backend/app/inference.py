import cv2
import numpy as np
import onnxruntime as ort
from typing import List, Tuple
from .config import get_settings

settings = get_settings()

# VisDrone class names (10 classes)
CLASS_NAMES = [
    "pedestrian",
    "people",
    "bicycle",
    "car",
    "van",
    "truck",
    "tricycle",
    "awning-tricycle",
    "bus",
    "motor"
]


class YOLOInference:
    def __init__(self, model_path: str):
        """Initialize ONNX Runtime session for YOLO inference."""
        self.session = ort.InferenceSession(model_path)
        self.input_name = self.session.get_inputs()[0].name
        self.input_shape = self.session.get_inputs()[0].shape
        self.output_names = [output.name for output in self.session.get_outputs()]
        
    def preprocess(self, image: np.ndarray, input_size: int = 640) -> Tuple[np.ndarray, float, Tuple[int, int]]:
        """
        Preprocess image for YOLO inference.
        
        Args:
            image: Input image (BGR format from cv2)
            input_size: Model input size (default 640)
            
        Returns:
            Preprocessed image tensor, scale factor, and padding
        """
        # Get original image dimensions
        img_h, img_w = image.shape[:2]
        
        # Calculate scale to fit within input_size while maintaining aspect ratio
        scale = min(input_size / img_h, input_size / img_w)
        new_h, new_w = int(img_h * scale), int(img_w * scale)
        
        # Resize image
        resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        
        # Create padded image (letterbox)
        padded = np.full((input_size, input_size, 3), 114, dtype=np.uint8)
        
        # Calculate padding
        pad_h = (input_size - new_h) // 2
        pad_w = (input_size - new_w) // 2
        
        # Place resized image in center
        padded[pad_h:pad_h + new_h, pad_w:pad_w + new_w] = resized
        
        # Convert to RGB and normalize
        padded = cv2.cvtColor(padded, cv2.COLOR_BGR2RGB)
        padded = padded.astype(np.float32) / 255.0
        
        # Transpose to CHW format and add batch dimension
        padded = np.transpose(padded, (2, 0, 1))
        padded = np.expand_dims(padded, axis=0)
        
        return padded, scale, (pad_w, pad_h)
    
    def postprocess(
        self,
        outputs: List[np.ndarray],
        scale: float,
        padding: Tuple[int, int],
        conf_threshold: float = 0.25,
        iou_threshold: float = 0.45
    ) -> List[dict]:
        """
        Post-process YOLO output to get final detections.
        
        Args:
            outputs: Raw model outputs
            scale: Scale factor from preprocessing
            padding: Padding values (pad_w, pad_h)
            conf_threshold: Confidence threshold
            iou_threshold: IoU threshold for NMS
            
        Returns:
            List of detection dictionaries
        """
        # YOLO11 output format: [batch, num_boxes, num_classes + 4]
        # First 4 values are bounding box coordinates (x_center, y_center, w, h)
        # Remaining values are class probabilities
        
        predictions = outputs[0]  # Get first output
        
        # Handle different output shapes
        if len(predictions.shape) == 3:
            predictions = predictions[0]  # Remove batch dimension if present
        
        # Transpose if needed (some ONNX exports have different shapes)
        if predictions.shape[0] == 14:  # [14, 8400] format
            predictions = predictions.T  # Convert to [8400, 14]
        
        # Split into boxes and class scores
        boxes = predictions[:, :4]  # x_center, y_center, w, h
        scores = predictions[:, 4:]  # class scores
        
        # Get class with max score and filter by confidence
        class_ids = np.argmax(scores, axis=1)
        confidences = np.max(scores, axis=1)
        
        mask = confidences > conf_threshold
        boxes = boxes[mask]
        confidences = confidences[mask]
        class_ids = class_ids[mask]
        
        if len(boxes) == 0:
            return []
        
        # Convert from center format to corner format
        pad_w, pad_h = padding
        x_center = boxes[:, 0]
        y_center = boxes[:, 1]
        w = boxes[:, 2]
        h = boxes[:, 3]
        
        # Convert to x1, y1, x2, y2 and adjust for padding/scaling
        x1 = (x_center - w / 2 - pad_w) / scale
        y1 = (y_center - h / 2 - pad_h) / scale
        x2 = (x_center + w / 2 - pad_w) / scale
        y2 = (y_center + h / 2 - pad_h) / scale
        
        # Stack into boxes array
        boxes_xyxy = np.stack([x1, y1, x2, y2], axis=1)
        
        # Apply NMS
        indices = cv2.dnn.NMSBoxes(
            boxes_xyxy.tolist(),
            confidences.tolist(),
            conf_threshold,
            iou_threshold
        )
        
        detections = []
        if len(indices) > 0:
            for i in indices.flatten():
                detections.append({
                    "class_id": int(class_ids[i]),
                    "class_name": CLASS_NAMES[class_ids[i]],
                    "confidence": float(confidences[i]),
                    "bbox": {
                        "x1": float(boxes_xyxy[i, 0]),
                        "y1": float(boxes_xyxy[i, 1]),
                        "x2": float(boxes_xyxy[i, 2]),
                        "y2": float(boxes_xyxy[i, 3])
                    }
                })
        
        return detections
    
    def predict(
        self,
        image_path: str,
        conf_threshold: float = None,
        iou_threshold: float = None
    ) -> List[dict]:
        """
        Run inference on an image.
        
        Args:
            image_path: Path to input image
            conf_threshold: Confidence threshold (uses config default if None)
            iou_threshold: IoU threshold for NMS (uses config default if None)
            
        Returns:
            List of detection dictionaries
        """
        if conf_threshold is None:
            conf_threshold = settings.conf_threshold
        if iou_threshold is None:
            iou_threshold = settings.iou_threshold
            
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Failed to load image: {image_path}")
        
        # Preprocess
        input_tensor, scale, padding = self.preprocess(image)
        
        # Run inference
        outputs = self.session.run(self.output_names, {self.input_name: input_tensor})
        
        # Postprocess
        detections = self.postprocess(outputs, scale, padding, conf_threshold, iou_threshold)
        
        return detections


# Global inference engine instance
_inference_engine = None


def get_inference_engine() -> YOLOInference:
    """Get or create the global inference engine instance."""
    global _inference_engine
    if _inference_engine is None:
        _inference_engine = YOLOInference(settings.model_path)
    return _inference_engine
