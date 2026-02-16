"""
Phone Validator API
FastAPI wrapper for the Java phone validation application
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Query
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
import redis
from rq import Queue
from rq.job import Job
from rq.exceptions import NoSuchJobError
from api.queue_worker import process_validation_job
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

# Initialize Redis connection and Queue
redis_conn = None
validation_queue = None
queue_enabled = False

try:
    redis_conn = redis.Redis(host='localhost', port=6379, db=0)
    redis_conn.ping()  # Test connection
    validation_queue = Queue('phone-validation', connection=redis_conn)
    queue_enabled = True
except (redis.ConnectionError, redis.TimeoutError, Exception) as e:
    print(f"Warning: Redis connection failed: {e}. Queue system disabled. Install Redis for queue support.")
    redis_conn = None
    validation_queue = None
    queue_enabled = False

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

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: Optional[str] = None
    result: Optional[dict] = None
    error: Optional[str] = None
    created_at: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    position: Optional[int] = None

@app.get("/")
async def root():
    """Root endpoint - API information"""
    return {
        "name": "Phone Validator API",
        "version": "1.0.0",
        "status": "running",
        "queue_enabled": queue_enabled,
        "endpoints": {
            "health": "/health",
            "validate_file": "POST /validate-phones (accepts .sql, .csv, .xlsx, .xls)",
            "validate_manual": "POST /validate-phones-manual (single phone number, returns result directly)",
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

@app.post("/validate-phones")
async def validate_phones(file: UploadFile = File(...)):
    """
    Validate phone numbers from SQL, CSV, or Excel files using queue system
    
    - **file**: SQL (.sql), CSV (.csv), or Excel (.xlsx, .xls) file containing Facebook leads data
    
    Returns job_id for tracking. Use GET /job/{job_id} to check status and get results.
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
    
    # If queue is disabled, fall back to synchronous processing
    if not queue_enabled:
        raise HTTPException(
            status_code=503,
            detail="Queue system is not available. Please install and start Redis server."
        )
    
    try:
        # Save uploaded file with correct extension (will be cleaned up by worker)
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext, mode='wb') as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_input = tmp.name
        
        # Queue the job
        job = validation_queue.enqueue(
            process_validation_job,
            tmp_input,
            job_timeout=600,  # 10 minute timeout
            job_id=f"validation_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.path.basename(tmp_input)}"
        )
        
        # Get position in queue (count of jobs ahead)
        try:
            job_ids = validation_queue.job_ids
            position = job_ids.index(job.id) + 1 if job.id in job_ids else 1
        except:
            position = None
        
        return {
            "status": "queued",
            "job_id": job.id,
            "message": "Validation job has been queued. Use /job/{job_id} to check status.",
            "position": position,
            "estimated_wait_time": None  # Could be enhanced with queue metrics
        }
    
    except Exception as e:
        # Cleanup on error
        if 'tmp_input' in locals() and os.path.exists(tmp_input):
            try:
                os.unlink(tmp_input)
            except:
                pass
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue validation job: {str(e)}"
        )

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
    
    Returns validation result directly
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
        
        # Build response
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

@app.get("/job/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Get the status and results of a validation job
    
    - **job_id**: The job ID returned from POST /validate-phones
    
    Returns job status, progress, and results (when completed).
    """
    if not queue_enabled:
        raise HTTPException(
            status_code=503,
            detail="Queue system is not available."
        )
    
    try:
        job = Job.fetch(job_id, connection=redis_conn)
        
        # Get position in queue if not started
        position = None
        if job.get_status() == 'queued':
            try:
                job_ids = validation_queue.job_ids
                position = job_ids.index(job_id) + 1 if job_id in job_ids else None
            except:
                position = None
        
        # Build response
        response_data = {
            "job_id": job_id,
            "status": job.get_status(),
            "progress": job.meta.get('progress'),
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "started_at": job.meta.get('started_at'),
            "completed_at": job.meta.get('completed_at'),
            "position": position + 1 if position is not None else None
        }
        
        # If completed, include results
        if job.is_finished:
            if job.meta.get('status') == 'failed':
                response_data["error"] = job.meta.get('error', 'Unknown error occurred')
            else:
                try:
                    result = job.result
                    if result:
                        response_data["result"] = result
                except Exception as e:
                    response_data["error"] = f"Error retrieving results: {str(e)}"
        
        # If failed, include error
        elif job.is_failed:
            response_data["error"] = str(job.exc_info) if job.exc_info else "Job failed"
        
        return JobStatusResponse(**response_data)
    
    except NoSuchJobError:
        raise HTTPException(
            status_code=404,
            detail=f"Job {job_id} not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching job status: {str(e)}"
        )

@app.get("/queue/stats")
async def get_queue_stats():
    """Get queue statistics"""
    if not queue_enabled:
        return {
            "queue_enabled": False,
            "message": "Queue system is not available."
        }
    
    try:
        queued_jobs = len(validation_queue)
        started_jobs = validation_queue.started_job_registry.count
        finished_jobs = validation_queue.finished_job_registry.count
        failed_jobs = validation_queue.failed_job_registry.count
        
        return {
            "queue_enabled": True,
            "queued": queued_jobs,
            "started": started_jobs,
            "finished": finished_jobs,
            "failed": failed_jobs,
            "total": queued_jobs + started_jobs
        }
    except Exception as e:
        return {
            "queue_enabled": True,
            "error": str(e)
        }

@app.get("/stats")
async def get_stats():
    """Get API statistics"""
    queue_stats = await get_queue_stats() if queue_enabled else {"queue_enabled": False}
    return {
        "queue_stats": queue_stats,
        "java_available": JAVA_PATH is not None,
        "jar_available": JAR_PATH.exists()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)