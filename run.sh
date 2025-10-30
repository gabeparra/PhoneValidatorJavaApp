#!/bin/bash
# Flexible run script for Phone Validator

echo "=========================================="
echo "Running Phone Validator..."
echo "=========================================="
echo ""

# Check if JAR exists
if [ ! -f "target/phone-validator-1.0.0.jar" ]; then
    echo "❌ JAR file not found. Please build first:"
    echo "   ./build.sh"
    exit 1
fi

# Check if SQL file argument provided
if [ -z "$1" ]; then
    echo "📋 Usage: ./run.sh <sql-file> [output-directory]"
    echo ""
    echo "Examples:"
    echo "  ./run.sh facebookleads.sql"
    echo "  ./run.sh input/leads-nov-2025.sql output-nov"
    echo "  ./run.sh ~/downloads/leads.sql ~/results"
    echo ""
    
    # List available SQL files in current directory
    if ls *.sql 1> /dev/null 2>&1; then
        echo "Available SQL files in current directory:"
        ls -1 *.sql | sed 's/^/  - /'
        echo ""
        echo "Run with: ./run.sh <filename>"
    fi
    
    exit 1
fi

# Get input file and output directory
INPUT_FILE="$1"
OUTPUT_DIR="${2:-output}"  # Default to 'output' if not provided

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Error: File not found: $INPUT_FILE"
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
echo "✅ Check the $OUTPUT_DIR/ directory for results!"