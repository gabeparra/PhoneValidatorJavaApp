package com.facebookleads.validator;

import java.util.List;

/**
 * Contains the results of phone number validation
 */
public class ValidationResult {
    private final List<ValidPhoneRecord> validNumbers;
    private final List<InvalidPhoneRecord> invalidNumbers;
    
    public ValidationResult(List<ValidPhoneRecord> validNumbers, 
                           List<InvalidPhoneRecord> invalidNumbers) {
        this.validNumbers = validNumbers;
        this.invalidNumbers = invalidNumbers;
    }
    
    public List<ValidPhoneRecord> getValidNumbers() {
        return validNumbers;
    }
    
    public List<InvalidPhoneRecord> getInvalidNumbers() {
        return invalidNumbers;
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

