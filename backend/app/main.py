from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.cv_engine import detect_walls_from_image
from app.geometry import clean_and_simplify_walls

app = FastAPI(title="Plan3D Studio API Architecture Engine")

# Configure CORS so your frontend development instance can query this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In strict production, lock this down to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "healthy", "engine": "OpenCV Python Core ready"}

@app.post("/api/auto-detect")
async def auto_detect_floorplan(file: UploadFile = File(...)):
    # Validate incoming image extensions
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    try:
        # Read the upload stream as raw bytes
        image_bytes = await file.read()
        
        # Pass image into OpenCV pipeline
        raw_detected_lines = detect_walls_from_image(image_bytes)
        
        # Optimize geometries using Shapely module processes
        cleaned_walls = clean_and_simplify_walls(raw_detected_lines)
        
        return {
            "success": True,
            "filename": file.filename,
            "walls_detected_count": len(cleaned_walls),
            "walls": cleaned_walls
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geometry Processing Interruption: {str(e)}")