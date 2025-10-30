package com.facebookleads.validator;

/**
 * Represents a raw phone record extracted from the SQL file
 */
public class PhoneRecord {
    private final int rowNumber;
    private final String id;
    private final String email;
    private final String name;
    private final String phoneNumber;
    private final String country;
    private final String originalLine;
    
    public PhoneRecord(int rowNumber, String id, String email, String name, 
                      String phoneNumber, String country, String originalLine) {
        this.rowNumber = rowNumber;
        this.id = id;
        this.email = email;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.country = country;
        this.originalLine = originalLine;
    }
    
    // Getters
    public int getRowNumber() { return rowNumber; }
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getCountry() { return country; }
    public String getOriginalLine() { return originalLine; }
}

