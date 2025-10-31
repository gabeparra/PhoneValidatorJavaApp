package com.facebookleads.validator;

import java.io.IOException;

/**
 * Interface for different file format parsers
 */
public interface DataParser {
    /**
     * Parse a file and return phone records
     * @param filePath Path to the file
     * @return PhoneNumberData containing all parsed records
     */
    PhoneNumberData parse(String filePath) throws IOException;
}