package com.facebookleads.validator;

import com.google.i18n.phonenumbers.*;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;

import java.util.*;

/**
 * Validates and formats phone numbers using Google libphonenumber
 */
public class PhoneNumberValidator {
    
    private final PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();
    
    // Map common country names to ISO region codes
    private static final Map<String, String> COUNTRY_MAP = new HashMap<>();
    static {
        COUNTRY_MAP.put("Brazil", "BR");
        COUNTRY_MAP.put("Colombia", "CO");
        COUNTRY_MAP.put("Costa Rica", "CR");
        COUNTRY_MAP.put("Mexico", "MX");
        COUNTRY_MAP.put("United States", "US");
        COUNTRY_MAP.put("Spain", "ES");
    }
    
    public ValidationResult validate(PhoneNumberData data) {
        System.out.println("🔍 Validating " + data.getCount() + " phone numbers...");
        
        List<ValidPhoneRecord> validNumbers = new ArrayList<>();
        List<InvalidPhoneRecord> invalidNumbers = new ArrayList<>();
        
        int processed = 0;
        for (PhoneRecord record : data.getRecords()) {
            processed++;
            if (processed % 10 == 0) {
                System.out.print(".");
                if (processed % 50 == 0) {
                    System.out.println(" " + processed + "/" + data.getCount());
                }
            }
            
            String phoneNumberStr = record.getPhoneNumber();
            String countryHint = record.getCountry();
            
            // Skip obviously invalid numbers
            if (phoneNumberStr == null || phoneNumberStr.trim().isEmpty() || 
                phoneNumberStr.equals("NA") || phoneNumberStr.equals("NULL")) {
                invalidNumbers.add(new InvalidPhoneRecord(
                    record.getRowNumber(),
                    record.getId(),
                    record.getEmail(),
                    record.getName(),
                    phoneNumberStr,
                    "Empty or NULL phone number",
                    record.getPlatform()    
                ));
                continue;
            }
            
            try {
                // Determine the default region for parsing
                String defaultRegion = getDefaultRegion(phoneNumberStr, countryHint);
                
                // Parse the phone number
                PhoneNumber phoneNumber = phoneUtil.parse(phoneNumberStr, defaultRegion);
                
                // Validate the phone number
                if (phoneUtil.isValidNumber(phoneNumber)) {
                    // Valid number - extract all information
                    String countryCode = "+" + phoneNumber.getCountryCode();
                    String regionCode = phoneUtil.getRegionCodeForNumber(phoneNumber);
                    String numberType = phoneUtil.getNumberType(phoneNumber).toString();
                    
                    validNumbers.add(new ValidPhoneRecord(
                        record.getRowNumber(),
                        record.getId(),
                        record.getEmail(),
                        record.getName(),
                        phoneNumberStr,
                        phoneUtil.format(phoneNumber, PhoneNumberFormat.E164),
                        phoneUtil.format(phoneNumber, PhoneNumberFormat.INTERNATIONAL),
                        phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL),
                        countryCode,
                        regionCode != null ? regionCode : "Unknown",
                        numberType,
                        record.getPlatform()
                    ));
                } else {
                    // Invalid number - not valid for its region
                    invalidNumbers.add(new InvalidPhoneRecord(
                        record.getRowNumber(),
                        record.getId(),
                        record.getEmail(),
                        record.getName(),
                        phoneNumberStr,
                        "Number is not valid for its region",
                        record.getPlatform()
                    ));
                }
                
            } catch (NumberParseException e) {
                // Parse error
                String errorMsg;
                switch (e.getErrorType()) {
                    case INVALID_COUNTRY_CODE:
                        errorMsg = "Invalid country code";
                        break;
                    case NOT_A_NUMBER:
                        errorMsg = "Not a valid phone number format";
                        break;
                    case TOO_SHORT_NSN:
                        errorMsg = "Number too short";
                        break;
                    case TOO_SHORT_AFTER_IDD:
                        errorMsg = "Number too short after international dialing prefix";
                        break;
                    case TOO_LONG:
                        errorMsg = "Number too long";
                        break;
                    default:
                        errorMsg = "Parse error: " + e.getMessage();
                }
                
                invalidNumbers.add(new InvalidPhoneRecord(
                    record.getRowNumber(),
                    record.getId(),
                    record.getEmail(),
                    record.getName(),
                    phoneNumberStr,
                    errorMsg,
                    record.getPlatform()
                ));
            }
        }
        
        if (processed % 50 != 0) {
            System.out.println();
        }
        
        System.out.println("✅ Validation complete!");
        System.out.println("   Valid: " + validNumbers.size());
        System.out.println("   Invalid: " + invalidNumbers.size());
        
        return new ValidationResult(validNumbers, invalidNumbers);
    }
    
    /**
     * Determine the default region code for parsing
     */
    private String getDefaultRegion(String phoneNumber, String countryHint) {
        // If the number starts with +, it has the country code
        if (phoneNumber.startsWith("+")) {
            return null; // Let libphonenumber figure it out
        }
        
        // Otherwise, use the country hint if available
        if (countryHint != null && COUNTRY_MAP.containsKey(countryHint)) {
            return COUNTRY_MAP.get(countryHint);
        }
        
        // Default to null (will try to infer)
        return null;
    }
}

