from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS Setup - allows your frontend to talk to the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # We will restrict this in production later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "Backend is running smoothly!"}

@app.post("/api/generate-3d")
async def generate_3d(file: UploadFile = File(...)):
    # This is where your OpenCV and Geometry logic will go
    return {"message": f"Received file: {file.filename}. Ready for processing."}