"""
Phone Validator API
FastAPI wrapper for the Java phone validation application
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
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
# Find Java executable
def find_java_executable():
    """Find the Java executable in system PATH"""
    java_path = shutil.which('java')
    if java_path:
        return java_path
    
    # Try common installation locations
    common_paths = [
        '/usr/bin/java',
        '/usr/local/bin/java',
        '/opt/java/openjdk/bin/java',
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            return path
    
    return None

JAVA_PATH = find_java_executable()

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
    email: Optional[str] = None
    name: Optional[str] = None
    originalPhoneNumber: str
    e164: Optional[str] = None
    international: Optional[str] = None
    national: Optional[str] = None
    countryCode: Optional[str] = None
    region: Optional[str] = None
    type: Optional[str] = None
    platform: Optional[str] = None
    error: Optional[str] = None
    validationMethod: Optional[str] = None 
    originalCountry: Optional[str] = None

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

class ManualPhoneRequest(BaseModel):
    phone: str
    country: Optional[str] = None

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "Phone Validator API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "validate_file": "POST /validate-phones (accepts .sql, .csv, .xlsx, .xls)",
            "validate_manual": "POST /validate-phones-manual (single phone number)",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    jar_exists = JAR_PATH.exists()
    java_exists = JAVA_PATH is not None
    return {
        "status": "healthy" if jar_exists and java_exists else "degraded",
        "timestamp": datetime.now().isoformat(),
        "java_jar_available": jar_exists,
        "java_available": java_exists,
        "jar_path": str(JAR_PATH),
        "java_path": JAVA_PATH
    }

@app.post("/validate-phones", response_model=ValidationResponse)
async def validate_phones(file: UploadFile = File(...)):
    """
    Validate phone numbers from SQL, CSV, or Excel files
    
    - **file**: SQL (.sql), CSV (.csv), or Excel (.xlsx, .xls) file containing Facebook leads data
    
    Returns validated phone numbers with formatting and statistics.
    """
    
    # Validate Java exists
    if JAVA_PATH is None:
        raise HTTPException(
            status_code=500,
            detail="Java not found in system PATH. Please install Java."
        )
    
    # Validate JAR exists
    if not JAR_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Java application not found at {JAR_PATH}. Run ./build.sh first."
        )
    
    # Validate file type
    allowed_extensions = ['.sql', '.csv', '.xlsx', '.xls']
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File must be one of: {', '.join(allowed_extensions)}"
        )
    
    # Create temporary files
    tmp_input = None
    tmp_output_dir = None
    
    try:
        # Save uploaded file with correct extension
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext, mode='wb') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_input = tmp.name
        
        # Create temporary output directory
        tmp_output_dir = tempfile.mkdtemp()
        
        # Run Java validator
        result = subprocess.run(
            [JAVA_PATH, '-jar', str(JAR_PATH), tmp_input, tmp_output_dir],
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
        
        # Use Java validation results as-is (no Python forceful testing)
        total_numbers = summary.get("total_numbers", 0)
        valid_count = len(valid_numbers)
        invalid_count = len(invalid_numbers)
        success_rate = float((valid_count / total_numbers * 100) if total_numbers > 0 else 0)
        
        # Build response
        return ValidationResponse(
            status="success",
            total_numbers=total_numbers,
            valid_count=valid_count,
            invalid_count=invalid_count,
            success_rate=success_rate,
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

@app.post("/validate-phones-manual", response_model=ValidationResponse)
async def validate_phone_manual(
    request: Optional[ManualPhoneRequest] = None,
    phone: Optional[str] = None,
    country: Optional[str] = None
):
    """
    Validate a single phone number manually entered by user
    Accepts both JSON and form-encoded data for Zapier compatibility
    
    - **phone**: Phone number to validate (with or without country code)
    - **country**: Country code for fallback (e.g., 'US', 'BR', 'Ecuador')
    
    Returns validation result for that single number
    """
    
    # Handle both JSON (request body) and form data (query/form params)
    phone_number = None
    country_name = None
    
    if request:
        # JSON body format
        phone_number = request.phone
        country_name = request.country
    else:
        # Form data or query params
        phone_number = phone
        country_name = country
    
    # Validate Java exists
    if JAVA_PATH is None:
        raise HTTPException(
            status_code=500,
            detail="Java not found in system PATH. Please install Java."
        )
    
    # Validate JAR exists
    if not JAR_PATH.exists():
        raise HTTPException(
            status_code=500,
            detail=f"Java application not found at {JAR_PATH}. Run ./build.sh first."
        )
    
    # Validate input
    if not phone_number or not phone_number.strip():
        raise HTTPException(
            status_code=400,
            detail="Phone number cannot be empty"
        )
    
    tmp_input = None
    tmp_output_dir = None
    
    try:
        # Create a temporary CSV file with the single phone number
        csv_content = "rowNumber,id,email,name,phone_number,country,platform\n"
        csv_content += f'1,"manual-test","","Manual Test","{phone_number.strip()}","{country_name or ""}","web"\n'
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='w') as tmp:
            tmp.write(csv_content)
            tmp_input = tmp.name
        
        # Create temporary output directory
        tmp_output_dir = tempfile.mkdtemp()
        
        # Run Java validator
        result = subprocess.run(
            [JAVA_PATH, '-jar', str(JAR_PATH), tmp_input, tmp_output_dir],
            capture_output=True,
            text=True,
            timeout=60  # 1 minute timeout for single number
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
        
        # Build response (no forceful testing for manual validation either)
        return ValidationResponse(
            status="success",
            total_numbers=summary.get("total_numbers", 0),
            valid_count=len(valid_numbers),
            invalid_count=len(invalid_numbers),
            success_rate=float((len(valid_numbers) / summary.get("total_numbers", 1) * 100) if summary.get("total_numbers", 0) > 0 else 0),
            valid_numbers=valid_numbers,
            invalid_numbers=invalid_numbers,
            country_breakdown=summary.get("valid_by_country", {}),
            timestamp=summary.get("timestamp", datetime.now().isoformat())
        )
    
    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail="Validation timeout - single number took too long to process"
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