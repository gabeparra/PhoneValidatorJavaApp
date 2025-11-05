package com.facebookleads.validator;

import java.io.*;
import java.nio.file.*;
import java.util.*;

/**
 * Parses phone numbers from CSV files (Excel exports, etc.)
 * Uses header row to detect column positions dynamically
 * Handles multi-line CSV records with quoted fields
 * Enhanced to match ExcelParser capabilities
 */
public class CSVParser implements DataParser {
    
    @Override
    public PhoneNumberData parse(String filePath) throws IOException {
        System.out.println("📊 Reading CSV file: " + filePath);
        
        List<PhoneRecord> records = new ArrayList<>();
        
        // Read entire file as a single string to handle multi-line records
        String content = new String(Files.readAllBytes(Paths.get(filePath)));
        List<String> csvRecords = parseCSVRecords(content);
        
        if (csvRecords.isEmpty()) {
            System.out.println("⚠️  Warning: CSV file is empty");
            return new PhoneNumberData(records);
        }
        
        // Parse header row to find column indices
        Map<String, Integer> columnIndex = parseHeader(csvRecords.get(0));
        
        if (columnIndex.isEmpty()) {
            System.err.println("⚠️  Warning: Could not detect required columns in CSV header");
            return new PhoneNumberData(records);
        }
        
        // Log detected columns for debugging
        System.out.println("📍 Detected columns:");
        if (columnIndex.containsKey("id")) System.out.println("   - ID (column " + columnIndex.get("id") + ")");
        if (columnIndex.containsKey("email")) System.out.println("   - Email (column " + columnIndex.get("email") + ")");
        if (columnIndex.containsKey("first_name")) System.out.println("   - First Name (column " + columnIndex.get("first_name") + ")");
        if (columnIndex.containsKey("last_name")) System.out.println("   - Last Name (column " + columnIndex.get("last_name") + ")");
        if (columnIndex.containsKey("phone_number")) System.out.println("   - Phone (column " + columnIndex.get("phone_number") + ")");
        if (columnIndex.containsKey("us_telephone")) System.out.println("   - US Telephone (column " + columnIndex.get("us_telephone") + ")");
        if (columnIndex.containsKey("foreign_telephone")) System.out.println("   - Foreign Telephone (column " + columnIndex.get("foreign_telephone") + ")");
        if (columnIndex.containsKey("country")) System.out.println("   - Country (column " + columnIndex.get("country") + ")");
        System.out.println();
        
        // Parse data rows
        int rowNumber = 0;
        int skippedCount = 0;
        
        for (int i = 1; i < csvRecords.size(); i++) {
            String record = csvRecords.get(i).trim();
            
            // Skip empty records
            if (record.isEmpty()) {
                continue;
            }
            
            try {
                rowNumber++;
                PhoneRecord phoneRecord = parseCSVRow(rowNumber, record, columnIndex);
                if (phoneRecord != null) {
                    records.add(phoneRecord);
                } else {
                    skippedCount++;
                }
            } catch (Exception e) {
                System.err.println("⚠️  Warning: Failed to parse row " + rowNumber + ": " + e.getMessage());
            }
        }
        
        System.out.println("✅ Parsed " + records.size() + " phone records from CSV file");
        if (skippedCount > 0) {
            System.out.println("⚠️  Skipped " + skippedCount + " records (no phone number)");
        }
        return new PhoneNumberData(records);
    }
    
    /**
     * Split CSV content into individual records (handles multi-line records)
     */
    private List<String> parseCSVRecords(String content) {
        List<String> records = new ArrayList<>();
        StringBuilder currentRecord = new StringBuilder();
        boolean inQuotes = false;
        
        for (int i = 0; i < content.length(); i++) {
            char c = content.charAt(i);
            
            if (c == '"') {
                currentRecord.append(c);
                // Check if it's an escaped quote
                if (i + 1 < content.length() && content.charAt(i + 1) == '"') {
                    currentRecord.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == '\n' && !inQuotes) {
                // End of record (newline outside quotes)
                String record = currentRecord.toString().trim();
                if (!record.isEmpty()) {
                    records.add(record);
                }
                currentRecord = new StringBuilder();
            } else {
                currentRecord.append(c);
            }
        }
        
        // Add last record
        String record = currentRecord.toString().trim();
        if (!record.isEmpty()) {
            records.add(record);
        }
        
        return records;
    }
    
    /**
     * Parse CSV header row to find column indices
     * Enhanced to match ExcelParser's comprehensive detection
     */
    private Map<String, Integer> parseHeader(String headerLine) {
        Map<String, Integer> columnIndex = new HashMap<>();
        String[] headers = parseCSVLine(headerLine);
        
        // Debug: Print all headers to help troubleshoot
        System.out.println("🔍 Scanning headers...");
        for (int i = 0; i < headers.length; i++) {
            String headerValue = headers[i].trim();
            System.out.println("   Column " + i + ": '" + headerValue + "'");
        }
        System.out.println();
        
        for (int i = 0; i < headers.length; i++) {
            String header = headers[i];
            if (header == null) {
                continue;
            }
            
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
            // Country columns - specifically check for "country" not just "count"
            else if (headerLower.equals("country") ||
                    (headerLower.contains("country") && !headerLower.contains("check")) ||
                    headerLower.contains("citizenship")) {
                if (!columnIndex.containsKey("country")) {
                    columnIndex.put("country", i);
                    System.out.println("   ✓ Found Country at column " + i + ": '" + header + "'");
                }
            }
            // Platform columns
            else if (headerLower.contains("platform") || headerLower.contains("source")) {
                columnIndex.put("platform", i);
                System.out.println("   ✓ Found Platform at column " + i + ": '" + header + "'");
            }
        }
        
        System.out.println();
        return columnIndex;
    }
    
    /**
     * Parse a single CSV row into a PhoneRecord
     */
    private PhoneRecord parseCSVRow(int rowNumber, String record, Map<String, Integer> columnIndex) {
        String[] values = parseCSVLine(record);
        
        String id = getValueAt(values, columnIndex.get("id"));
        String email = getValueAt(values, columnIndex.get("email"));
        
        String firstName = getValueAt(values, columnIndex.get("first_name"));
        String lastName = getValueAt(values, columnIndex.get("last_name"));
        String name = combineName(firstName, lastName);
        
        // Get phone number - prefer regular phone, then US telephone, then foreign telephone
        String phoneNumber = getValueAt(values, columnIndex.get("phone_number"));
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            phoneNumber = getValueAt(values, columnIndex.get("us_telephone"));
        }
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            phoneNumber = getValueAt(values, columnIndex.get("foreign_telephone"));
        }
        
        // Clean phone number
        phoneNumber = cleanPhoneNumber(phoneNumber);
        
        String country = getValueAt(values, columnIndex.get("country"));
        String platform = getValueAt(values, columnIndex.get("platform"));
        
        // Skip records without phone numbers
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return null;
        }
        
        return new PhoneRecord(rowNumber, id, email, name, phoneNumber, country, platform, record);
    }
    
    /**
     * Safely get value from array by index
     */
    private String getValueAt(String[] values, Integer index) {
        if (index == null || index < 0 || index >= values.length) {
            return null;
        }
        String value = values[index].trim();
        return value.isEmpty() || value.equalsIgnoreCase("null") ? null : value;
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
        if (firstName == null && lastName == null) {
            return null;
        }
        if (firstName == null) {
            return lastName;
        }
        if (lastName == null) {
            return firstName;
        }
        return firstName + " " + lastName;
    }
    
    /**
     * Parse a single CSV line (already extracted from multi-line records)
     */
    private String[] parseCSVLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    // Escaped quote
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                values.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        
        if (current.length() > 0 || line.endsWith(",")) {
            values.add(current.toString());
        }
        
        return values.toArray(new String[0]);
    }
}