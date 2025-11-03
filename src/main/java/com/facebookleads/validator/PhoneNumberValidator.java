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

    // Map country names to ISO region codes
    private static final Map<String, String> COUNTRY_TO_REGION = new HashMap<>();
    static {
        COUNTRY_TO_REGION.put("ARGENTINA", "AR");
        COUNTRY_TO_REGION.put("BANGLADESH", "BD");
        COUNTRY_TO_REGION.put("BRAZIL", "BR");
        COUNTRY_TO_REGION.put("CANADA", "CA");
        COUNTRY_TO_REGION.put("CHILE", "CL");
        COUNTRY_TO_REGION.put("CHINA", "CN");
        COUNTRY_TO_REGION.put("COLOMBIA", "CO");
        COUNTRY_TO_REGION.put("COSTA RICA", "CR");
        COUNTRY_TO_REGION.put("ECUADOR", "EC");
        COUNTRY_TO_REGION.put("EGYPT", "EG");
        COUNTRY_TO_REGION.put("EL SALVADOR", "SV");
        COUNTRY_TO_REGION.put("ELSALVADOR", "SV");
        COUNTRY_TO_REGION.put("HONDURAS", "HN");
        COUNTRY_TO_REGION.put("INDIA", "IN");
        COUNTRY_TO_REGION.put("ISRAEL", "IL");
        COUNTRY_TO_REGION.put("KAZAKHSTAN", "KZ");
        COUNTRY_TO_REGION.put("KYRGYZSTAN", "KG");
        COUNTRY_TO_REGION.put("MEXICO", "MX");
        COUNTRY_TO_REGION.put("MOROCCO", "MA");
        COUNTRY_TO_REGION.put("NEPAL", "NP");
        COUNTRY_TO_REGION.put("NIGERIA", "NG");
        COUNTRY_TO_REGION.put("PAKISTAN", "PK");
        COUNTRY_TO_REGION.put("PERU", "PE");
        COUNTRY_TO_REGION.put("RUSSIA", "RU");
        COUNTRY_TO_REGION.put("RUSSIAN FEDERATION", "RU");
        COUNTRY_TO_REGION.put("SAUDI ARABIA", "SA");
        COUNTRY_TO_REGION.put("SPAIN", "ES");
        COUNTRY_TO_REGION.put("TURKEY", "TR");
        COUNTRY_TO_REGION.put("UNITED STATES", "US");
        COUNTRY_TO_REGION.put("US", "US");
        COUNTRY_TO_REGION.put("USA", "US");
        COUNTRY_TO_REGION.put("UZBEKISTAN", "UZ");
        COUNTRY_TO_REGION.put("VENEZUELA", "VE");
        COUNTRY_TO_REGION.put("VIET NAM", "VN");
        COUNTRY_TO_REGION.put("VIETNAM", "VN");
        COUNTRY_TO_REGION.put("ZAMBIA", "ZM");
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
                        record.getPlatform()));
                continue;
            }

            try {
                String originalPhoneNumber = phoneNumberStr; // SAVE ORIGINAL

                // Get region code from country hint
                String detectedRegion = getRegionFromCountry(countryHint);

                boolean isValid = false;
                PhoneNumber validPhoneNumber = null;

                // Step 1: Try as-is with + prefix (auto-detect country code)
                try {
                    String attempt1 = originalPhoneNumber.startsWith("+")
                            ? originalPhoneNumber
                            : "+" + originalPhoneNumber;

                    PhoneNumber phoneNumber = phoneUtil.parse(attempt1, null);
                    if (phoneUtil.isValidNumber(phoneNumber)) {
                        isValid = true;
                        validPhoneNumber = phoneNumber;
                    }
                } catch (NumberParseException e) {
                    // Continue to step 2
                }

                // Step 2: If country hint exists, try parsing with that region
                if (!isValid && detectedRegion != null) {
                    try {
                        // Try with the detected region (libphonenumber will add country code)
                        PhoneNumber phoneNumber = phoneUtil.parse(originalPhoneNumber, detectedRegion);
                        if (phoneUtil.isValidNumber(phoneNumber)) {
                            isValid = true;
                            validPhoneNumber = phoneNumber;
                        }
                    } catch (NumberParseException e) {
                        // Continue to step 3
                    }
                }

                // Step 3: Try with US as fallback
                if (!isValid) {
                    try {
                        PhoneNumber phoneNumber = phoneUtil.parse(originalPhoneNumber, "US");
                        if (phoneUtil.isValidNumber(phoneNumber)) {
                            isValid = true;
                            validPhoneNumber = phoneNumber;
                        }
                    } catch (NumberParseException e) {
                        // All attempts failed
                    }
                }

                if (isValid && validPhoneNumber != null) {
                    // Valid number - extract all information
                    String countryCode = "+" + validPhoneNumber.getCountryCode();
                    String regionCode = phoneUtil.getRegionCodeForNumber(validPhoneNumber);
                    String numberType = phoneUtil.getNumberType(validPhoneNumber).toString();

                    validNumbers.add(new ValidPhoneRecord(
                            record.getRowNumber(),
                            record.getId(),
                            record.getEmail(),
                            record.getName(),
                            originalPhoneNumber, // USE ORIGINAL HERE
                            phoneUtil.format(validPhoneNumber, PhoneNumberFormat.E164),
                            phoneUtil.format(validPhoneNumber, PhoneNumberFormat.INTERNATIONAL),
                            phoneUtil.format(validPhoneNumber, PhoneNumberFormat.NATIONAL),
                            countryCode,
                            regionCode != null ? regionCode : "Unknown",
                            numberType,
                            record.getPlatform()));
                } else {
                    // Invalid for all attempted methods
                    String errorMsg = detectedRegion != null
                            ? "Number is not valid (tried: auto-detect, " + detectedRegion + ", US)"
                            : "Number is not valid (tried: auto-detect, US)";

                    invalidNumbers.add(new InvalidPhoneRecord(
                            record.getRowNumber(),
                            record.getId(),
                            record.getEmail(),
                            record.getName(),
                            originalPhoneNumber, // USE ORIGINAL HERE TOO
                            errorMsg,
                            record.getPlatform()));
                }

            } catch (Exception e) {
                // Catch any other unexpected exceptions
                invalidNumbers.add(new InvalidPhoneRecord(
                        record.getRowNumber(),
                        record.getId(),
                        record.getEmail(),
                        record.getName(),
                        phoneNumberStr, // Original
                        "Unexpected error: " + e.getMessage(),
                        record.getPlatform()));
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
     * Get ISO region code from country name
     */
    private String getRegionFromCountry(String countryName) {
        if (countryName == null || countryName.trim().isEmpty()) {
            return null;
        }
        return COUNTRY_TO_REGION.get(countryName.toUpperCase().trim());
    }
}