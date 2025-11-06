/**
 * Application Constants
 * Centralized configuration and constant values
 */

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  ENDPOINTS: {
    VALIDATE_PHONES: "/validate-phones",
    VALIDATE_PHONES_MANUAL: "/validate-phones-manual",
    VALIDATE_PHONES_FORCEFUL: "/validate-phones-forceful",
    HEALTH: "/health",
    STATS: "/stats",
  },
  TIMEOUTS: {
    FILE_UPLOAD: 120000, // 2 minutes
    MANUAL_VALIDATION: 60000, // 1 minute
  },
};

// ============================================================================
// Country Names Mapping
// ============================================================================

export const COUNTRY_NAMES = {
  US: "United States",
  BR: "Brazil",
  MX: "Mexico",
  CO: "Colombia",
  CR: "Costa Rica",
  ES: "Spain",
  CA: "Canada",
  AR: "Argentina",
  BD: "Bangladesh",
  BE: "Belgium",
  BJ: "Benin",
  CL: "Chile",
  CN: "China",
  EC: "Ecuador",
  EG: "Egypt",
  SV: "El Salvador",
  HN: "Honduras",
  IN: "India",
  IL: "Israel",
  KZ: "Kazakhstan",
  KG: "Kyrgyzstan",
  MA: "Morocco",
  MY: "Malaysia",
  NP: "Nepal",
  NG: "Nigeria",
  OM: "Oman",
  PK: "Pakistan",
  PE: "Peru",
  RU: "Russia",
  SA: "Saudi Arabia",
  SG: "Singapore",
  TR: "Turkey",
  UZ: "Uzbekistan",
  VE: "Venezuela",
  VN: "Vietnam",
  ZM: "Zambia",
  AE: "United Arab Emirates",
  KE: "Kenya",
};

// ============================================================================
// Country Codes with Dial Codes (Single Source of Truth)
// ============================================================================

export const COUNTRY_CODES = [
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "BR", name: "Brazil", dialCode: "+55" },
  { code: "MX", name: "Mexico", dialCode: "+52" },
  { code: "CO", name: "Colombia", dialCode: "+57" },
  { code: "CR", name: "Costa Rica", dialCode: "+506" },
  { code: "ES", name: "Spain", dialCode: "+34" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "AR", name: "Argentina", dialCode: "+54" },
  { code: "BD", name: "Bangladesh", dialCode: "+880" },
  { code: "BE", name: "Belgium", dialCode: "+32" },
  { code: "BJ", name: "Benin", dialCode: "+229" },
  { code: "CL", name: "Chile", dialCode: "+56" },
  { code: "CN", name: "China", dialCode: "+86" },
  { code: "EC", name: "Ecuador", dialCode: "+593" },
  { code: "EG", name: "Egypt", dialCode: "+20" },
  { code: "SV", name: "El Salvador", dialCode: "+503" },
  { code: "HN", name: "Honduras", dialCode: "+504" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "IL", name: "Israel", dialCode: "+972" },
  { code: "KZ", name: "Kazakhstan", dialCode: "+7" },
  { code: "KG", name: "Kyrgyzstan", dialCode: "+996" },
  { code: "MA", name: "Morocco", dialCode: "+212" },
  { code: "MY", name: "Malaysia", dialCode: "+60" },
  { code: "NP", name: "Nepal", dialCode: "+977" },
  { code: "NG", name: "Nigeria", dialCode: "+234" },
  { code: "OM", name: "Oman", dialCode: "+968" },
  { code: "PK", name: "Pakistan", dialCode: "+92" },
  { code: "PE", name: "Peru", dialCode: "+51" },
  { code: "RU", name: "Russia", dialCode: "+7" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { code: "SG", name: "Singapore", dialCode: "+65" },
  { code: "TR", name: "Turkey", dialCode: "+90" },
  { code: "UZ", name: "Uzbekistan", dialCode: "+998" },
  { code: "VE", name: "Venezuela", dialCode: "+58" },
  { code: "VN", name: "Vietnam", dialCode: "+84" },
  { code: "ZM", name: "Zambia", dialCode: "+260" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { code: "KE", name: "Kenya", dialCode: "+254" },
];

// ============================================================================
// Country Options for Manual Testing (Commonly Used Subset)
// ============================================================================

// Common countries for quick manual testing dropdown
export const MANUAL_TEST_COUNTRIES = COUNTRY_CODES.filter((country) =>
  [
    "US",
    "BR",
    "MX",
    "CO",
    "CR",
    "ES",
    "CA",
    "BE",
    "BJ",
    "OM",
    "SG",
    "MY",
  ].includes(country.code)
);

// ============================================================================
// Forceful Testing Configuration (All Countries)
// ============================================================================

// Use all countries for forceful testing
export const FORCEFUL_TEST_COUNTRY_CODES = COUNTRY_CODES;

// ============================================================================
// Validation Method Display Names
// ============================================================================

export const VALIDATION_METHOD_DISPLAY = {
  country_code: "code from country",
  original: "original",
  us_fallback: "us +1 fallback",
  forceful: "forceful extension test",
  default: "Unknown",
};

// ============================================================================
// File Upload Configuration
// ============================================================================

export const FILE_CONFIG = {
  ACCEPTED_EXTENSIONS: [".csv", ".xlsx", ".xls", ".sql"],
  ACCEPTED_TYPES: [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
  MAX_SIZE: 50 * 1024 * 1024, // 50MB in bytes
  DISPLAY_NAMES: {
    ".csv": "CSV",
    ".xlsx": "Excel",
    ".xls": "Excel",
    ".sql": "SQL",
  },
};

// ============================================================================
// Download File Names
// ============================================================================

export const DOWNLOAD_FILENAMES = {
  VALID_NUMBERS_JSON: "valid_numbers.json",
  VALID_NUMBERS_CSV: "valid_numbers.csv",
  INVALID_NUMBERS_JSON: "invalid_numbers.json",
  INVALID_NUMBERS_CSV: "invalid_numbers.csv",
};

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULTS = {
  MANUAL_TEST_COUNTRY: "US",
  PLACEHOLDER_TEXT: {
    PHONE_NUMBER: "e.g., +1234567890 or 1234567890",
    COUNTRY_FALLBACK: "Used if country code not detected in number",
    FILE_UPLOAD: "CSV, Excel (.xlsx, .xls), or SQL files only",
  },
};

// ============================================================================
// Tab Configuration
// ============================================================================

export const TABS = {
  OVERVIEW: "overview",
  VALID: "valid",
  INVALID: "invalid",
  MANUAL: "manual",
};

// ============================================================================
// Validation Method Filters
// ============================================================================

export const VALIDATION_METHOD_FILTERS = {
  ALL: "all",
  ORIGINAL: "original",
  COUNTRY_CODE: "country_code",
  US_FALLBACK: "us_fallback",
  FORCEFUL: "forceful",
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get full country name from country code
 * @param {string} region - Country code or full name
 * @returns {string} Full country name or original value if not found
 */
export const getCountryName = (region) => {
  if (!region) return "—";
  // If region is already a full name (contains spaces), return as is
  if (region.includes(" ")) {
    return region;
  }
  // Otherwise, try to map from abbreviation
  return COUNTRY_NAMES[region] || region || "—";
};

/**
 * Get display name for validation method
 * @param {string} method - Validation method code
 * @returns {string} Display name for validation method
 */
export const getValidationMethodDisplay = (method) => {
  if (!method) return VALIDATION_METHOD_DISPLAY.default;
  return VALIDATION_METHOD_DISPLAY[method] || VALIDATION_METHOD_DISPLAY.default;
};

/**
 * Generate download filename with timestamp
 * @param {string} baseName - Base filename without extension
 * @param {string} extension - File extension (e.g., '.json', '.csv')
 * @returns {string} Filename with timestamp
 */
export const generateDownloadFilename = (baseName, extension) => {
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `${baseName}_${timestamp}${extension}`;
};

/**
 * Check if file extension is valid
 * @param {string} filename - File name to check
 * @returns {boolean} True if file extension is valid
 */
export const isValidFileExtension = (filename) => {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return FILE_CONFIG.ACCEPTED_EXTENSIONS.includes(ext);
};

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
