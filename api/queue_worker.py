"""
Queue Worker Module for Phone Validator
Handles background processing of validation jobs
"""

import subprocess
import json
import tempfile
import os
import shutil
from pathlib import Path
from datetime import datetime
from typing import Dict, Any
from rq import get_current_job
from rq.job import Job
import redis

# Redis connection
redis_conn = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# Configuration
BASE_DIR = Path(__file__).resolve().parent.parent
JAR_PATH = BASE_DIR / "target" / "phone-validator-1.0.0.jar"

def find_java_executable():
    """Find the Java executable in system PATH"""
    import shutil
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

def process_validation_job(input_file_path: str) -> Dict[str, Any]:
    """
    Process a phone validation job
    
    Args:
        input_file_path: Path to the input file (SQL, CSV, or Excel)
    
    Returns:
        Dictionary containing validation results
    """
    job = get_current_job()
    tmp_output_dir = None
    
    try:
        # Update job metadata
        if job:
            job.meta['status'] = 'processing'
            job.meta['started_at'] = datetime.now().isoformat()
            job.save_meta()
        
        # Validate Java exists
        if JAVA_PATH is None:
            raise Exception("Java not found in system PATH. Please install Java.")
        
        # Validate JAR exists
        if not JAR_PATH.exists():
            raise Exception(f"Java application not found at {JAR_PATH}. Run ./build.sh first.")
        
        # Create temporary output directory
        tmp_output_dir = tempfile.mkdtemp()
        
        # Update job progress
        if job:
            job.meta['progress'] = 'Running Java validator...'
            job.save_meta()
        
        # Run Java validator
        result = subprocess.run(
            [JAVA_PATH, '-jar', str(JAR_PATH), input_file_path, tmp_output_dir],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout for large files
        )
        
        if result.returncode != 0:
            raise Exception(f"Java validation failed: {result.stderr}")
        
        # Update job progress
        if job:
            job.meta['progress'] = 'Reading results...'
            job.save_meta()
        
        # Read results
        valid_path = Path(tmp_output_dir) / "valid_numbers.json"
        invalid_path = Path(tmp_output_dir) / "invalid_numbers.json"
        summary_path = Path(tmp_output_dir) / "summary.json"
        
        if not valid_path.exists() or not invalid_path.exists() or not summary_path.exists():
            raise Exception("Validation result files not found")
        
        with open(valid_path) as f:
            valid_numbers = json.load(f)
        
        with open(invalid_path) as f:
            invalid_numbers = json.load(f)
        
        with open(summary_path) as f:
            summary = json.load(f)
        
        # Calculate statistics
        total_numbers = summary.get("total_numbers", 0)
        valid_count = len(valid_numbers)
        invalid_count = len(invalid_numbers)
        success_rate = float((valid_count / total_numbers * 100) if total_numbers > 0 else 0)
        
        # Build result
        result_data = {
            'status': 'success',
            'total_numbers': total_numbers,
            'valid_count': valid_count,
            'invalid_count': invalid_count,
            'success_rate': success_rate,
            'valid_numbers': valid_numbers,
            'invalid_numbers': invalid_numbers,
            'country_breakdown': summary.get("valid_by_country", {}),
            'timestamp': summary.get("timestamp", datetime.now().isoformat()),
            'completed_at': datetime.now().isoformat()
        }
        
        # Update job metadata
        if job:
            job.meta['status'] = 'completed'
            job.meta['progress'] = 'Completed'
            job.meta['completed_at'] = datetime.now().isoformat()
            job.save_meta()
        
        return result_data
    
    except subprocess.TimeoutExpired:
        error_msg = "Validation timeout - file too large or processing error"
        if job:
            job.meta['status'] = 'failed'
            job.meta['error'] = error_msg
            job.save_meta()
        raise Exception(error_msg)
    
    except Exception as e:
        error_msg = str(e)
        if job:
            job.meta['status'] = 'failed'
            job.meta['error'] = error_msg
            job.meta['completed_at'] = datetime.now().isoformat()
            job.save_meta()
        raise Exception(error_msg)
    
    finally:
        # Cleanup temporary files
        if tmp_output_dir and os.path.exists(tmp_output_dir):
            try:
                shutil.rmtree(tmp_output_dir)
            except Exception as e:
                print(f"Warning: Could not cleanup temp directory: {e}")
        
        # Cleanup input file after processing
        if input_file_path and os.path.exists(input_file_path):
            try:
                os.unlink(input_file_path)
            except Exception as e:
                print(f"Warning: Could not cleanup input file: {e}")

