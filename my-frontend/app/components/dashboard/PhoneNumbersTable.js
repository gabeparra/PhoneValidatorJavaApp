import { TABS, VALIDATION_METHOD_FILTERS } from "../../utils/constants";
import { getCountryName, getValidationMethodDisplay } from "../../utils/constants";

// Add helper function
const extractRegionFromForcefulError = (error) => {
  if (!error) return null;
  // Error format: "Only validated through forceful testing as BR +5534999983250 - data quality issue"
  const match = error.match(/Only validated through forceful testing as (\w+)/i);
  return match ? match[1] : null;
};

export default function PhoneNumbersTable({
  activeTab,
  numbers,
  searchTerm,
  onSearchChange,
  validationMethodFilter,
  onValidationMethodFilterChange,
  invalidFilter,
  onInvalidFilterChange,
  validNumbers,
  invalidNumbers,
  forcefulCount,
  fullyInvalidCount,
  onViewDetails,
  isForcefulTab = false,
}) {
  return (
    <div>
      {isForcefulTab && (
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            ⚠️ Forceful Validation Results
          </h3>
          <p className="text-sm text-yellow-800">
            These numbers were validated through forceful testing (trying all supported countries).
            They are technically valid but may have data quality issues (e.g., missing or incorrect country information).
            Review these numbers carefully before using them.
          </p>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by phone, email, or name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        />
      </div>

      {activeTab === TABS.VALID && !isForcefulTab && (
        <div className="mb-4 flex gap-2 flex-wrap">
          <button
            onClick={() =>
              onValidationMethodFilterChange(VALIDATION_METHOD_FILTERS.ALL)
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              validationMethodFilter === VALIDATION_METHOD_FILTERS.ALL
                ? "bg-yellow-400 text-black"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            All ({validNumbers.length})
          </button>
          <button
            onClick={() =>
              onValidationMethodFilterChange(
                VALIDATION_METHOD_FILTERS.ORIGINAL
              )
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              validationMethodFilter === VALIDATION_METHOD_FILTERS.ORIGINAL
                ? "bg-yellow-400 text-black"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Original Format (
            {
              validNumbers.filter(
                (n) =>
                  n.validationMethod === VALIDATION_METHOD_FILTERS.ORIGINAL
              ).length
            }
            )
          </button>
          <button
            onClick={() =>
              onValidationMethodFilterChange(
                VALIDATION_METHOD_FILTERS.COUNTRY_CODE
              )
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              validationMethodFilter === VALIDATION_METHOD_FILTERS.COUNTRY_CODE
                ? "bg-yellow-400 text-black"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Country from form (
            {
              validNumbers.filter(
                (n) =>
                  n.validationMethod === VALIDATION_METHOD_FILTERS.COUNTRY_CODE
              ).length
            }
            )
          </button>
          <button
            onClick={() =>
              onValidationMethodFilterChange(
                VALIDATION_METHOD_FILTERS.US_FALLBACK
              )
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              validationMethodFilter === VALIDATION_METHOD_FILTERS.US_FALLBACK
                ? "bg-yellow-400 text-black"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            US +1 Fallback (
            {
              validNumbers.filter(
                (n) =>
                  n.validationMethod === VALIDATION_METHOD_FILTERS.US_FALLBACK
              ).length
            }
            )
          </button>
        </div>
      )}

      {activeTab === TABS.INVALID && (
        <div className="mb-4 flex gap-2 flex-wrap">
          <button
            onClick={() => onInvalidFilterChange("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              invalidFilter === "all"
                ? "bg-yellow-400 text-black"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            All ({invalidNumbers.length})
          </button>
          <button
            onClick={() => onInvalidFilterChange("forceful")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              invalidFilter === "forceful"
                ? "bg-yellow-400 text-black"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Forceful Test Issues ({forcefulCount})
          </button>
          <button
            onClick={() => onInvalidFilterChange("fully_invalid")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              invalidFilter === "fully_invalid"
                ? "bg-yellow-400 text-black"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Fully Invalid ({fullyInvalidCount})
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Row
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Original Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Country from Form
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Validated Country
              </th>
              {activeTab === TABS.VALID && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Type
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                {activeTab === TABS.VALID ? "Method" : "Issue Type"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {numbers.map((number, idx) => {
              // Extract region from error message if not available for forceful test cases
              const region = number.region || extractRegionFromForcefulError(number.error);
              
              return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {number.rowNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                    {number.originalPhoneNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {number.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {number.originalCountry ? (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 whitespace-nowrap inline-block">
                        {number.originalCountry}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {region ? (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap inline-block ${
                          activeTab === TABS.VALID
                            ? number.originalCountry &&
                              number.originalCountry.toUpperCase() !== region?.toUpperCase()
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getCountryName(region)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  {activeTab === TABS.VALID && (
                    <td className="px-4 py-3 text-sm">
                      {number.type ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {number.type}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm">
                    {activeTab === TABS.VALID ? (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          number.validationMethod ===
                          VALIDATION_METHOD_FILTERS.ORIGINAL
                            ? "bg-green-100 text-green-800"
                            : number.validationMethod ===
                              VALIDATION_METHOD_FILTERS.COUNTRY_CODE
                            ? "bg-blue-100 text-blue-800"
                            : number.validationMethod ===
                              VALIDATION_METHOD_FILTERS.US_FALLBACK
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getValidationMethodDisplay(number.validationMethod)}
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          number.error?.toLowerCase().includes("forceful")
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {number.error?.toLowerCase().includes("forceful")
                          ? "Forceful Test"
                          : "Invalid"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {number.email}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onViewDetails(number)}
                      className="text-yellow-600 hover:text-yellow-700 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {numbers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}

