package com.facebookleads.validator;

/**
 * Represents an invalid phone number with error details
 * Now includes validation details for numbers that were technically valid but failed quality checks
 */
public class InvalidPhoneRecord {
    private final int rowNumber;
    private final String id;
    private final String email;
    private final String name;
    private final String originalPhoneNumber;
    private final String error;
    private final String platform;
    private final String originalCountry;
    
    // Additional fields for forceful validation failures
    private final String e164;
    private final String international;
    private final String national;
    private final String countryCode;
    private final String region;
    private final String type;
    private final String validationMethod;
    
    public InvalidPhoneRecord(int rowNumber, String id, String email, String name,
                             String originalPhoneNumber, String error, String platform, String originalCountry) {
        this(rowNumber, id, email, name, originalPhoneNumber, error, platform, originalCountry,
             null, null, null, null, null, null, null);
    }
    
    public InvalidPhoneRecord(int rowNumber, String id, String email, String name,
                             String originalPhoneNumber, String error, String platform, String originalCountry,
                             String e164, String international, String national, String countryCode,
                             String region, String type, String validationMethod) {
        this.rowNumber = rowNumber;
        this.id = id;
        this.email = email;
        this.name = name;
        this.originalPhoneNumber = originalPhoneNumber;
        this.error = error;
        this.platform = platform;
        this.originalCountry = originalCountry;
        this.e164 = e164;
        this.international = international;
        this.national = national;
        this.countryCode = countryCode;
        this.region = region;
        this.type = type;
        this.validationMethod = validationMethod;
    }
    
    // Getters
    public int getRowNumber() { return rowNumber; }
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getOriginalPhoneNumber() { return originalPhoneNumber; }
    public String getError() { return error; }
    public String getPlatform() { return platform; }
    public String getOriginalCountry() { return originalCountry; }
    public String getE164() { return e164; }
    public String getInternational() { return international; }
    public String getNational() { return national; }
    public String getCountryCode() { return countryCode; }
    public String getRegion() { return region; }
    public String getType() { return type; }
    public String getValidationMethod() { return validationMethod; }
}