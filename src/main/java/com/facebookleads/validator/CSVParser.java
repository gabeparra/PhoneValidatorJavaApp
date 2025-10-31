package com.facebookleads.validator;

import java.io.*;
import java.nio.file.*;
import java.util.*;

/**
 * Parses phone numbers from CSV files (Excel exports, etc.)
 * Uses header row to detect column positions dynamically
 * Handles multi-line CSV records with quoted fields
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
        if (columnIndex.containsKey("country")) System.out.println("   - Country (column " + columnIndex.get("country") + ")");
        System.out.println();
        
        // Parse data rows
        int rowNumber = 0;
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
                }
            } catch (Exception e) {
                System.err.println("⚠️  Warning: Failed to parse row " + rowNumber + ": " + e.getMessage());
            }
        }
        
        System.out.println("✅ Parsed " + records.size() + " phone records from CSV file");
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
     */
    private Map<String, Integer> parseHeader(String headerLine) {
        Map<String, Integer> columnIndex = new HashMap<>();
        String[] headers = parseCSVLine(headerLine);
        
        for (int i = 0; i < headers.length; i++) {
            String header = headers[i].toLowerCase().trim();
            
            if ((header.contains("emplid") || header.equals("id")) && !columnIndex.containsKey("id")) {
                columnIndex.put("id", i);
            } else if (header.equals("personal email") || header.equals("campus email") || header.equals("email")) {
                if (!columnIndex.containsKey("email")) {
                    columnIndex.put("email", i);
                }
            } else if (header.equals("first name")) {
                columnIndex.put("first_name", i);
            } else if (header.equals("last name")) {
                columnIndex.put("last_name", i);
            } else if (header.equals("phone") || header.equals("phone_number")) {
                columnIndex.put("phone_number", i);
            } else if (header.equals("country")) {
                columnIndex.put("country", i);
            } else if (header.contains("platform") || header.contains("source")) {
                columnIndex.put("platform", i);
            }
        }
        
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
        
        String phoneNumber = getValueAt(values, columnIndex.get("phone_number"));
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