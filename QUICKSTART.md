# 🚀 Phone Validator - Quick Start Guide

Get your phone validation system running in under 2 minutes!

## One-Command Startup

```bash
cd /PhoneValidatorJavaApp
./start-api.sh
```

**That's it!** 🎉

The script automatically:
1. ✅ Checks and builds Java JAR if needed
2. ✅ Creates Python virtual environment
3. ✅ Installs all dependencies (Python + Node.js)
4. ✅ Starts FastAPI backend on port 8000
5. ✅ Starts Next.js frontend on port 3000

## 🌐 Access Your Application

After startup, open your browser:

- **Web Interface**: http://localhost:3000
- **API Backend**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)

## 📤 Using the Web Interface

### Upload a File

1. **Open** http://localhost:3000
2. **Upload** your file (SQL, CSV, or Excel with phone numbers)
3. **View** instant validation results:
   - Success rate percentage
   - Valid/invalid breakdown
   - Country statistics
   - Formatted phone numbers in E.164, International, and National formats

### Test a Single Number

1. Click **"Test Single Number"**
2. Enter phone number (e.g., `+5534999983250` or `5534999983250`)
3. Optional: Add country code (e.g., `BR`)
4. Click **"Validate"**
5. See instant results with formatting

## 🔌 Using the API Directly

### cURL Examples

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Upload File:**
```bash
curl -X POST http://localhost:8000/validate-phones \
  -F "file=@your-leads.csv" \
  -H "Content-Type: multipart/form-data"
```

**Test Single Number:**
```bash
curl -X POST http://localhost:8000/validate-phones-manual \
  -H "Content-Type: application/json" \
  -d '{"phone": "+5534999983250", "country": "BR"}'
```

### Python Example

```python
import requests

# Upload file
with open('leads.csv', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/validate-phones',
        files={'file': f}
    )
    data = response.json()
    print(f"Valid: {data['valid_count']}")
    print(f"Invalid: {data['invalid_count']}")
    print(f"Success Rate: {data['success_rate']}%")

# Test single number
response = requests.post(
    'http://localhost:8000/validate-phones-manual',
    json={'phone': '+5534999983250', 'country': 'BR'}
)
result = response.json()
if result['valid_count'] > 0:
    number = result['valid_numbers'][0]
    print(f"Valid! E.164: {number['e164']}")
    print(f"International: {number['international']}")
```

## 📁 Supported File Formats

### CSV Format
```csv
rowNumber,id,email,name,phone_number,country,platform
1,12345,user@example.com,John Doe,+5534999983250,BR,facebook
2,12346,user2@example.com,Jane Doe,+573001234567,CO,facebook
```

### SQL Format (Facebook Leads Export)
```sql
INSERT INTO leads VALUES 
(1, '12345', 'user@example.com', 'John Doe', '+5534999983250', 'BR', 'facebook'),
(2, '12346', 'user2@example.com', 'Jane Doe', '+573001234567', 'CO', 'facebook');
```

### Excel Format
Same columns as CSV in an .xlsx or .xls file

## 📊 Understanding Results

### Valid Numbers Include:
- **E.164**: `+5534999983250` (international standard format)
- **International**: `+55 34 99998-3250` (human-readable display format)
- **National**: `(34) 99998-3250` (local format for the country)
- **Country Code**: `+55`
- **Region**: `BR` (Brazil)
- **Type**: `MOBILE`, `FIXED_LINE`, `VOIP`, etc.

### Invalid Numbers Include:
- Original phone number
- Error reason (e.g., "Number too short", "Invalid country code", "Not a valid number")

### Response Statistics:
- **Total Numbers**: Count of all phone numbers processed
- **Valid Count**: Number of successfully validated phones
- **Invalid Count**: Number of failed validations
- **Success Rate**: Percentage of valid numbers
- **Country Breakdown**: Valid numbers grouped by country

## 💡 Example Results

**Input**: `+5534999983250`

**Output**:
```json
{
  "rowNumber": 1,
  "id": "12345",
  "originalPhoneNumber": "+5534999983250",
  "e164": "+5534999983250",
  "international": "+55 34 99998-3250",
  "national": "(34) 99998-3250",
  "countryCode": "+55",
  "region": "BR",
  "type": "MOBILE"
}
```

## 🛑 Stopping Services

```bash
# Stop all services at once
pkill -f 'uvicorn|npm'
```

Services run in the background, so closing the terminal won't stop them.

### Or Stop Individual Services

```bash
# Find process IDs
lsof -ti:8000 | xargs kill  # Stop API
lsof -ti:3000 | xargs kill  # Stop Frontend
```

## 🔧 Troubleshooting

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
```bash
pkill -f 'uvicorn|npm'
# Or kill specific ports
lsof -ti:8000 | xargs kill
lsof -ti:3000 | xargs kill
```

### Java Not Found

**Error**: `Java not found in system PATH`

**Solution**:
```bash
sudo apt update
sudo apt install openjdk-11-jdk maven
java -version
```

### Python Module Not Found

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
cd /home/gabriel/projects/PhoneValidatorJavaApp
source venv/bin/activate
pip install -r api/requirements.txt
```

### Frontend Build Error

**Error**: `Module not found: Can't resolve 'tailwindcss'`

**Solution**:
```bash
cd my-frontend
rm -rf node_modules package-lock.json
npm install
```

### JAR File Not Found

**Error**: `Java application not found`

**Solution**:
```bash
cd /home/gabriel/projects/PhoneValidatorJavaApp
mvn clean package
```

## 📝 View Logs

Logs are saved in the `logs/` directory:

```bash
# View API logs (real-time)
tail -f logs/api.log

# View Frontend logs (real-time)
tail -f logs/frontend.log

# View both logs
tail -f logs/api.log logs/frontend.log
```

## 🎯 First-Time Setup

If this is your first time running the project:

```bash
# 1. Navigate to project
cd /home/gabriel/projects/PhoneValidatorJavaApp

# 2. Run the startup script
./start-api.sh

# 3. Wait for services to start (about 30 seconds)

# 4. Open browser to http://localhost:3000

# 5. Upload your first file or test a phone number!
```

## 🔍 Interactive API Documentation

FastAPI provides automatic interactive documentation:

1. Open http://localhost:8000/docs
2. You'll see all available endpoints
3. Click "Try it out" on any endpoint
4. Fill in parameters
5. Click "Execute" to test
6. View response in real-time

This is perfect for:
- Testing API endpoints
- Understanding request/response formats
- Integrating with other applications

## 🌍 Supported Countries

The validator supports 200+ countries including:
- 🇧🇷 Brazil (BR)
- 🇨🇴 Colombia (CO)
- 🇨🇷 Costa Rica (CR)
- 🇲🇽 Mexico (MX)
- 🇺🇸 United States (US)
- 🇪🇸 Spain (ES)
- And many more...

## 💡 Pro Tips

- **Bookmark** http://localhost:3000 for quick access
- **Use API docs** at http://localhost:8000/docs to test endpoints interactively
- **Batch process** thousands of numbers at once via file upload
- **Export results** as JSON or CSV from the web interface
- **Integrate** with n8n, Zapier, or custom applications via the REST API

## 📖 Need More Details?

- **Full Documentation**: See `README.md`
- **API Code**: Check `api/main.py` for implementation details
- **Frontend Code**: Check `my-frontend/app/` for UI components
- **Java Validator**: Check `src/main/java/` for validation logic

## 🎉 You're Ready!

Just run `./start-api.sh` and start validating phone numbers!

---

Questions? Check the full README.md or visit http://localhost:8000/docs for API documentation.
