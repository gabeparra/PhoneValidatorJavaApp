package com.facebookleads.validator;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.*;
import java.util.*;

/**
 * Parses phone numbers from Excel files (.xlsx, .xls)
 * Handles flexible column mapping and multi-line cells
 * Processes all sheets in the workbook
 */
public class ExcelParser implements DataParser {

    @Override
    public PhoneNumberData parse(String filePath) throws IOException {
        System.out.println("📊 Reading Excel file: " + filePath);

        List<PhoneRecord> records = new ArrayList<>();
        int totalSheets = 0;
        int processedSheets = 0;

        List<String> originalColumnNames = null;

        try (FileInputStream fis = new FileInputStream(filePath);
                Workbook workbook = new XSSFWorkbook(fis)) {

            totalSheets = workbook.getNumberOfSheets();
            System.out.println("📑 Found " + totalSheets + " sheet(s) in workbook");

            for (int sheetIndex = 0; sheetIndex < totalSheets; sheetIndex++) {
                Sheet sheet = workbook.getSheetAt(sheetIndex);
                String sheetName = sheet.getSheetName();

                System.out.println();
                System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                System.out.println("📄 Processing Sheet " + (sheetIndex + 1) + "/" + totalSheets + ": '" + sheetName + "'");
                System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                if (sheetIndex == 0 && sheet.getPhysicalNumberOfRows() > 0 && sheet.getRow(0) != null) {
                    originalColumnNames = getHeaderValues(sheet.getRow(0));
                }
                List<PhoneRecord> sheetRecords = parseSheet(sheet, sheetIndex, originalColumnNames);

                if (sheetRecords.size() > 0) {
                    records.addAll(sheetRecords);
                    processedSheets++;
                    System.out.println("✅ Sheet '" + sheetName + "' processed: " + sheetRecords.size() + " records");
                } else {
                    System.out.println("⚠️  Sheet '" + sheetName + "' had no valid records");
                }
            }

            System.out.println();
            System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            System.out.println("✅ Parsed " + records.size() + " phone records from " + processedSheets + "/" + totalSheets + " sheet(s)");
            System.out.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        }

        return new PhoneNumberData(records, originalColumnNames);
    }

    /** Build ordered list of header cell values from the header row. */
    private List<String> getHeaderValues(Row headerRow) {
        List<String> names = new ArrayList<>();
        if (headerRow == null) return names;
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            names.add(cell != null ? (getCellValueAsString(cell) != null ? getCellValueAsString(cell) : "") : "");
        }
        return names;
    }

    /**
     * Parse a single sheet and return its records.
     * @param originalColumnNames header from first sheet (for export); may be null
     */
    private List<PhoneRecord> parseSheet(Sheet sheet, int sheetIndex, List<String> originalColumnNames) {
        List<PhoneRecord> records = new ArrayList<>();

        if (sheet.getPhysicalNumberOfRows() == 0) {
            System.out.println("⚠️  Warning: Excel sheet is empty");
            return records;
        }

        Row headerRow = sheet.getRow(sheet.getFirstRowNum());
        if (headerRow == null) {
            System.err.println("⚠️  Warning: Could not read header row");
            return records;
        }

        Map<String, Integer> columnIndex = parseHeader(headerRow);

        if (columnIndex.isEmpty()) {
            System.err.println("⚠️  Warning: Could not detect required columns");
            return records;
        }

        // Log detected columns
        System.out.println("📍 Detected columns:");
        if (columnIndex.containsKey("id"))
            System.out.println("   - ID (column " + columnIndex.get("id") + ")");
        if (columnIndex.containsKey("email"))
            System.out.println("   - Email (column " + columnIndex.get("email") + ")");
        if (columnIndex.containsKey("name"))
            System.out.println("   - Name (column " + columnIndex.get("name") + ")");
        if (columnIndex.containsKey("first_name"))
            System.out.println("   - First Name (column " + columnIndex.get("first_name") + ")");
        if (columnIndex.containsKey("last_name"))
            System.out.println("   - Last Name (column " + columnIndex.get("last_name") + ")");
        if (columnIndex.containsKey("phone_number"))
            System.out.println("   - Phone (column " + columnIndex.get("phone_number") + ")");
        if (columnIndex.containsKey("us_telephone"))
            System.out.println("   - US Telephone (column " + columnIndex.get("us_telephone") + ")");
        if (columnIndex.containsKey("foreign_telephone"))
            System.out.println("   - Foreign Telephone (column " + columnIndex.get("foreign_telephone") + ")");
        if (columnIndex.containsKey("country"))
            System.out.println("   - Country (column " + columnIndex.get("country") + ")");
        if (columnIndex.containsKey("platform"))
            System.out.println("   - Platform (column " + columnIndex.get("platform") + ")");
        System.out.println();

        // Parse data rows
        int rowNumber = 0;

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null)
                continue;

            try {
                rowNumber++;
                PhoneRecord record = parseRow(rowNumber, row, columnIndex, originalColumnNames);
                if (record != null) {
                    records.add(record);
                }
            } catch (Exception e) {
                System.err.println("⚠️  Warning: Failed to parse row " + rowNumber + ": " + e.getMessage());
            }
        }

        return records;
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
            // Name columns - check for full name first, then first/last name
            else if (headerLower.equals("name") && !headerLower.contains("first") && !headerLower.contains("last")) {
                if (!columnIndex.containsKey("name")) {
                    columnIndex.put("name", i);
                    System.out.println("   ✓ Found Name at column " + i + ": '" + header + "'");
                }
            } else if (headerLower.contains("first") && headerLower.contains("name")) {
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
            // Phone columns - check for "updated number" and other variations
            else if (headerLower.contains("updated") && headerLower.contains("number")) {
                if (!columnIndex.containsKey("phone_number")) {
                    columnIndex.put("phone_number", i);
                    System.out.println("   ✓ Found Updated Number at column " + i + ": '" + header + "'");
                }
            } else if (headerLower.equals("phone")) {
                if (!columnIndex.containsKey("phone_number")) {
                    columnIndex.put("phone_number", i);
                    System.out.println("   ✓ Found Phone at column " + i + ": '" + header + "'");
                }
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
            // Platform column
            else if (headerLower.equals("platform")) {
                if (!columnIndex.containsKey("platform")) {
                    columnIndex.put("platform", i);
                    System.out.println("   ✓ Found Platform at column " + i + ": '" + header + "'");
                }
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
    private PhoneRecord parseRow(int rowNumber, Row row, Map<String, Integer> columnIndex, List<String> originalColumnNames) {
        String id = getCellValue(row, columnIndex.get("id"));
        String email = getCellValue(row, columnIndex.get("email"));

        String name = getCellValue(row, columnIndex.get("name"));
        if (name == null || name.isEmpty()) {
            String firstName = getCellValue(row, columnIndex.get("first_name"));
            String lastName = getCellValue(row, columnIndex.get("last_name"));
            name = combineName(firstName, lastName);
        }

        String phoneNumber = getCellValue(row, columnIndex.get("phone_number"));
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            phoneNumber = getCellValue(row, columnIndex.get("us_telephone"));
        }
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            phoneNumber = getCellValue(row, columnIndex.get("foreign_telephone"));
        }
        phoneNumber = cleanPhoneNumber(phoneNumber);
        String country = getCellValue(row, columnIndex.get("country"));
        String platform = getCellValue(row, columnIndex.get("platform"));

        String originalLine = "Row " + (row.getRowNum() + 1);
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            phoneNumber = "";
        }

        List<String> originalColumnValues = null;
        if (originalColumnNames != null && !originalColumnNames.isEmpty()) {
            originalColumnValues = getRowValues(row, originalColumnNames.size());
        }
        return new PhoneRecord(rowNumber, id, email, name, phoneNumber, country, platform, originalLine, originalColumnValues);
    }

    /** Get cell values for this row in order, same length as originalColumnNames. */
    private List<String> getRowValues(Row row, int columnCount) {
        List<String> values = new ArrayList<>();
        for (int i = 0; i < columnCount; i++) {
            Cell cell = row.getCell(i);
            String v = cell != null ? getCellValueAsString(cell) : null;
            values.add(v != null ? v : "");
        }
        return values;
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
                // Get the cached/evaluated result, not the formula itself
                try {
                    CellType resultType = cell.getCachedFormulaResultType();
                    switch (resultType) {
                        case STRING:
                            return cell.getStringCellValue().trim();
                        case NUMERIC:
                            double numValue = cell.getNumericCellValue();
                            if (numValue == Math.floor(numValue)) {
                                return String.valueOf((long) numValue);
                            }
                            return String.valueOf(numValue);
                        case BOOLEAN:
                            return String.valueOf(cell.getBooleanCellValue());
                        default:
                            return null;
                    }
                } catch (Exception e) {
                    // If we can't get the result, return null
                    return null;
                }
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

}