# Windows Setup Guide

Since you're using WSL (Windows Subsystem for Linux), here's how to set up and run the phone validator.

## Option 1: Run in WSL (Recommended)

### Step 1: Install Java and Maven in WSL

Open your WSL terminal and run:

```bash
cd /home/gabriel/projects/phone-validator
./setup.sh
```

This will automatically install Java 11 and Maven if they're not already installed.

### Step 2: Build the Project

```bash
./build.sh
```

### Step 3: Run the Validator

```bash
./run.sh
```

The results will be in the `output/` directory.

## Option 2: Run on Windows (Alternative)

If you prefer to run on Windows directly:

### Step 1: Install Java

1. Download Java JDK 11 or higher from:
   https://adoptium.net/temurin/releases/
2. Install and add to PATH

### Step 2: Install Maven

1. Download Maven from:
   https://maven.apache.org/download.cgi
2. Extract and add to PATH

### Step 3: Build (Windows Command Prompt or PowerShell)

```cmd
cd C:\Users\ma719439\Downloads\phone-validator
mvn clean package
```

### Step 4: Run (Windows Command Prompt or PowerShell)

```cmd
java -jar target\phone-validator-1.0.0.jar ^
    facebookleads_202510301100.sql ^
    output
```

## Accessing Files from Windows

Your WSL files are accessible from Windows at:
```
\\wsl$\Ubuntu\home\gabriel\projects\phone-validator\
```

You can open this path in Windows Explorer to view output files.

## Quick Test

To verify everything works, you can test with a single command in WSL:

```bash
cd /home/gabriel/projects/phone-validator
./setup.sh && ./build.sh && ./run.sh
```

This will:
1. Install dependencies (if needed)
2. Build the project
3. Run the validator
4. Generate all output files in the `output/` directory

## Troubleshooting

### "Permission denied" error
```bash
chmod +x setup.sh build.sh run.sh
```

### Java not found after installation
Log out and log back into WSL, or run:
```bash
source ~/.bashrc
```

### Maven not found after installation
Same as above - restart WSL or source ~/.bashrc

## Output Files Location

After running, find your results at:
- WSL path: `/home/gabriel/projects/phone-validator/output/`
- Windows path: `\\wsl$\Ubuntu\home\gabriel\projects\phone-validator\output\`

The output directory will contain:
- `valid_numbers.json` - Valid phone numbers in JSON format
- `invalid_numbers.json` - Invalid phone numbers with errors
- `summary.json` - Overall statistics
- `valid_numbers.csv` - Valid numbers in CSV format
- `invalid_numbers.csv` - Invalid numbers in CSV format
- `validation_report.txt` - Human-readable detailed report

