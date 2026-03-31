# Phone Validator - Full Stack Application

A comprehensive phone number validation system with Java processing engine, FastAPI backend, and Next.js web interface. Validates and formats phone numbers from Facebook leads exports.

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Next.js Web   │─────▶│   FastAPI API   │─────▶│  Java Validator │
│   Frontend      │      │   Backend       │      │   (libphone)    │
│   Port 3000     │◀─────│   Port 8000     │◀─────│   JAR Process   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## ✨ Features

### Core Validation
- ✅ Validates phone numbers from 200+ countries (BR, CO, CR, MX, US, ES, and more)
- 📊 Separates valid and invalid numbers with detailed error messages
- 🔄 Formats valid numbers in E.164, International, and National formats
- 🌍 Provides country code, region, and phone type information
- 📱 Identifies line types (mobile, fixed-line, VoIP, toll-free, etc.)

### Web Interface
- 🎨 Modern React/Next.js UI with Tailwind CSS
- 📤 Drag-and-drop file upload (SQL, CSV, Excel)
- 📊 Real-time validation dashboard with statistics
- 📈 Country breakdown and success rate visualization
- 🔍 Manual single number testing

### API
- 🚀 RESTful FastAPI backend with automatic OpenAPI docs
- 📁 Supports multiple file formats (.sql, .csv, .xlsx, .xls)
- 🔄 CORS-enabled for integration with n8n, Zapier, etc.
- 📊 JSON responses with comprehensive validation results

## 🚀 Quick Start

### Prerequisites Setup

First, install Redis (required for queue system):

```bash
cd /home/ubuntu/PhoneValidatorJavaApp
./setup-redis.sh
```

### One-Command Startup (Recommended)

```bash
cd /home/ubuntu/PhoneValidatorJavaApp
./start-api.sh
```

This automatically:
- ✅ Creates Python virtual environment
- ✅ Installs all dependencies
- ✅ Builds Java JAR if needed
- ✅ Starts FastAPI backend (port 8000)
- ✅ Starts Queue worker (processes validation jobs)
- ✅ Starts Next.js frontend (port 3000)

**Access Points:**
- 🌐 **Web Interface**: http://localhost:3000
- 📡 **API**: http://localhost:8000
- 📚 **API Docs**: http://localhost:8000/docs

## 📋 Requirements

### Backend
- **Java**: 8 or higher (for phone validation engine)
- **Python**: 3.8+ (for FastAPI)
- **Maven**: 3.5+ (for building Java JAR)
- **Redis**: 5.0+ (for queue system - prevents overwhelming with concurrent requests)

### Frontend
- **Node.js**: 16+ 
- **npm**: 8+

## 📁 Project Structure

```
PhoneValidatorJavaApp/
├── api/                          # FastAPI Backend
│   ├── main.py                   # API endpoints
│   └── requirements.txt          # Python dependencies
├── my-frontend/                  # Next.js Frontend
│   ├── app/
│   │   ├── page.js              # Main UI
│   │   ├── components/          # React components
│   │   ├── globals.css          # Tailwind styles
│   │   └── layout.js            # App layout
│   ├── package.json             # Node dependencies
│   └── tailwind.config.js       # Tailwind config
├── src/                         # Java Validator
│   └── main/java/com/facebookleads/validator/
│       ├── Main.java
│       ├── PhoneNumberValidator.java
│       └── ...
├── target/                      # Compiled Java JAR
│   └── phone-validator-1.0.0.jar
├── venv/                        # Python virtual environment
├── pom.xml                      # Maven config
├── start-api.sh                 # All-in-one startup script
├── setup-redis.sh               # Redis setup script
├── ecosystem.config.js          # PM2 configuration (includes queue worker)
└── README.md                    # This file
```

## 🔌 API Endpoints

### `GET /`
API information and available endpoints

### `GET /health`
Health check - shows Java and JAR availability

### `POST /validate-phones`
Upload and validate phone numbers from file (uses queue system)

**Request**: Multipart form with file (SQL/CSV/Excel)

**Response** (Job queued):
```json
{
  "status": "queued",
  "job_id": "validation_20240121_153045_abc123.csv",
  "message": "Validation job has been queued. Use /job/{job_id} to check status.",
  "position": 1
}
```

### `GET /job/{job_id}`
Check the status of a validation job

**Response** (Job in progress):
```json
{
  "job_id": "validation_20240121_153045_abc123.csv",
  "status": "started",
  "progress": "Running Java validator...",
  "position": null,
  "created_at": "2024-01-21T15:30:45",
  "started_at": "2024-01-21T15:30:47"
}
```

**Response** (Job completed):
```json
{
  "job_id": "validation_20240121_153045_abc123.csv",
  "status": "finished",
  "result": {
    "status": "success",
    "total_numbers": 50,
    "valid_count": 49,
    "invalid_count": 1,
    "success_rate": 98.0,
    "valid_numbers": [...],
    "invalid_numbers": [...],
    "country_breakdown": {...}
  },
  "completed_at": "2024-01-21T15:31:15"
}
```

### `POST /validate-phones-manual`
Validate a single phone number

**Request**:
```json
{
  "phone": "+5534999983250",
  "country": "BR"
}
```

## 📊 Output Formats

### Valid Number
```json
{
  "rowNumber": 1,
  "id": "10001736206557337",
  "email": "user@example.com",
  "name": "John Doe",
  "originalPhoneNumber": "+5534999983250",
  "e164": "+5534999983250",
  "international": "+55 34 99998-3250",
  "national": "(34) 99998-3250",
  "countryCode": "+55",
  "region": "BR",
  "type": "MOBILE",
  "platform": "facebook"
}
```

### Invalid Number
```json
{
  "rowNumber": 67,
  "id": "1008834688041252",
  "originalPhoneNumber": "123456789",
  "error": "Number too short"
}
```

## 🛠️ Manual Setup

If you prefer to set up services individually:

```bash
# 1. Build Java validator
mvn clean package

# 2. Setup Python API
python3 -m venv venv
source venv/bin/activate
pip install -r api/requirements.txt

# 3. Setup Frontend
cd my-frontend
npm install

# 4. Start services (in separate terminals)
# Terminal 1 - API
cd /home/gabriel/projects/PhoneValidatorJavaApp
source venv/bin/activate
uvicorn api.main:app --reload

# Terminal 2 - Frontend
cd /home/gabriel/projects/PhoneValidatorJavaApp/my-frontend
npm run dev
```

## 🌍 Supported File Formats

- **SQL**: Facebook leads export format
- **CSV**: Standard comma-separated values
- **Excel**: .xlsx and .xls formats

Expected columns: `phone_number`, optionally: `id`, `email`, `name`, `country`, `platform`

## 💻 Using the Web Interface

1. **Open** http://localhost:3000 in your browser
2. **Upload** your file (SQL, CSV, or Excel)
3. **View** instant results:
   - Success rate and statistics
   - Valid/invalid breakdown
   - Country-by-country analysis
   - Formatted phone numbers in multiple formats

### Test a Single Number

1. Click **"Test Single Number"** in the web interface
2. Enter phone number (e.g., `+5534999983250`)
3. Optional: Add country code (e.g., `BR`)
4. Click **"Validate"**

## 🔌 API Integration Examples

### cURL

```bash
# Health check
curl http://localhost:8000/health

# Upload file
curl -X POST http://localhost:8000/validate-phones \
  -F "file=@your-leads.csv"

# Test single number
curl -X POST http://localhost:8000/validate-phones-manual \
  -H "Content-Type: application/json" \
  -d '{"phone": "+5534999983250", "country": "BR"}'
```

### Python

```python
import requests

# Upload file
with open('leads.csv', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/validate-phones',
        files={'file': f}
    )
    data = response.json()
    print(f"Valid: {data['valid_count']}, Invalid: {data['invalid_count']}")

# Test single number
response = requests.post(
    'http://localhost:8000/validate-phones-manual',
    json={'phone': '+5534999983250', 'country': 'BR'}
)
print(response.json())
```

## 🛑 Stopping Services

```bash
# Stop all services
pkill -f 'uvicorn|npm'

# Or use individual PIDs shown at startup
kill <API_PID>
kill <FRONTEND_PID>
```

## 🔧 Technologies

### Backend
- **Google libphonenumber** - Industry-standard phone validation
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Maven** - Java build tool

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS 3** - Utility-first CSS framework
- **Axios** - HTTP client

## 🔐 Environment Variables

Create `.env` file in project root (optional):

```bash
# API Configuration
API_PORT=8000
API_HOST=127.0.0.1

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📦 Queue System

The phone validator uses a **Redis Queue (RQ)** system to handle concurrent requests and prevent overwhelming the system:

- **Benefits**: Prevents timeouts, handles multiple users simultaneously, better resource management
- **How it works**: File uploads are queued and processed by worker processes
- **Frontend**: Automatically polls for job status and displays progress
- **Workers**: 2 worker instances run in parallel (configurable in `ecosystem.config.js`)

### Queue Management

```bash
# Check queue statistics
curl http://localhost:8000/queue/stats

# View worker logs
pm2 logs phone-validator-queue-worker

# Restart queue workers
pm2 restart phone-validator-queue-worker
```

## 🔍 Troubleshooting

### Redis Not Running

If you see "Queue system is not available" error:

```bash
# Check Redis status
sudo systemctl status redis-server

# Start Redis
sudo systemctl start redis-server

# Enable Redis on boot
sudo systemctl enable redis-server

# Run setup script
./setup-redis.sh
```

### Port Already in Use
```bash
# Kill existing processes
pkill -f 'uvicorn|npm'
lsof -ti:8000 | xargs kill
lsof -ti:3000 | xargs kill
```

### Java Not Found
```bash
sudo apt update
sudo apt install openjdk-11-jdk maven
java -version
```

### Python Module Not Found
```bash
source venv/bin/activate
pip install -r api/requirements.txt
```

### Frontend Dependencies Missing
```bash
cd my-frontend
npm install
```

## 📝 View Logs

```bash
# View API logs
tail -f logs/api.log

# View Frontend logs
tail -f logs/frontend.log
```

## 📖 Additional Documentation

- `QUICKSTART.md` - Quick start guide with examples
- `/api/main.py` - Backend API code with inline documentation
- Interactive API docs at http://localhost:8000/docs

## 📜 License

This project uses Google's libphonenumber library, which is licensed under Apache License 2.0.
