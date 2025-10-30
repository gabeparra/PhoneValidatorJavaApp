package com.facebookleads.validator;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;

/**
 * Parses phone numbers from Facebook leads SQL export file
 */
public class SQLParser {
    
    // Pattern to extract values from INSERT statement
    // The SQL format has these columns in order:
    // id, created_time, ad_id, ad_name, adset_id, adset_name, campaign_id, campaign_name, 
    // form_id, form_name, is_organic, platform, email, name, last, date_of_birth, 
    // phone_number, city, inbox_url, toslate, career_interest, country, exported
    private static final Pattern INSERT_PATTERN = Pattern.compile(
        "INSERT\\s+INTO\\s+[^(]+\\([^)]+\\)\\s+VALUES\\s*\\((.+)\\)",
        Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );
    
    public PhoneNumberData parse(String filePath) throws IOException {
        System.out.println("📄 Reading SQL file: " + filePath);
        
        List<PhoneRecord> records = new ArrayList<>();
        List<String> lines = Files.readAllLines(Paths.get(filePath));
        
        int rowNumber = 0;
        for (String line : lines) {
            if (!line.trim().startsWith("INSERT") || line.length() < 100) {
                continue;
            }
            
            try {
                rowNumber++;
                PhoneRecord record = parseInsertStatement(rowNumber, line);
                if (record != null) {
                    records.add(record);
                }
            } catch (Exception e) {
                System.err.println("⚠️  Warning: Failed to parse line " + rowNumber + ": " + e.getMessage());
            }
        }
        
        System.out.println("✅ Parsed " + records.size() + " phone records from SQL file");
        return new PhoneNumberData(records);
    }
    
    private PhoneRecord parseInsertStatement(int rowNumber, String line) {
        Matcher matcher = INSERT_PATTERN.matcher(line);
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
        String id = values.get(0);           // Column 0: id
        String email = values.get(12);       // Column 12: email
        String name = values.get(13);        // Column 13: name
        String phoneNumber = values.get(16); // Column 16: phone_number
        String country = values.get(21);     // Column 21: country
        
        return new PhoneRecord(rowNumber, id, email, name, phoneNumber, country, line);
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
}

