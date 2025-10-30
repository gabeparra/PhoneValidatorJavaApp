#!/bin/bash
# Setup script for Phone Validator project
# Installs Java and Maven if not present

echo "=========================================="
echo "Phone Validator - Setup Script"
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
echo "Next steps:"
echo "  1. Build the project:"
echo "     mvn clean package"
echo ""
echo "  2. Run the validator:"
echo "     java -jar target/phone-validator-1.0.0.jar facebookleads_202510301100.sql output/"
echo ""

