# Phone Validator - Quick Start Guide

## 🚀 TL;DR - Get Started in 3 Commands

```bash
cd /home/gabriel/projects/phone-validator
./setup.sh    # Install Java & Maven (first time only)
./build.sh    # Build the project
./run.sh      # Run the validator
```

Results will be in the `output/` directory.

## 📋 What This Does

This application:
1. ✅ Reads phone numbers from your Facebook leads SQL file
2. ✅ Validates each number using Google's libphonenumber library
3. ✅ Separates valid and invalid numbers
4. ✅ Formats valid numbers in multiple international formats
5. ✅ Generates 6 output files (JSON, CSV, and readable report)

## 📊 Expected Results from Your Data

Based on your SQL file (`facebookleads_202510301100.sql`):
- **Total numbers**: 50
- **Countries**: Brazil, Colombia, Costa Rica, Mexico, USA, Spain
- **Expected valid**: ~49 (one invalid: '123456789')
- **Formats provided**: E.164, International, National

## 📁 Output Files You'll Get

```
output/
├── valid_numbers.json       ← JSON array of all valid numbers
├── invalid_numbers.json     ← JSON array of invalid numbers
├── summary.json            ← Statistics & country breakdown
├── valid_numbers.csv       ← Spreadsheet-friendly format
├── invalid_numbers.csv     ← Invalid numbers with errors
└── validation_report.txt   ← Human-readable detailed report
```

## 💡 Example: Valid Number Output

**Original**: `+5534999983250`

**Formatted Output**:
- **E.164**: `+5534999983250` (international standard)
- **International**: `+55 34 99998-3250` (formatted for display)
- **National**: `(34) 99998-3250` (local format in Brazil)
- **Country**: Brazil (BR)
- **Type**: MOBILE

## 🔍 What Gets Validated

For each phone number, the validator checks:
- ✅ Is it parseable?
- ✅ Does it have a valid country code?
- ✅ Is the length correct for its country?
- ✅ Does it match the numbering plan for its region?
- ✅ What type of number is it? (mobile, fixed-line, etc.)

## ⚠️ Common Invalid Cases

From your data, invalid numbers will include:
- `123456789` - Too short, no country code
- Numbers with incorrect formats
- Numbers that don't match their country's numbering plan

## 🎯 Next Steps After Running

1. **Open the readable report**:
   ```bash
   cat output/validation_report.txt
   ```

2. **Access from Windows** (if using WSL):
   ```
   \\wsl$\Ubuntu\home\gabriel\projects\phone-validator\output\
   ```

3. **Import CSV to Excel/Google Sheets**:
   Open `valid_numbers.csv` or `invalid_numbers.csv`

4. **Use JSON for programming**:
   Parse `valid_numbers.json` in your application

## 🛠️ Manual Run (Custom Paths)

```bash
java -jar target/phone-validator-1.0.0.jar \
    /path/to/your/input.sql \
    /path/to/output/directory
```

## 📞 Support

If you encounter issues:
1. Check `WINDOWS_SETUP.md` for detailed setup instructions
2. Check `README.md` for full documentation
3. Verify Java/Maven are installed: `java -version && mvn -version`

## 🎉 You're All Set!

Just run the three commands at the top and check your `output/` directory!

