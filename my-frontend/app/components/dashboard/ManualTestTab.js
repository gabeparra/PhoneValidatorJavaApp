import ManualTestResultDisplay from "./ManualTestResultDisplay";
import { DEFAULTS, MANUAL_TEST_COUNTRIES } from "../../utils/constants";

export default function ManualTestTab({
  testLoading,
  handleTestPhone,
  manualTestResult,
  manualTestFromData,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black mb-4">
          Test Another Number
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Phone Number
            </label>
            <input
              type="text"
              id="manualTestInput"
              placeholder={DEFAULTS.PLACEHOLDER_TEXT.PHONE_NUMBER}
              defaultValue=""
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === "Enter" && !testLoading) {
                  handleTestPhone();
                }
              }}
              disabled={testLoading}
            />
            <p className="text-xs text-gray-600 mt-1">
              Include country code (e.g., +55 for Brazil, +1 for USA)
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Country (Fallback)
            </label>
            <select
              id="manualTestCountry"
              defaultValue={DEFAULTS.MANUAL_TEST_COUNTRY}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              disabled={testLoading}
            >
              {MANUAL_TEST_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.dialCode})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-600 mt-1">
              {DEFAULTS.PLACEHOLDER_TEXT.COUNTRY_FALLBACK}
            </p>
          </div>
          <button
            onClick={handleTestPhone}
            disabled={testLoading}
            className={`w-full px-6 py-3 rounded-lg font-medium text-black transition-colors ${
              testLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500"
            }`}
          >
            {testLoading ? "Testing..." : "Test This Number"}
          </button>
        </div>
      </div>

      {testLoading && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-yellow-700 font-medium">Testing number...</p>
          </div>
        </div>
      )}

      {manualTestResult && !testLoading && (
        <div
          className={`border-2 rounded-lg p-6 ${
            manualTestResult.valid
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <h4 className="text-lg font-semibold mb-4 text-black">
            {manualTestResult.valid
              ? "✅ Test Result - Valid"
              : "❌ Test Result - Invalid"}
          </h4>
          <ManualTestResultDisplay result={manualTestResult} />
        </div>
      )}

      {manualTestFromData && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">
            Original Upload Test Result
          </h4>
          <ManualTestResultDisplay result={manualTestFromData} />
        </div>
      )}
    </div>
  );
}

