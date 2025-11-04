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

    // All country codes for forceful testing (Step 4)
    private static final String[] FORCEFUL_TEST_REGIONS = {
            "US", "BR", "MX", "CO", "CR", "ES", "CA", "AR",
            "BD", "BE", "BJ", "CL", "CN", "EC", "EG", "SV",
            "HN", "IN", "IL", "KZ", "KG", "MA", "MY", "NP",
            "NG", "OM", "PK", "PE", "RU", "SA", "SG", "TR",
            "UZ", "VE", "VN", "ZM", "AE"
    };

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

        // Add missing countries
        COUNTRY_TO_REGION.put("BELGIUM", "BE");
        COUNTRY_TO_REGION.put("BENIN", "BJ");
        COUNTRY_TO_REGION.put("OMAN", "OM");
        COUNTRY_TO_REGION.put("SINGAPORE", "SG");
        COUNTRY_TO_REGION.put("MALAYSIA", "MY");
        COUNTRY_TO_REGION.put("UNITED ARAB EMIRATES", "AE");
        COUNTRY_TO_REGION.put("UAE", "AE");

        // Also add ISO codes directly for easier lookup
        COUNTRY_TO_REGION.put("AR", "AR");
        COUNTRY_TO_REGION.put("BD", "BD");
        COUNTRY_TO_REGION.put("BR", "BR");
        COUNTRY_TO_REGION.put("CA", "CA");
        COUNTRY_TO_REGION.put("CL", "CL");
        COUNTRY_TO_REGION.put("CN", "CN");
        COUNTRY_TO_REGION.put("CO", "CO");
        COUNTRY_TO_REGION.put("CR", "CR");
        COUNTRY_TO_REGION.put("EC", "EC");
        COUNTRY_TO_REGION.put("EG", "EG");
        COUNTRY_TO_REGION.put("SV", "SV");
        COUNTRY_TO_REGION.put("HN", "HN");
        COUNTRY_TO_REGION.put("IN", "IN");
        COUNTRY_TO_REGION.put("IL", "IL");
        COUNTRY_TO_REGION.put("KZ", "KZ");
        COUNTRY_TO_REGION.put("KG", "KG");
        COUNTRY_TO_REGION.put("MX", "MX");
        COUNTRY_TO_REGION.put("MA", "MA");
        COUNTRY_TO_REGION.put("NP", "NP");
        COUNTRY_TO_REGION.put("NG", "NG");
        COUNTRY_TO_REGION.put("PK", "PK");
        COUNTRY_TO_REGION.put("PE", "PE");
        COUNTRY_TO_REGION.put("RU", "RU");
        COUNTRY_TO_REGION.put("SA", "SA");
        COUNTRY_TO_REGION.put("ES", "ES");
        COUNTRY_TO_REGION.put("TR", "TR");
        COUNTRY_TO_REGION.put("UZ", "UZ");
        COUNTRY_TO_REGION.put("VE", "VE");
        COUNTRY_TO_REGION.put("VN", "VN");
        COUNTRY_TO_REGION.put("ZM", "ZM");
        COUNTRY_TO_REGION.put("BE", "BE");
        COUNTRY_TO_REGION.put("BJ", "BJ");
        COUNTRY_TO_REGION.put("OM", "OM");
        COUNTRY_TO_REGION.put("SG", "SG");
        COUNTRY_TO_REGION.put("MY", "MY");
        COUNTRY_TO_REGION.put("AE", "AE");
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
                        record.getPlatform(),
                        countryHint));
                continue;
            }

            try {
                String originalPhoneNumber = phoneNumberStr; // SAVE ORIGINAL

                // Get region code from country hint
                String detectedRegion = getRegionFromCountry(countryHint);

                boolean isValid = false;
                PhoneNumber validPhoneNumber = null;
                String validationMethod = null;

                // Step 1: Try as-is with + prefix (auto-detect country code)
                try {
                    String attempt1 = originalPhoneNumber.startsWith("+")
                            ? originalPhoneNumber
                            : "+" + originalPhoneNumber;

                    PhoneNumber phoneNumber = phoneUtil.parse(attempt1, null);
                    if (phoneUtil.isValidNumber(phoneNumber)) {
                        isValid = true;
                        validPhoneNumber = phoneNumber;
                        validationMethod = "original";
                    }
                } catch (NumberParseException e) {
                    // Continue to step 2
                }

                // Step 2: If country hint exists, try parsing with that region
                if (!isValid && detectedRegion != null) {
                    try {
                        // Get the expected country code for this region
                        int expectedCountryCode = phoneUtil.getCountryCodeForRegion(detectedRegion);
                        String phoneToTest = originalPhoneNumber;

                        // Strip leading + if present
                        if (phoneToTest.startsWith("+")) {
                            phoneToTest = phoneToTest.substring(1);
                        }

                        // If number starts with the country code, remove it for national parsing
                        String countryCodeStr = String.valueOf(expectedCountryCode);
                        if (phoneToTest.startsWith(countryCodeStr)) {
                            phoneToTest = phoneToTest.substring(countryCodeStr.length());
                        }

                        // Try with the detected region (libphonenumber will add country code)
                        PhoneNumber phoneNumber = phoneUtil.parse(phoneToTest, detectedRegion);
                        if (phoneUtil.isValidNumber(phoneNumber)) {
                            isValid = true;
                            validPhoneNumber = phoneNumber;
                            validationMethod = "country_code";
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
                            validationMethod = "us_fallback";
                        }
                    } catch (NumberParseException e) {
                        // Continue to step 4
                    }
                }

                // Step 4: Forceful testing - try ALL country codes
                if (!isValid) {
                    for (String region : FORCEFUL_TEST_REGIONS) {
                        try {
                            PhoneNumber phoneNumber = phoneUtil.parse(originalPhoneNumber, region);
                            if (phoneUtil.isValidNumber(phoneNumber)) {
                                isValid = true;
                                validPhoneNumber = phoneNumber;
                                validationMethod = "forceful";
                                break; // Found valid, stop searching
                            }
                        } catch (NumberParseException e) {
                            // Continue to next region
                        }
                    }
                }

                if (isValid && validPhoneNumber != null) {
                    String countryCode = "+" + validPhoneNumber.getCountryCode();
                    String regionCode = phoneUtil.getRegionCodeForNumber(validPhoneNumber);
                    String numberType = phoneUtil.getNumberType(validPhoneNumber).toString();

                    // If it only validated through forceful testing, mark as invalid
                    if ("forceful".equals(validationMethod)) {
                        invalidNumbers.add(new InvalidPhoneRecord(
                                record.getRowNumber(),
                                record.getId(),
                                record.getEmail(),
                                record.getName(),
                                originalPhoneNumber,
                                String.format("Only validated through forceful testing as %s %s - data quality issue",
                                        regionCode,
                                        phoneUtil.format(validPhoneNumber, PhoneNumberFormat.E164)),
                                record.getPlatform(),
                                countryHint));
                    } else {
                        // Valid number through normal validation
                        validNumbers.add(new ValidPhoneRecord(
                                record.getRowNumber(),
                                record.getId(),
                                record.getEmail(),
                                record.getName(),
                                originalPhoneNumber,
                                phoneUtil.format(validPhoneNumber, PhoneNumberFormat.E164),
                                phoneUtil.format(validPhoneNumber, PhoneNumberFormat.INTERNATIONAL),
                                phoneUtil.format(validPhoneNumber, PhoneNumberFormat.NATIONAL),
                                countryCode,
                                regionCode != null ? regionCode : "Unknown",
                                numberType,
                                record.getPlatform(),
                                validationMethod,
                                countryHint));
                    }
                } else {
                    // Invalid for all attempted methods
                    String errorMsg = detectedRegion != null
                            ? "Number is not valid (tried: auto-detect, " + detectedRegion + ", US, forceful)"
                            : "Number is not valid (tried: auto-detect, US, forceful)";

                    invalidNumbers.add(new InvalidPhoneRecord(
                            record.getRowNumber(),
                            record.getId(),
                            record.getEmail(),
                            record.getName(),
                            originalPhoneNumber,
                            errorMsg,
                            record.getPlatform(),
                            countryHint));
                }

            } catch (Exception e) {
                // Catch any other unexpected exceptions
                invalidNumbers.add(new InvalidPhoneRecord(
                        record.getRowNumber(),
                        record.getId(),
                        record.getEmail(),
                        record.getName(),
                        phoneNumberStr,
                        "Unexpected error: " + e.getMessage(),
                        record.getPlatform(),
                        countryHint));
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
     * Get ISO region code from country name or ISO code
     */
    private String getRegionFromCountry(String countryName) {
        if (countryName == null || countryName.trim().isEmpty()) {
            return null;
        }
        return COUNTRY_TO_REGION.get(countryName.toUpperCase().trim());
    }
}