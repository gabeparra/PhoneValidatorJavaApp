package com.facebookleads.validator;

/**
 * Represents an invalid phone number with error details
 */
public class InvalidPhoneRecord {
    private final int rowNumber;
    private final String id;
    private final String email;
    private final String name;
    private final String originalPhoneNumber;
    private final String error;
    private final String platform;
    public InvalidPhoneRecord(int rowNumber, String id, String email, String name,
                             String originalPhoneNumber, String error, String platform) {
        this.rowNumber = rowNumber;
        this.id = id;
        this.email = email;
        this.name = name;
        this.originalPhoneNumber = originalPhoneNumber;
        this.error = error;
        this.platform = platform;
    }
    
    // Getters
    public int getRowNumber() { return rowNumber; }
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getOriginalPhoneNumber() { return originalPhoneNumber; }
    public String getError() { return error; }
    public String getPlatform() { return platform; }
}

