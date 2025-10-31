package com.facebookleads.validator;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;

/**
 * Parses phone numbers from Facebook leads SQL export file
 */
public class SQLParser {
    
    public PhoneNumberData parse(String filePath) throws IOException {
        System.out.println("📄 Reading SQL file: " + filePath);
        
        List<PhoneRecord> records = new ArrayList<>();
        List<String> lines = Files.readAllLines(Paths.get(filePath));
        
        int rowNumber = 0;
        String previousLine = "";
        
        for (String line : lines) {
            line = line.trim();
            
            // Check if this line has VALUES (data line)
            if (line.startsWith("(") && line.endsWith(");")) {
                // This is a VALUES line, use the previous INSERT line
                if (previousLine.contains("INSERT INTO")) {
                    try {
                        rowNumber++;
                        PhoneRecord record = parseInsertStatement(rowNumber, previousLine + " " + line);
                        if (record != null) {
                            records.add(record);
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️  Warning: Failed to parse line " + rowNumber + ": " + e.getMessage());
                    }
                }
            }
            
            previousLine = line;
        }
        
        System.out.println("✅ Parsed " + records.size() + " phone records from SQL file");
        return new PhoneNumberData(records);
    }
    
    private PhoneRecord parseInsertStatement(int rowNumber, String fullStatement) {
        // Extract the VALUES part
        Pattern valuesPattern = Pattern.compile("VALUES\\s*\\((.+)\\);?$", Pattern.CASE_INSENSITIVE);
        Matcher matcher = valuesPattern.matcher(fullStatement);
        
        if (!matcher.find()) {
            return null;
        }
        
        String valuesString = matcher.group(1);
        List<String> values = parseValues(valuesString);
        
        if (values.size() < 23) {
            System.err.println("⚠️  Warning: Line " + rowNumber + " has only " + values.size() + " values, expected 23");
            return null;
        }
        
        // Extract the relevant fields by position
        String id = cleanValue(values.get(0));           // Column 0: id
        String email = cleanValue(values.get(12));       // Column 12: email
        String name = cleanValue(values.get(13));        // Column 13: name
        String phoneNumber = cleanValue(values.get(16)); // Column 16: phone_number
        String country = cleanValue(values.get(21));     // Column 21: country
        String platform = cleanValue(values.get(11));    // Column 22: platform
        
        return new PhoneRecord(rowNumber, id, email, name, phoneNumber, country, platform, fullStatement);
    }
    
    /**
     * Parse the VALUES clause into individual field values
     * Handles quoted strings, NULLs, and numbers
     */
    private List<String> parseValues(String valuesString) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuote = false;
        boolean escaped = false;
        
        for (int i = 0; i < valuesString.length(); i++) {
            char c = valuesString.charAt(i);
            
            if (escaped) {
                current.append(c);
                escaped = false;
                continue;
            }
            
            if (c == '\\') {
                escaped = true;
                continue;
            }
            
            if (c == '\'') {
                if (inQuote) {
                    // Check if this is an escaped quote (two single quotes)
                    if (i + 1 < valuesString.length() && valuesString.charAt(i + 1) == '\'') {
                        current.append('\'');
                        i++; // Skip the next quote
                    } else {
                        inQuote = false;
                    }
                } else {
                    inQuote = true;
                }
                continue;
            }
            
            if (!inQuote && c == ',') {
                // End of value
                values.add(current.toString().trim());
                current = new StringBuilder();
                continue;
            }
            
            current.append(c);
        }
        
        // Add the last value
        if (current.length() > 0) {
            values.add(current.toString().trim());
        }
        
        return values;
    }
    
    /**
     * Clean up extracted values - remove quotes, handle NULL
     */
    private String cleanValue(String value) {
        if (value == null || value.equalsIgnoreCase("NULL")) {
            return null;
        }
        
        // Remove surrounding quotes
        value = value.trim();
        if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length() - 1);
        }
        
        return value;
    }
}