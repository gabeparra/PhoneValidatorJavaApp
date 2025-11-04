package com.facebookleads.validator;

/**
 * Represents a validated phone number with formatted outputs
 */
public class ValidPhoneRecord {
    private final int rowNumber;
    private final String id;
    private final String email;
    private final String name;
    private final String originalPhoneNumber;
    private final String e164;
    private final String international;
    private final String national;
    private final String countryCode;
    private final String region;
    private final String type;
    private final String platform;
    private final String validationMethod;  // ← ADD THIS
    
    public ValidPhoneRecord(int rowNumber, String id, String email, String name,
                           String originalPhoneNumber, String e164, String international,
                           String national, String countryCode, String region, String type, String platform,
                           String validationMethod) {  // ← ADD PARAMETER
        this.rowNumber = rowNumber;
        this.id = id;
        this.email = email;
        this.name = name;
        this.originalPhoneNumber = originalPhoneNumber;
        this.e164 = e164;
        this.international = international;
        this.national = national;
        this.countryCode = countryCode;
        this.region = region;
        this.type = type;
        this.platform = platform;
        this.validationMethod = validationMethod;  // ← ADD THIS
    }
    
    // Getters
    public int getRowNumber() { return rowNumber; }
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getOriginalPhoneNumber() { return originalPhoneNumber; }
    public String getE164() { return e164; }
    public String getInternational() { return international; }
    public String getNational() { return national; }
    public String getCountryCode() { return countryCode; }
    public String getRegion() { return region; }
    public String getType() { return type; }
    public String getPlatform() { return platform; }
    public String getValidationMethod() { return validationMethod; }  // ← ADD THIS GETTER
}