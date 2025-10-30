package com.facebookleads.validator;

import java.util.List;

/**
 * Container for all phone records parsed from SQL file
 */
public class PhoneNumberData {
    private final List<PhoneRecord> records;
    
    public PhoneNumberData(List<PhoneRecord> records) {
        this.records = records;
    }
    
    public List<PhoneRecord> getRecords() {
        return records;
    }
    
    public int getCount() {
        return records.size();
    }
}

