package com.facebookleads.validator;

import java.util.Collections;
import java.util.List;

/**
 * Container for all phone records parsed from input file.
 * May include original column names from CSV/Excel for export.
 */
public class PhoneNumberData {
    private final List<PhoneRecord> records;
    private final List<String> originalColumnNames;

    public PhoneNumberData(List<PhoneRecord> records) {
        this(records, null);
    }

    public PhoneNumberData(List<PhoneRecord> records, List<String> originalColumnNames) {
        this.records = records;
        this.originalColumnNames = originalColumnNames == null || originalColumnNames.isEmpty()
                ? null
                : Collections.unmodifiableList(originalColumnNames);
    }

    public List<PhoneRecord> getRecords() {
        return records;
    }

    public int getCount() {
        return records.size();
    }

    /** Original CSV/Excel column headers in order; null if not from CSV/Excel. */
    public List<String> getOriginalColumnNames() {
        return originalColumnNames;
    }
}

