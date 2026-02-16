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
            "UZ", "VE", "VN", "ZM", "AE", "TZ"
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
        COUNTRY_TO_REGION.put("TANZANIA", "TZ");

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
        COUNTRY_TO_REGION.put("TZ", "TZ");
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
                    // Get the expected country code for this region
                    int expectedCountryCode = phoneUtil.getCountryCodeForRegion(detectedRegion);
                    String phoneToTest = originalPhoneNumber;

                    // Strip leading + if present
                    if (phoneToTest.startsWith("+")) {
                        phoneToTest = phoneToTest.substring(1);
                    }

                    String countryCodeStr = String.valueOf(expectedCountryCode);

                    // Attempt 1: Try parsing as-is with the region (libphonenumber handles national
                    // format)
                    try {
                        PhoneNumber phoneNumber = phoneUtil.parse(phoneToTest, detectedRegion);
                        if (phoneUtil.isValidNumber(phoneNumber)) {
                            isValid = true;
                            validPhoneNumber = phoneNumber;
                            validationMethod = "country_code";
                        }
                    } catch (NumberParseException e) {
                        // Continue to next attempt
                    }

                    // Attempt 2: If number starts with country code, parse with auto-detect
                    if (!isValid && phoneToTest.startsWith(countryCodeStr)) {
                        try {
                            PhoneNumber phoneNumber = phoneUtil.parse("+" + phoneToTest, null);
                            if (phoneUtil.isValidNumber(phoneNumber)) {
                                isValid = true;
                                validPhoneNumber = phoneNumber;
                                validationMethod = "country_code";
                            }
                        } catch (NumberParseException e) {
                            // Continue to next attempt
                        }
                    }

                    // Attempt 3: Add leading 0 for national format (if applicable)
                    if (!isValid) {
                        String nationalFormat = phoneToTest;
                        // Remove country code if present for national format attempt
                        if (nationalFormat.startsWith(countryCodeStr)) {
                            nationalFormat = nationalFormat.substring(countryCodeStr.length());
                        }

                        // If number is too long (might have extra leading digit), try removing it
                        if (nationalFormat.length() > 9 && detectedRegion.equals("EC")) {
                            // Ecuador numbers should be 9 digits, try removing first digit
                            String shortened = nationalFormat.substring(1);
                            if (!shortened.startsWith("0")) {
                                nationalFormat = "0" + shortened;
                                try {
                                    PhoneNumber phoneNumber = phoneUtil.parse(nationalFormat, detectedRegion);
                                    if (phoneUtil.isValidNumber(phoneNumber)) {
                                        isValid = true;
                                        validPhoneNumber = phoneNumber;
                                        validationMethod = "country_code";
                                    }
                                } catch (NumberParseException e) {
                                    // Try original format
                                }
                            }
                        }

                        if (!nationalFormat.startsWith("0") && nationalFormat.length() > 0) {
                            // Check if this region typically uses leading 0 for national format
                            if (detectedRegion.equals("EC") || detectedRegion.equals("PE") ||
                                    detectedRegion.equals("CO") || detectedRegion.equals("CL") ||
                                    detectedRegion.equals("AR") || detectedRegion.equals("VE")) {
                                nationalFormat = "0" + nationalFormat;
                                try {
                                    PhoneNumber phoneNumber = phoneUtil.parse(nationalFormat, detectedRegion);
                                    if (phoneUtil.isValidNumber(phoneNumber)) {
                                        isValid = true;
                                        validPhoneNumber = phoneNumber;
                                        validationMethod = "country_code";
                                    }
                                } catch (NumberParseException e) {
                                    // Continue to step 3
                                }
                            }
                        }
                    }

                    // Attempt 4: Add country code prefix ONLY if number doesn't already have it
                    // and the resulting length makes sense (not too long)
                    if (!isValid && !phoneToTest.startsWith(countryCodeStr)) {
                        // Check if adding country code would create a reasonable length
                        // Ecuador: country code (3) + national number (9) = 12 digits total
                        int expectedTotalLength = countryCodeStr.length() + 9; // Adjust per country if needed
                        String testWithCountryCode = countryCodeStr + phoneToTest;

                        // If the number is too long, try removing leading digits that might be area
                        // code
                        if (testWithCountryCode.length() >= expectedTotalLength + 1) {
                            // Try removing first digit (might be area code prefix)
                            if (phoneToTest.length() > 9) {
                                String shortened = phoneToTest.substring(1);
                                testWithCountryCode = countryCodeStr + shortened;
                            }
                        }

                        if (testWithCountryCode.length() <= expectedTotalLength + 2) { // Allow some flexibility
                            try {
                                PhoneNumber phoneNumber = phoneUtil.parse("+" + testWithCountryCode, null);
                                if (phoneUtil.isValidNumber(phoneNumber)) {
                                    isValid = true;
                                    validPhoneNumber = phoneNumber;
                                    validationMethod = "country_code";
                                }
                            } catch (NumberParseException e) {
                                // Continue to step 3
                            }
                        }
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

                // Step 4: Forceful testing - try ALL country codes with multiple formats
                if (!isValid) {
                    for (String region : FORCEFUL_TEST_REGIONS) {
                        int regionCountryCode = phoneUtil.getCountryCodeForRegion(region);
                        String countryCodeStr = String.valueOf(regionCountryCode);
                        String phoneToTest = originalPhoneNumber;

                        // Strip leading + if present
                        if (phoneToTest.startsWith("+")) {
                            phoneToTest = phoneToTest.substring(1);
                        }

                        // Try format 1: Parse as-is with the region (libphonenumber handles national
                        // format)
                        try {
                            PhoneNumber phoneNumber = phoneUtil.parse(phoneToTest, region);
                            if (phoneUtil.isValidNumber(phoneNumber)) {
                                isValid = true;
                                validPhoneNumber = phoneNumber;
                                validationMethod = "forceful";
                                break;
                            }
                        } catch (NumberParseException e) {
                            // Continue to next format
                        }

                        // Try format 2: If number starts with country code, parse with auto-detect
                        if (!isValid && phoneToTest.startsWith(countryCodeStr)) {
                            try {
                                PhoneNumber phoneNumber = phoneUtil.parse("+" + phoneToTest, null);
                                if (phoneUtil.isValidNumber(phoneNumber)) {
                                    isValid = true;
                                    validPhoneNumber = phoneNumber;
                                    validationMethod = "forceful";
                                    break;
                                }
                            } catch (NumberParseException e) {
                                // Continue to next format
                            }
                        }

                        // Try format 3: National format with leading 0 (if applicable)
                        String nationalFormat = phoneToTest;
                        // Remove country code if present
                        if (nationalFormat.startsWith(countryCodeStr)) {
                            nationalFormat = nationalFormat.substring(countryCodeStr.length());
                        }

                        // If number is too long (might have extra leading digit), try removing it
                        if (nationalFormat.length() > 9 && region.equals("EC")) {
                            // Ecuador numbers should be 9 digits, try removing first digit
                            String shortened = nationalFormat.substring(1);
                            if (!shortened.startsWith("0")) {
                                String testFormat = "0" + shortened;
                                try {
                                    PhoneNumber phoneNumber = phoneUtil.parse(testFormat, region);
                                    if (phoneUtil.isValidNumber(phoneNumber)) {
                                        isValid = true;
                                        validPhoneNumber = phoneNumber;
                                        validationMethod = "forceful";
                                        break;
                                    }
                                } catch (NumberParseException e) {
                                    // Try original format
                                }
                            }
                        }

                        if (!nationalFormat.startsWith("0") && nationalFormat.length() > 0) {
                            if (region.equals("EC") || region.equals("PE") ||
                                    region.equals("CO") || region.equals("CL") ||
                                    region.equals("AR") || region.equals("VE")) {
                                nationalFormat = "0" + nationalFormat;
                                try {
                                    PhoneNumber phoneNumber = phoneUtil.parse(nationalFormat, region);
                                    if (phoneUtil.isValidNumber(phoneNumber)) {
                                        isValid = true;
                                        validPhoneNumber = phoneNumber;
                                        validationMethod = "forceful";
                                        break;
                                    }
                                } catch (NumberParseException e) {
                                    // Continue to next region
                                }
                            }
                        }

                        // Try format 4: Add country code prefix ONLY if it makes sense length-wise
                        if (!isValid && !phoneToTest.startsWith(countryCodeStr)) {
                            // Only try if the resulting number would be reasonable length
                            String testNumber = countryCodeStr + phoneToTest;

                            // If too long, try removing leading digit (might be area code prefix)
                            if (testNumber.length() >= 13 && phoneToTest.length() > 9) {
                                String shortened = phoneToTest.substring(1);
                                testNumber = countryCodeStr + shortened;
                            }

                            if (testNumber.length() <= 13) { // Reasonable upper bound
                                try {
                                    PhoneNumber phoneNumber = phoneUtil.parse("+" + testNumber, null);
                                    if (phoneUtil.isValidNumber(phoneNumber)) {
                                        isValid = true;
                                        validPhoneNumber = phoneNumber;
                                        validationMethod = "forceful";
                                        break;
                                    }
                                } catch (NumberParseException e) {
                                    // Continue to next region
                                }
                            }
                        }
                    }
                }

                if (isValid && validPhoneNumber != null) {
                    String countryCode = "+" + validPhoneNumber.getCountryCode();
                    String regionCode = phoneUtil.getRegionCodeForNumber(validPhoneNumber);
                    String numberType = phoneUtil.getNumberType(validPhoneNumber).toString();

                    // If it only validated through forceful testing, check if it's a supported country
                    // If the region is in our supported list, accept it as valid
                    if ("forceful".equals(validationMethod)) {
                        boolean isSupportedCountry = false;
                        for (String supportedRegion : FORCEFUL_TEST_REGIONS) {
                            if (supportedRegion.equals(regionCode)) {
                                isSupportedCountry = true;
                                break;
                            }
                        }
                        
                        if (isSupportedCountry) {
                            // Valid number - country hint was missing/wrong but number is valid for supported country
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
                                    "forceful",
                                    countryHint));
                        } else {
                            // Not a supported country - mark as invalid
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
                        }
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