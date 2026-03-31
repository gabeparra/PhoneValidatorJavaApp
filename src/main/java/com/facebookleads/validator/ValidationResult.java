package com.facebookleads.validator;

import java.util.Collections;
import java.util.List;

/**
 * Contains the results of phone number validation
 */
public class ValidationResult {
    private final List<ValidPhoneRecord> validNumbers;
    private final List<InvalidPhoneRecord> invalidNumbers;
    private final List<String> originalColumnNames;

    public ValidationResult(List<ValidPhoneRecord> validNumbers,
                           List<InvalidPhoneRecord> invalidNumbers) {
        this(validNumbers, invalidNumbers, null);
    }

    public ValidationResult(List<ValidPhoneRecord> validNumbers,
                           List<InvalidPhoneRecord> invalidNumbers,
                           List<String> originalColumnNames) {
        this.validNumbers = validNumbers;
        this.invalidNumbers = invalidNumbers;
        this.originalColumnNames = originalColumnNames == null || originalColumnNames.isEmpty()
                ? null
                : Collections.unmodifiableList(originalColumnNames);
    }

    public List<ValidPhoneRecord> getValidNumbers() {
        return validNumbers;
    }

    public List<InvalidPhoneRecord> getInvalidNumbers() {
        return invalidNumbers;
    }

    /** Original CSV/Excel column headers in order; null if not from CSV/Excel. */
    public List<String> getOriginalColumnNames() {
        return originalColumnNames;
    }
    
    public int getTotalCount() {
        return validNumbers.size() + invalidNumbers.size();
    }
    
    public int getValidCount() {
        return validNumbers.size();
    }
    
    public int getInvalidCount() {
        return invalidNumbers.size();
    }
    
    public double getSuccessRate() {
        return getTotalCount() > 0 ? (validNumbers.size() * 100.0 / getTotalCount()) : 0.0;
    }
}

