package com.facebookleads.validator;

import java.util.Collections;
import java.util.List;

/**
 * Represents a raw phone record extracted from the input file.
 */
public class PhoneRecord {
    private final int rowNumber;
    private final String id;
    private final String email;
    private final String name;
    private final String phoneNumber;
    private final String country;
    private final String platform;
    private final String originalLine;
    private final List<String> originalColumnValues;

    public PhoneRecord(int rowNumber, String id, String email, String name,
                      String phoneNumber, String country, String platform, String originalLine) {
        this(rowNumber, id, email, name, phoneNumber, country, platform, originalLine, null);
    }

    public PhoneRecord(int rowNumber, String id, String email, String name,
                      String phoneNumber, String country, String platform, String originalLine,
                      List<String> originalColumnValues) {
        this.rowNumber = rowNumber;
        this.id = id;
        this.email = email;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.country = country;
        this.platform = platform;
        this.originalLine = originalLine;
        this.originalColumnValues = originalColumnValues == null ? null : Collections.unmodifiableList(originalColumnValues);
    }

    // Getters
    public int getRowNumber() { return rowNumber; }
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getPlatform() { return platform; }
    public String getCountry() { return country; }
    public String getOriginalLine() { return originalLine; }
    /** Original row values in same order as PhoneNumberData.getOriginalColumnNames(); null if not from CSV/Excel. */
    public List<String> getOriginalColumnValues() { return originalColumnValues; }
}

