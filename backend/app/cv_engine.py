import cv2
import numpy as np

def detect_walls_from_image(image_bytes: bytes) -> list:
    """
    Processes a floor plan image using OpenCV to extract wall vector lines.
    Returns a list of dicts: [{'start': {'x': x1, 'y': y1}, 'end': {'x': x2, 'y': y2}}]
    """
    # 1. Convert raw image bytes into an OpenCV matrix image
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        return []

    # 2. Preprocessing: Convert to grayscale and apply adaptive thresholding
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # This isolates sharp black structural lines from blueprint papers
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 2
    )

    # 3. Detect Lines using Probabilistic Hough Transform
    # Adjust these thresholds based on blueprint qualities
    min_line_length = 30
    max_line_gap = 10
    lines = cv2.HoughLinesP(
        thresh, 
        rho=1, 
        theta=np.pi/180, 
        threshold=50, 
        minLineLength=min_line_length, 
        maxLineGap=max_line_gap
    )

    detected_walls = []
    
    if lines is not None:
        for line in lines:
            x1, y1, x2, y2 = line[0]
            
            # Basic sanity check: skip microscopic line artifacts
            if np.hypot(x2 - x1, y2 - y1) > 10:
                detected_walls.append({
                    "start": {"x": int(x1), "y": int(y1)},
                    "end": {"x": int(x2), "y": int(y2)}
                })

    return detected_walls