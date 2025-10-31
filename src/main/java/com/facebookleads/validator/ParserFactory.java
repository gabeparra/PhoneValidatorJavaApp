package com.facebookleads.validator;

/**
 * Factory to select the appropriate parser based on file type
 */
public class ParserFactory {
    
    public static DataParser getParser(String filePath) {
        String extension = getFileExtension(filePath).toLowerCase();
        
        switch (extension) {
            case "sql":
                System.out.println("📄 Selected SQL Parser");
                return new SQLParser();
                
            case "csv":
                System.out.println("📋 Selected CSV Parser");
                return new CSVParser();

            case "xlsx":
            case "xls":
                System.out.println("📊 Selected Excel Parser");
                return new ExcelParser();
                
            default:
                throw new IllegalArgumentException("Unsupported file format: " + extension);
        }
    }
    
    private static String getFileExtension(String filePath) {
        int lastDot = filePath.lastIndexOf('.');
        return lastDot > 0 ? filePath.substring(lastDot + 1) : "";
    }
}