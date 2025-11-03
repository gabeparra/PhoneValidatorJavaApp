package com.facebookleads.validator;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.*;
import java.util.*;

/**
 * Parses phone numbers from Excel files (.xlsx, .xls)
 * Handles flexible column mapping and multi-line cells
 */
public class ExcelParser implements DataParser {

    @Override
    public PhoneNumberData parse(String filePath) throws IOException {
        System.out.println("📊 Reading Excel file: " + filePath);

        List<PhoneRecord> records = new ArrayList<>();

        try (FileInputStream fis = new FileInputStream(filePath);
                Workbook workbook = new XSSFWorkbook(fis)) {

            Sheet sheet = workbook.getSheetAt(0);

            if (sheet.getPhysicalNumberOfRows() == 0) {
                System.out.println("⚠️  Warning: Excel sheet is empty");
                return new PhoneNumberData(records);
            }

            // Parse header row
            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                System.err.println("⚠️  Warning: Could not read header row");
                return new PhoneNumberData(records);
            }

            Map<String, Integer> columnIndex = parseHeader(headerRow);

            if (columnIndex.isEmpty()) {
                System.err.println("⚠️  Warning: Could not detect required columns");
                return new PhoneNumberData(records);
            }

            // Log detected columns
            System.out.println("📍 Detected columns:");
            if (columnIndex.containsKey("id"))
                System.out.println("   - ID (column " + columnIndex.get("id") + ")");
            if (columnIndex.containsKey("email"))
                System.out.println("   - Email (column " + columnIndex.get("email") + ")");
            if (columnIndex.containsKey("first_name"))
                System.out.println("   - First Name (column " + columnIndex.get("first_name") + ")");
            if (columnIndex.containsKey("last_name"))
                System.out.println("   - Last Name (column " + columnIndex.get("last_name") + ")");
            if (columnIndex.containsKey("phone_number"))
                System.out.println("   - Phone (column " + columnIndex.get("phone_number") + ")");
            if (columnIndex.containsKey("country"))
                System.out.println("   - Country (column " + columnIndex.get("country") + ")");
            System.out.println();

            // Parse data rows
            int rowNumber = 0;
            int skippedCount = 0;

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                try {
                    rowNumber++;
                    PhoneRecord record = parseRow(rowNumber, row, columnIndex);
                    if (record != null) {
                        records.add(record);
                    } else {
                        skippedCount++;
                    }
                } catch (Exception e) {
                    System.err.println("⚠️  Warning: Failed to parse row " + rowNumber + ": " + e.getMessage());
                }
            }

            System.out.println("✅ Parsed " + records.size() + " phone records from Excel file");
            if (skippedCount > 0) {
                System.out.println("⚠️  Skipped " + skippedCount + " records (no phone number)");
            }
        }

        return new PhoneNumberData(records);
    }

    /**
     * Parse header row to detect column positions
     */
    private Map<String, Integer> parseHeader(Row headerRow) {
        Map<String, Integer> columnIndex = new HashMap<>();

        if (headerRow == null) {
            return columnIndex;
        }

        // Debug: Print all headers to help troubleshoot
        System.out.println("🔍 Scanning headers...");
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell != null) {
                String headerValue = getCellValueAsString(cell);
                System.out.println("   Column " + i + ": '" + headerValue + "'");
            }
        }
        System.out.println();

        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell == null)
                continue;

            String header = getCellValueAsString(cell);
            if (header == null)
                continue;

            String headerLower = header.toLowerCase().trim();

            // ID columns - EMPLID, SEVIS ID, or just ID
            if (headerLower.contains("emplid") ||
                    (headerLower.contains("sevis") && headerLower.contains("id")) ||
                    headerLower.equals("id")) {
                if (!columnIndex.containsKey("id")) {
                    columnIndex.put("id", i);
                    System.out.println("   ✓ Found ID at column " + i + ": '" + header + "'");
                }
            }
            // Email columns - prefer personal email over campus email
            else if (headerLower.contains("personal") && headerLower.contains("email")) {
                columnIndex.put("email", i); // Override with personal email
                System.out.println("   ✓ Found Personal Email at column " + i + ": '" + header + "'");
            } else if (headerLower.contains("campus") && headerLower.contains("email")) {
                if (!columnIndex.containsKey("email")) {
                    columnIndex.put("email", i);
                    System.out.println("   ✓ Found Campus Email at column " + i + ": '" + header + "'");
                }
            } else if (headerLower.equals("email") || headerLower.contains("e-mail")) {
                if (!columnIndex.containsKey("email")) {
                    columnIndex.put("email", i);
                    System.out.println("   ✓ Found Email at column " + i + ": '" + header + "'");
                }
            }
            // Name columns
            else if (headerLower.contains("first") && headerLower.contains("name")) {
                columnIndex.put("first_name", i);
                System.out.println("   ✓ Found First Name at column " + i + ": '" + header + "'");
            } else if (headerLower.contains("given") && headerLower.contains("name")) {
                columnIndex.put("first_name", i);
                System.out.println("   ✓ Found Given Name at column " + i + ": '" + header + "'");
            } else if (headerLower.contains("last") && headerLower.contains("name")) {
                columnIndex.put("last_name", i);
                System.out.println("   ✓ Found Last Name at column " + i + ": '" + header + "'");
            } else if (headerLower.contains("surname") || headerLower.contains("primary name")) {
                columnIndex.put("last_name", i);
                System.out.println("   ✓ Found Surname at column " + i + ": '" + header + "'");
            }
            // Phone columns - just "phone" or variations
            else if (headerLower.equals("phone")) {
                columnIndex.put("phone_number", i);
                System.out.println("   ✓ Found Phone at column " + i + ": '" + header + "'");
            } else if (headerLower.contains("phone") && !headerLower.contains("country")
                    && !headerLower.contains("code")) {
                if (!columnIndex.containsKey("phone_number")) {
                    columnIndex.put("phone_number", i);
                    System.out.println("   ✓ Found Phone (variant) at column " + i + ": '" + header + "'");
                }
            } else if (headerLower.contains("telephone") && headerLower.contains("u.s.")) {
                columnIndex.put("us_telephone", i);
                System.out.println("   ✓ Found US Telephone at column " + i + ": '" + header + "'");
            } else if (headerLower.contains("telephone") && headerLower.contains("foreign")
                    && !headerLower.contains("code")) {
                columnIndex.put("foreign_telephone", i);
                System.out.println("   ✓ Found Foreign Telephone at column " + i + ": '" + header + "'");
            }
            // Country columns - FIXED: specifically check for "country" not just "count"
            // This prevents matching "1st Check", "2nd Check", etc.
            else if (headerLower.equals("country") ||
                    (headerLower.contains("country") && !headerLower.contains("check")) ||
                    headerLower.contains("citizenship")) {
                if (!columnIndex.containsKey("country")) {
                    columnIndex.put("country", i);
                    System.out.println("   ✓ Found Country at column " + i + ": '" + header + "'");
                }
            }
        }

        System.out.println();
        return columnIndex;
    }

    /**
     * Parse a single Excel row
     */
    private PhoneRecord parseRow(int rowNumber, Row row, Map<String, Integer> columnIndex) {
        String id = getCellValue(row, columnIndex.get("id"));
        String email = getCellValue(row, columnIndex.get("email"));

        String firstName = getCellValue(row, columnIndex.get("first_name"));
        String lastName = getCellValue(row, columnIndex.get("last_name"));
        String name = combineName(firstName, lastName);

        String phoneNumber = cleanPhoneNumber(getCellValue(row, columnIndex.get("phone_number")));
        String country = getCellValue(row, columnIndex.get("country"));

        // Skip records without phone numbers
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return null;
        }

        // Create original line representation for reporting
        String originalLine = "Row " + (row.getRowNum() + 1);

        // Pass original number and country - validator will handle formatting for
        // parsing
        return new PhoneRecord(rowNumber, id, email, name, phoneNumber, country, null, originalLine);
    }

    
    /**
     * Get cell value by column index
     */
    private String getCellValue(Row row, Integer columnIndex) {
        if (columnIndex == null)
            return null;

        Cell cell = row.getCell(columnIndex);
        if (cell == null)
            return null;

        return getCellValueAsString(cell);
    }

    /**
     * Convert cell to string regardless of type
     */
    private String getCellValueAsString(Cell cell) {
        if (cell == null)
            return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                // Handle phone numbers stored as numbers
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    double numValue = cell.getNumericCellValue();
                    // If it's a whole number, don't show decimal
                    if (numValue == Math.floor(numValue)) {
                        return String.valueOf((long) numValue);
                    }
                    return String.valueOf(numValue);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            case BLANK:
                return null;
            default:
                return null;
        }
    }

    /**
     * Clean phone number - remove everything except digits and +
     */
    private String cleanPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return phoneNumber;
        }

        // Remove all characters except digits and +
        String cleaned = phoneNumber.replaceAll("[^0-9+]", "");

        return cleaned.isEmpty() ? null : cleaned;
    }

    /**
     * Combine first and last name
     */
    private String combineName(String firstName, String lastName) {
        if (firstName == null && lastName == null)
            return null;
        if (firstName == null)
            return lastName;
        if (lastName == null)
            return firstName;
        return firstName + " " + lastName;
    }

    /**
     * Ensure phone number has + prefix for international format
     * Adds country code if missing based on country field
     */
    private String ensurePlusPrefix(String phoneNumber, String country) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return phoneNumber;
        }

        // Already has + prefix - return as-is (validator will parse the country code)
        if (phoneNumber.startsWith("+")) {
            return phoneNumber;
        }

        // Map common countries to their codes
        Map<String, String> countryCodes = new HashMap<>();
        countryCodes.put("ARGENTINA", "54");
        countryCodes.put("BANGLADESH", "880");
        countryCodes.put("BRAZIL", "55");
        countryCodes.put("CANADA", "1");
        countryCodes.put("CHILE", "56");
        countryCodes.put("CHINA", "86");
        countryCodes.put("COLOMBIA", "57");
        countryCodes.put("ECUADOR", "593");
        countryCodes.put("EGYPT", "20");
        countryCodes.put("EL SALVADOR", "503");
        countryCodes.put("ELSALVADOR", "503");
        countryCodes.put("HONDURAS", "504");
        countryCodes.put("INDIA", "91");
        countryCodes.put("ISRAEL", "972");
        countryCodes.put("KAZAKHSTAN", "7");
        countryCodes.put("KYRGYZSTAN", "996");
        countryCodes.put("MEXICO", "52");
        countryCodes.put("MOROCCO", "212");
        countryCodes.put("NEPAL", "977");
        countryCodes.put("NIGERIA", "234");
        countryCodes.put("PAKISTAN", "92");
        countryCodes.put("PERU", "51");
        countryCodes.put("RUSSIA", "7");
        countryCodes.put("RUSSIAN FEDERATION", "7");
        countryCodes.put("SAUDI ARABIA", "966");
        countryCodes.put("SPAIN", "34");
        countryCodes.put("TURKEY", "90");
        countryCodes.put("UNITED STATES", "1");
        countryCodes.put("US", "1");
        countryCodes.put("USA", "1");
        countryCodes.put("UZBEKISTAN", "998");
        countryCodes.put("VENEZUELA", "58");
        countryCodes.put("VIET NAM", "84");
        countryCodes.put("VIETNAM", "84");
        countryCodes.put("ZAMBIA", "260");

        // Try to add country code based on country field
        if (country != null && !country.trim().isEmpty()) {
            String countryUpper = country.toUpperCase().trim();
            String code = countryCodes.get(countryUpper);

            if (code != null) {
                // Check if phone number already starts with this country code
                if (phoneNumber.startsWith(code)) {
                    // Number already has country code, just add +
                    return "+" + phoneNumber;
                } else {
                    // Number doesn't have country code, add it
                    return "+" + code + phoneNumber;
                }
            }
        }

        // If country not found or null, try to infer from number length
        // Numbers with 10+ digits might already have country code, just add +
        if (phoneNumber.length() >= 10) {
            return "+" + phoneNumber;
        }

        // Short numbers - assume it needs country code, default to US
        // The validator will then try both the detected country AND US as fallback
        return "+1" + phoneNumber;
    }
}