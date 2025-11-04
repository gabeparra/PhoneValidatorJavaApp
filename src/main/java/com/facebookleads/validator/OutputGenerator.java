package com.facebookleads.validator;

import com.google.gson.*;

import java.io.*;
import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Generates output files in JSON, CSV, and human-readable report formats
 */
public class OutputGenerator {

    private final String outputDir;
    private final Gson gson;
    private final SimpleDateFormat dateFormat;

    public OutputGenerator(String outputDir) {
        this.outputDir = outputDir;
        // Explicitly configure Gson to serialize nulls so we can see empty fields
        this.gson = new GsonBuilder()
                .setPrettyPrinting()
                .serializeNulls()  // Include null fields in JSON
                .create();
        this.dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    }

    public void generateAll(ValidationResult result) throws IOException {
        System.out.println("📊 Generating output files...");

        // Create output directory if it doesn't exist
        Files.createDirectories(Paths.get(outputDir));

        generateJSON(result);
        System.out.println("   ✓ JSON files created");

        generateCSV(result);
        System.out.println("   ✓ CSV files created");

        generateReport(result);
        System.out.println("   ✓ Report file created");
    }

    /**
     * Generate JSON output files
     */
    private void generateJSON(ValidationResult result) throws IOException {
        // Valid numbers
        try (FileWriter writer = new FileWriter(outputDir + "/valid_numbers.json")) {
            gson.toJson(result.getValidNumbers(), writer);
        }

        // Invalid numbers
        try (FileWriter writer = new FileWriter(outputDir + "/invalid_numbers.json")) {
            gson.toJson(result.getInvalidNumbers(), writer);
        }

        // Summary
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("timestamp", dateFormat.format(new Date()));
        summary.put("total_numbers", result.getTotalCount());
        summary.put("valid_count", result.getValidCount());
        summary.put("invalid_count", result.getInvalidCount());
        summary.put("success_rate", String.format("%.2f%%", result.getSuccessRate()));

        // Count by country for valid numbers
        Map<String, Integer> countryStats = new TreeMap<>();
        for (ValidPhoneRecord record : result.getValidNumbers()) {
            String region = record.getRegion();
            countryStats.put(region, countryStats.getOrDefault(region, 0) + 1);
        }
        summary.put("valid_by_country", countryStats);

        try (FileWriter writer = new FileWriter(outputDir + "/summary.json")) {
            gson.toJson(summary, writer);
        }
    }

    /**
     * Generate CSV output files
     */
    private void generateCSV(ValidationResult result) throws IOException {
        // Valid numbers CSV
        try (FileWriter writer = new FileWriter(outputDir + "/valid_numbers.csv")) {
            writer.append(
                    "Row,ID,Name,Email,Original Number,E.164,International,National,Country Code,Region,Type,Platform\n");
            for (ValidPhoneRecord record : result.getValidNumbers()) {
                writer.append(String.valueOf(record.getRowNumber())).append(",")
                        .append(escapeCSV(record.getId())).append(",")
                        .append(escapeCSV(record.getName())).append(",")
                        .append(escapeCSV(record.getEmail())).append(",")
                        .append(escapeCSV(record.getOriginalPhoneNumber())).append(",")
                        .append(escapeCSV(record.getE164())).append(",")
                        .append(escapeCSV(record.getInternational())).append(",")
                        .append(escapeCSV(record.getNational())).append(",")
                        .append(escapeCSV(record.getCountryCode())).append(",")
                        .append(escapeCSV(record.getRegion())).append(",")
                        .append(escapeCSV(record.getType())).append(",")
                        .append(escapeCSV(record.getPlatform())).append("\n");
            }
        }

        // Invalid numbers CSV
        try (FileWriter writer = new FileWriter(outputDir + "/invalid_numbers.csv")) {
            writer.append("Row,ID,Name,Email,Original Number,Error,Platform\n");
            for (InvalidPhoneRecord record : result.getInvalidNumbers()) {
                writer.append(String.valueOf(record.getRowNumber())).append(",")
                        .append(escapeCSV(record.getId())).append(",")
                        .append(escapeCSV(record.getName())).append(",")
                        .append(escapeCSV(record.getEmail())).append(",")
                        .append(escapeCSV(record.getOriginalPhoneNumber())).append(",")
                        .append(escapeCSV(record.getError())).append(",")
                        .append(escapeCSV(record.getPlatform())).append("\n");
            }
        }
    }

    /**
     * Generate human-readable text report
     */
    private void generateReport(ValidationResult result) throws IOException {
        try (FileWriter writer = new FileWriter(outputDir + "/validation_report.txt")) {
            String separator = new String(new char[80]).replace('\0', '=');
            String divider = new String(new char[80]).replace('\0', '-');

            // Header
            writer.append(separator).append("\n");
            writer.append("PHONE NUMBER VALIDATION REPORT\n");
            writer.append(separator).append("\n\n");

            writer.append("Generated: ").append(dateFormat.format(new Date())).append("\n\n");

            // Summary section
            writer.append("SUMMARY\n");
            writer.append(divider).append("\n");
            writer.append(String.format("Total Numbers Processed: %d\n", result.getTotalCount()));
            writer.append(String.format("Valid Numbers: %d (%.2f%%)\n",
                    result.getValidCount(), result.getSuccessRate()));
            writer.append(String.format("Invalid Numbers: %d (%.2f%%)\n\n",
                    result.getInvalidCount(), 100.0 - result.getSuccessRate()));

            // Statistics by country
            Map<String, Integer> countryStats = new TreeMap<>();
            for (ValidPhoneRecord record : result.getValidNumbers()) {
                String region = record.getRegion();
                countryStats.put(region, countryStats.getOrDefault(region, 0) + 1);
            }

            if (!countryStats.isEmpty()) {
                writer.append("\nVALID NUMBERS BY COUNTRY\n");
                writer.append(divider).append("\n");
                for (Map.Entry<String, Integer> entry : countryStats.entrySet()) {
                    writer.append(String.format("  %-20s : %3d numbers\n",
                            entry.getKey(), entry.getValue()));
                }
                writer.append("\n");
            }

            // Valid numbers section
            writer.append("\n").append(separator).append("\n");
            writer.append("VALID PHONE NUMBERS\n");
            writer.append(separator).append("\n\n");

            for (ValidPhoneRecord record : result.getValidNumbers()) {
                writer.append(String.format("Row %d: %s\n", record.getRowNumber(), record.getName()));
                writer.append(String.format("  ID:            %s\n", record.getId()));
                writer.append(String.format("  Email:         %s\n", record.getEmail()));
                writer.append(String.format("  Original:      %s\n", record.getOriginalPhoneNumber()));
                writer.append(String.format("  E.164:         %s\n", record.getE164()));
                writer.append(String.format("  International: %s\n", record.getInternational()));
                writer.append(String.format("  National:      %s\n", record.getNational()));
                writer.append(String.format("  Country:       %s (%s)\n",
                        record.getRegion(), record.getCountryCode()));
                writer.append(String.format("  Type:          %s\n", record.getType()));
                writer.append(String.format("  Platform:      %s\n", record.getPlatform()));
                writer.append("\n");
            }

            // Invalid numbers section
            if (!result.getInvalidNumbers().isEmpty()) {
                writer.append("\n").append(separator).append("\n");
                writer.append("INVALID PHONE NUMBERS\n");
                writer.append(separator).append("\n\n");

                for (InvalidPhoneRecord record : result.getInvalidNumbers()) {
                    writer.append(String.format("Row %d: %s\n", record.getRowNumber(), record.getName()));
                    writer.append(String.format("  ID:            %s\n", record.getId()));
                    writer.append(String.format("  Email:         %s\n", record.getEmail()));
                    writer.append(String.format("  Phone:         %s\n", record.getOriginalPhoneNumber()));
                    writer.append(String.format("  Error:         %s\n", record.getError()));
                    writer.append(String.format("  Platform:      %s\n\n", record.getPlatform()));
                }
            }

            // Footer
            writer.append("\n").append(separator).append("\n");
            writer.append("End of Report\n");
            writer.append(separator).append("\n");
        }
    }

    /**
     * Escape CSV values that contain special characters
     */
    private String escapeCSV(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
