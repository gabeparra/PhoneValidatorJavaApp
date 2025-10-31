"""
Phone Validator API
FastAPI wrapper for the Java phone validation application
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import subprocess
import json
import tempfile
import os
import shutil
from pathlib import Path
from datetime import datetime

# Initialize FastAPI app
app = FastAPI(
    title="Phone Validator API",
    description="API for validating and formatting phone numbers from Facebook leads",
    version="1.0.0"
)

# Enable CORS for n8n and other clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your n8n domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
BASE_DIR = Path(__file__).resolve().parent.parent
JAR_PATH = BASE_DIR / "target" / "phone-validator-1.0.0.jar"

# Pydantic models
class PhoneNumber(BaseModel):
    rowNumber: int
    id: str
    email: Optional[str]
    name: Optional[str]
    originalPhoneNumber: str
    e164: Optional[str] = None
    international: Optional[str] = None
    national: Optional[str] = None
    countryCode: Optional[str] = None
    region: Optional[str] = None
    type: Optional[str] = None
    platform: Optional[str] = None
    error: Optional[str] = None

class ValidationResponse(BaseModel):
    status: str
    total_numbers: int
    valid_count: int
    invalid_count: int
    success_rate: float
    valid_numbers: List[PhoneNumber]
    invalid_numbers: List[PhoneNumber]
    country_breakdown: dict
    timestamp: str

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "Phone Validator API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "validate_file": "POST /validate-phones",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    jar_exists = JAR_PATH.exists()
    return {
        "status": "healthy" if jar_exists else "degraded",
        "timestamp": datetime.now().isoformat(),
        "java_jar_available": jar_exists,
        "jar_path": str(JAR_PATH)
    }

@app.post("/validate-phones", response_model=ValidationResponse)
async def validate_phones(file: UploadFile = File(...)):
    """
    Validate phone numbers from a SQL file
    
    - **file**: SQL file containing Facebook leads data
    
    Returns validated phone numbers with formatting and statistics
    """
    
    # Validate JAR exists
    if not JAR_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Java application not found at {JAR_PATH}. Run ./build.sh first."
        )
    
    # Validate file type
    if not file.filename.endswith('.sql'):
        raise HTTPException(
            status_code=400,
            detail="File must be a SQL file (.sql extension)"
        )
    
    # Create temporary files
    tmp_input = None
    tmp_output_dir = None
    
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.sql', mode='wb') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_input = tmp.name
        
        # Create temporary output directory
        tmp_output_dir = tempfile.mkdtemp()
        
        # Run Java validator
        result = subprocess.run(
            ['java', '-jar', str(JAR_PATH), tmp_input, tmp_output_dir],
            capture_output=True,
            text=True,
            timeout=120  # 2 minute timeout
        )
        
        if result.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Java validation failed: {result.stderr}"
            )
        
        # Read results
        valid_path = Path(tmp_output_dir) / "valid_numbers.json"
        invalid_path = Path(tmp_output_dir) / "invalid_numbers.json"
        summary_path = Path(tmp_output_dir) / "summary.json"
        
        with open(valid_path) as f:
            valid_numbers = json.load(f)
        
        with open(invalid_path) as f:
            invalid_numbers = json.load(f)
        
        with open(summary_path) as f:
            summary = json.load(f)
        
        # Build response
        return ValidationResponse(
            status="success",
            total_numbers=summary.get("total_numbers", 0),
            valid_count=summary.get("valid_count", 0),
            invalid_count=summary.get("invalid_count", 0),
            success_rate=float(summary.get("success_rate", "0").rstrip('%')),
            valid_numbers=valid_numbers,
            invalid_numbers=invalid_numbers,
            country_breakdown=summary.get("valid_by_country", {}),
            timestamp=summary.get("timestamp", datetime.now().isoformat())
        )
    
    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail="Validation timeout - file too large or processing error"
        )
    
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Result file not found: {str(e)}"
        )
    
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse validation results: {str(e)}"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )
    
    finally:
        # Cleanup temporary files
        if tmp_input and os.path.exists(tmp_input):
            os.unlink(tmp_input)
        if tmp_output_dir and os.path.exists(tmp_output_dir):
            shutil.rmtree(tmp_output_dir)

@app.get("/stats")
async def get_stats():
    """Get API statistics (placeholder for future implementation)"""
    return {
        "message": "Statistics endpoint - coming soon",
        "total_validations": 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)