package com.facebookleads.validator;

import java.io.File;
import java.io.FileNotFoundException;

/**
 * Main entry point for the Facebook Leads Phone Number Validator
 */
public class Main {
    
    public static void main(String[] args) {
        printBanner();
        
        // Parse command line arguments
        if (args.length < 2) {
            printUsage();
            System.exit(1);
        }
        
        String inputFile = args[0];
        String outputDir = args[1];
        
        // Validate input file exists
        File file = new File(inputFile);
        if (!file.exists()) {
            System.err.println("❌ Error: Input file not found: " + inputFile);
            System.exit(1);
        }
        
        System.out.println("📋 Configuration:");
        System.out.println("   Input file:  " + inputFile);
        System.out.println("   Output dir:  " + outputDir);
        System.out.println();
        
        try {
            // Step 1: Parse SQL file
            System.out.println("Step 1/3: Parsing SQL file...");
            SQLParser parser = new SQLParser();
            PhoneNumberData data = parser.parse(inputFile);
            System.out.println();
            
            // Step 2: Validate phone numbers
            System.out.println("Step 2/3: Validating phone numbers...");
            PhoneNumberValidator validator = new PhoneNumberValidator();
            ValidationResult result = validator.validate(data);
            System.out.println();
            
            // Step 3: Generate output files
            System.out.println("Step 3/3: Generating output files...");
            OutputGenerator generator = new OutputGenerator(outputDir);
            generator.generateAll(result);
            System.out.println();
            
            // Print summary
            printSummary(result, outputDir);
            
        } catch (FileNotFoundException e) {
            System.err.println("❌ Error: File not found: " + inputFile);
            System.exit(1);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
    
    private static void printBanner() {
        System.out.println();
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("     Facebook Leads Phone Number Validator");
        System.out.println("     Powered by Google libphonenumber");
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println();
    }
    
    private static void printUsage() {
        System.out.println("Usage: java -jar phone-validator.jar <input.sql> <output-directory>");
        System.out.println();
        System.out.println("Arguments:");
        System.out.println("  <input.sql>         Path to the SQL file containing Facebook leads");
        System.out.println("  <output-directory>  Directory where output files will be created");
        System.out.println();
        System.out.println("Example:");
        System.out.println("  java -jar phone-validator.jar facebookleads.sql output/");
        System.out.println();
    }
    
    private static void printSummary(ValidationResult result, String outputDir) {
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("✅ VALIDATION COMPLETED SUCCESSFULLY!");
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println();
        System.out.println("📊 Results Summary:");
        System.out.println("   Total processed:  " + result.getTotalCount());
        System.out.println("   Valid numbers:    " + result.getValidCount() + 
                         String.format(" (%.1f%%)", result.getSuccessRate()));
        System.out.println("   Invalid numbers:  " + result.getInvalidCount() + 
                         String.format(" (%.1f%%)", 100.0 - result.getSuccessRate()));
        System.out.println();
        System.out.println("📁 Output Files:");
        System.out.println("   " + outputDir + "/valid_numbers.json");
        System.out.println("   " + outputDir + "/invalid_numbers.json");
        System.out.println("   " + outputDir + "/summary.json");
        System.out.println("   " + outputDir + "/valid_numbers.csv");
        System.out.println("   " + outputDir + "/invalid_numbers.csv");
        System.out.println("   " + outputDir + "/validation_report.txt");
        System.out.println();
        System.out.println("💡 Tip: Check validation_report.txt for a detailed human-readable report");
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println();
    }
}

