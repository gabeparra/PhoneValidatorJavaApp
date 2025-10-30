#!/bin/bash
# Build script for Phone Validator

echo "=========================================="
echo "Building Phone Validator..."
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
    echo "To run:"
    echo "  ./run.sh"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi

