package com.facebookleads.validator;

import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for country code management
 * Shared by all parsers and validator for consistent country code handling
 */
public class CountryCodeUtil {

    private static final Map<String, String> COUNTRY_CODES = new HashMap<>();

    static {
        // Initialize country codes map
        COUNTRY_CODES.put("ARGENTINA", "54");
        COUNTRY_CODES.put("BANGLADESH", "880");
        COUNTRY_CODES.put("BRAZIL", "55");
        COUNTRY_CODES.put("CANADA", "1");
        COUNTRY_CODES.put("CHILE", "56");
        COUNTRY_CODES.put("CHINA", "86");
        COUNTRY_CODES.put("COLOMBIA", "57");
        COUNTRY_CODES.put("COSTA RICA", "506");
        COUNTRY_CODES.put("ECUADOR", "593");
        COUNTRY_CODES.put("EGYPT", "20");
        COUNTRY_CODES.put("EL SALVADOR", "503");
        COUNTRY_CODES.put("ELSALVADOR", "503");
        COUNTRY_CODES.put("HONDURAS", "504");
        COUNTRY_CODES.put("INDIA", "91");
        COUNTRY_CODES.put("ISRAEL", "972");
        COUNTRY_CODES.put("KAZAKHSTAN", "7");
        COUNTRY_CODES.put("KYRGYZSTAN", "996");
        COUNTRY_CODES.put("MEXICO", "52");
        COUNTRY_CODES.put("MOROCCO", "212");
        COUNTRY_CODES.put("NEPAL", "977");
        COUNTRY_CODES.put("NIGERIA", "234");
        COUNTRY_CODES.put("PAKISTAN", "92");
        COUNTRY_CODES.put("PERU", "51");
        COUNTRY_CODES.put("RUSSIA", "7");
        COUNTRY_CODES.put("RUSSIAN FEDERATION", "7");
        COUNTRY_CODES.put("RUSSIAN FD", "7");
        COUNTRY_CODES.put("RUSSIAN FD", "7");
        COUNTRY_CODES.put("SAUDI ARABIA", "966");
        COUNTRY_CODES.put("SPAIN", "34");
        COUNTRY_CODES.put("TURKEY", "90");
        COUNTRY_CODES.put("UNITED STATES", "1");
        COUNTRY_CODES.put("US", "1");
        COUNTRY_CODES.put("USA", "1");
        COUNTRY_CODES.put("UZBEKISTAN", "998");
        COUNTRY_CODES.put("VENEZUELA", "58");
        COUNTRY_CODES.put("VIET NAM", "84");
        COUNTRY_CODES.put("VIETNAM", "84");
        COUNTRY_CODES.put("ZAMBIA", "260");
        COUNTRY_CODES.put("TANZANIA", "255");
        COUNTRY_CODES.put("PORTUGAL", "351");
        COUNTRY_CODES.put("FRANCE", "33");
        COUNTRY_CODES.put("GERMANY", "49");
        COUNTRY_CODES.put("ITALY", "39");
        COUNTRY_CODES.put("UNITED KINGDOM", "44");
        COUNTRY_CODES.put("UK", "44");
        COUNTRY_CODES.put("NETHERLANDS", "31");
        COUNTRY_CODES.put("POLAND", "48");
        COUNTRY_CODES.put("GREECE", "30");
        COUNTRY_CODES.put("AUSTRIA", "43");
        COUNTRY_CODES.put("SWITZERLAND", "41");
        COUNTRY_CODES.put("GUATEMALA", "502");
        COUNTRY_CODES.put("PANAMA", "507");
        COUNTRY_CODES.put("NICARAGUA", "505");
        COUNTRY_CODES.put("DOMINICAN REPUBLIC", "1");
        COUNTRY_CODES.put("URUGUAY", "598");
        COUNTRY_CODES.put("PARAGUAY", "595");
        COUNTRY_CODES.put("BOLIVIA", "591");
        COUNTRY_CODES.put("JORDAN", "962");
        COUNTRY_CODES.put("QATAR", "974");
        COUNTRY_CODES.put("KUWAIT", "965");
        COUNTRY_CODES.put("BAHRAIN", "973");
        COUNTRY_CODES.put("LEBANON", "961");
        COUNTRY_CODES.put("IRAQ", "964");
        COUNTRY_CODES.put("YEMEN", "967");
        COUNTRY_CODES.put("SOUTH AFRICA", "27");
        COUNTRY_CODES.put("GHANA", "233");
        COUNTRY_CODES.put("ETHIOPIA", "251");
        COUNTRY_CODES.put("UGANDA", "256");
        COUNTRY_CODES.put("RWANDA", "250");
        COUNTRY_CODES.put("SENEGAL", "221");
        COUNTRY_CODES.put("IVORY COAST", "225");
        COUNTRY_CODES.put("COTE D'IVOIRE", "225");
        COUNTRY_CODES.put("ALGERIA", "213");
        COUNTRY_CODES.put("TUNISIA", "216");
        COUNTRY_CODES.put("MADAGASCAR", "261");
        COUNTRY_CODES.put("MALAWI", "265");
        COUNTRY_CODES.put("MOZAMBIQUE", "258");
        COUNTRY_CODES.put("AZERBAIJAN", "994");
        COUNTRY_CODES.put("SERBIA", "381");
        COUNTRY_CODES.put("SOUTH KOREA", "82");
        COUNTRY_CODES.put("KOREA", "82");
        COUNTRY_CODES.put("STH KOREA", "82");
        COUNTRY_CODES.put("MONGOLIA", "976");
    }

    /**
     * Get country code from country name
     * 
     * @param countryName Country name (case-insensitive)
     * @return Country code (e.g., "55" for Brazil) or null if not found
     */
    public static String getCountryCode(String countryName) {
        if (countryName == null || countryName.trim().isEmpty()) {
            return null;
        }
        return COUNTRY_CODES.get(countryName.toUpperCase().trim());
    }

    /**
     * Detect if a phone number already starts with a country code
     * Only matches if number is long enough to be international format
     * 
     * @param phoneNumber The phone number to check
     * @return The detected country code or null
     */
    public static String detectCountryCodeInNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return null;
        }

        // Only check if number is long enough to potentially have country code
        // Most international numbers with country code are 10+ digits
        if (phoneNumber.length() < 10) {
            return null;
        }

        // Try to match country codes, but prioritize longer codes first
        // Create sorted list of codes by length (descending)
        String[] codes = COUNTRY_CODES.values().stream()
                .distinct()
                .sorted((a, b) -> Integer.compare(b.length(), a.length()))
                .toArray(String[]::new);

        // Check if number starts with any country code
        for (String code : codes) {
            if (phoneNumber.startsWith(code)) {
                // Verify it's not just a coincidental match
                // For example, don't match "1" if number is "1234567890" (US local)
                // But do match "966" if number is "966558950946" (Saudi)

                // If code is 1 digit, require number to be 11+ digits (country code + 10 digit
                // number)
                if (code.length() == 1 && phoneNumber.length() >= 11) {
                    return code;
                }
                // If code is 2 digits, require number to be 11+ digits
                if (code.length() == 2 && phoneNumber.length() >= 11) {
                    return code;
                }
                // If code is 3 digits, require number to be 12+ digits
                if (code.length() >= 3 && phoneNumber.length() >= 12) {
                    return code;
                }
            }
        }

        return null;
    }

    /**
     * Prepare phone number for parsing
     * Simple approach: just add + if missing
     * Validator will handle multiple region attempts
     * 
     * @param phoneNumber The original phone number from user
     * @param countryName The country (can be null) - not used here
     * @return Phone number with + prefix if missing
     */
    public static String prepareForParsing(String phoneNumber, String countryName) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return phoneNumber;
        }

        // Already has + prefix - ready for parsing
        if (phoneNumber.startsWith("+")) {
            return phoneNumber;
        }

        // Just add + prefix - let validator try multiple regions
        return "+" + phoneNumber;
    }

    /**
     * Check if a number likely already has a country code
     * 
     * @param phoneNumber The phone number to check
     * @return true if number likely has country code
     */
    public static boolean hasCountryCode(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            return false;
        }

        // Has + prefix
        if (phoneNumber.startsWith("+")) {
            return true;
        }

        // Check if starts with known country code
        return detectCountryCodeInNumber(phoneNumber) != null;
    }

    /**
     * Get all country codes as an unmodifiable map
     * 
     * @return Map of country name -> country code
     */
    public static Map<String, String> getAllCountryCodes() {
        return new HashMap<>(COUNTRY_CODES);
    }
}