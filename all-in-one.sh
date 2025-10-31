#!/bin/bash
# Master script for Phone Validator - Setup, Build, and Run
# This script automates the entire process in one command

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Phone Validator - Complete Setup & Build Pipeline      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================
# STEP 1: SETUP (Install dependencies)
# ============================================================
echo "📋 STEP 1: Setting up environment..."
echo "=========================================="
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "📦 Java not found. Installing OpenJDK 11..."
    sudo apt update
    sudo apt install -y openjdk-11-jdk
else
    echo "✅ Java is already installed"
    java -version
fi

echo ""

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "📦 Maven not found. Installing Maven..."
    sudo apt install -y maven
else
    echo "✅ Maven is already installed"
    mvn -version
fi

echo ""
echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="
echo ""

# ============================================================
# STEP 2: BUILD (Compile and package)
# ============================================================
echo "📋 STEP 2: Building the project..."
echo "=========================================="
echo ""

# Clean and build
mvn clean package

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Build successful!"
    echo "=========================================="
    echo ""
    echo "Executable JAR created at:"
    echo "  target/phone-validator-1.0.0.jar"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi

echo ""

# ============================================================
# STEP 3: RUN (Execute validation)
# ============================================================
echo "📋 STEP 3: Running the validator..."
echo "=========================================="
echo ""

# Check if JAR exists (should exist after successful build)
if [ ! -f "target/phone-validator-1.0.0.jar" ]; then
    echo "❌ JAR file not found. Build may have failed."
    exit 1
fi

# Get input file from command line argument, or use default
INPUT_FILE="${1:-facebookleads_202510301100.sql}"
OUTPUT_DIR="${2:-output}"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: Input file not found: $INPUT_FILE"
    echo ""
    echo "Usage: ./all-in-one.sh [input-file] [output-directory]"
    echo ""
    echo "Examples:"
    echo "  ./all-in-one.sh                          # Uses default SQL file"
    echo "  ./all-in-one.sh cleanup.csv              # Use CSV file"
    echo "  ./all-in-one.sh leads.xlsx output-dir    # Use Excel file with custom output"
    echo ""
    
    # List available files
    if ls *.sql 1> /dev/null 2>&1; then
        echo "Available SQL files:"
        ls -1 *.sql | sed 's/^/  - /'
        echo ""
    fi
    
    if ls *.csv 1> /dev/null 2>&1; then
        echo "Available CSV files:"
        ls -1 *.csv | sed 's/^/  - /'
        echo ""
    fi
    
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Run the validator
echo "📋 Processing: $INPUT_FILE"
echo "📁 Output to: $OUTPUT_DIR"
echo ""

java -jar target/phone-validator-1.0.0.jar \
    "$INPUT_FILE" \
    "$OUTPUT_DIR"

echo ""

# ============================================================
# COMPLETION
# ============================================================
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  ✅ ALL STEPS COMPLETED!                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Results:"
echo "  Input:  $INPUT_FILE"
echo "  Output: $OUTPUT_DIR/"
echo ""
echo "📁 Output files created:"
echo "  - $OUTPUT_DIR/valid_numbers.json"
echo "  - $OUTPUT_DIR/invalid_numbers.json"
echo "  - $OUTPUT_DIR/summary.json"
echo "  - $OUTPUT_DIR/valid_numbers.csv"
echo "  - $OUTPUT_DIR/invalid_numbers.csv"
echo "  - $OUTPUT_DIR/validation_report.txt"
echo ""
echo "💡 Next time, run: ./all-in-one.sh <file> [output-dir]"
echo ""