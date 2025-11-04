"use client";

import { useState } from "react";
import axios from "axios";
import {
  COUNTRY_NAMES,
  getCountryName,
  getValidationMethodDisplay,
  getApiUrl,
  API_CONFIG,
  DOWNLOAD_FILENAMES,
  generateDownloadFilename,
  TABS,
  VALIDATION_METHOD_FILTERS,
  MANUAL_TEST_COUNTRIES,
  DEFAULTS,
} from "../utils/constants";

export default function Dashboard({ data, onReset }) {
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [searchTerm, setSearchTerm] = useState("");
  const [validationMethodFilter, setValidationMethodFilter] = useState(
    VALIDATION_METHOD_FILTERS.ALL
  );
  const [invalidFilter, setInvalidFilter] = useState("all");
  const [manualTestResult, setManualTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const downloadJSON = (dataArray, filename) => {
    const blob = new Blob([JSON.stringify(dataArray, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (dataArray, filename) => {
    if (dataArray.length === 0) return;

    const headers = Object.keys(dataArray[0]);
    const csvContent = [
      headers.join(","),
      ...dataArray.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            return `"${String(value).replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterNumbers = (numbers) => {
    if (!searchTerm) return numbers;

    const term = searchTerm.toLowerCase();
    return numbers.filter(
      (num) =>
        num.originalPhoneNumber?.toLowerCase().includes(term) ||
        num.e164?.toLowerCase().includes(term) ||
        num.email?.toLowerCase().includes(term) ||
        num.name?.toLowerCase().includes(term)
    );
  };

  const filterByValidationMethod = (numbers) => {
    if (validationMethodFilter === VALIDATION_METHOD_FILTERS.ALL)
      return numbers;
    return numbers.filter(
      (num) => num.validationMethod === validationMethodFilter
    );
  };

  const filterByInvalidType = (numbers) => {
    if (invalidFilter === "all") return numbers;
    if (invalidFilter === "forceful") {
      return numbers.filter((num) =>
        num.error?.toLowerCase().includes("forceful testing")
      );
    }
    if (invalidFilter === "fully_invalid") {
      return numbers.filter(
        (num) => !num.error?.toLowerCase().includes("forceful testing")
      );
    }
    return numbers;
  };

  const handleViewDetails = (number) => {
    setSelectedNumber(number);
    setShowDetailsModal(true);
  };

  const ManualTestResultDisplay = ({ result }) => (
    <div className="space-y-3">
      <div className="bg-white rounded p-3 border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Input:</strong>{" "}
          <span className="font-mono">{result.input}</span>
        </p>
      </div>

      {result.valid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              E.164 Format
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.e164}
            </p>
          </div>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              International Format
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.international}
            </p>
          </div>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              National Format
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.national}
            </p>
          </div>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              Country Code
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.countryCode}
            </p>
          </div>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              Region/Country
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.region}
            </p>
          </div>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              Phone Type
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.type}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded p-3 border border-red-200">
          <p className="text-sm text-red-600">
            <strong>Error:</strong> {result.error}
          </p>
        </div>
      )}
    </div>
  );

  const handleTestPhone = async () => {
    const phoneInput = document.getElementById("manualTestInput")?.value;
    const countryInput = document.getElementById("manualTestCountry")?.value;

    if (!phoneInput || !phoneInput.trim()) {
      alert("Please enter a phone number");
      return;
    }

    setTestLoading(true);

    try {
      const response = await axios.post(
        getApiUrl(API_CONFIG.ENDPOINTS.VALIDATE_PHONES_MANUAL),
        {
          phone: phoneInput.trim(),
          country: countryInput,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const testResult = {
        input: phoneInput.trim(),
        valid: response.data.valid_count > 0,
        ...(response.data.valid_count > 0
          ? response.data.valid_numbers?.[0]
          : response.data.invalid_numbers?.[0]),
      };

      setManualTestResult(testResult);
      document.getElementById("manualTestInput").value = "";
    } catch (error) {
      alert(
        "Error testing number: " +
          (error.response?.data?.detail || error.message)
      );
    } finally {
      setTestLoading(false);
    }
  };

  const validFiltered = filterByValidationMethod(
    filterNumbers(data.valid_numbers)
  );
  const invalidFiltered = filterByInvalidType(
    filterNumbers(data.invalid_numbers)
  );

  const forcefulCount = data.invalid_numbers.filter((n) =>
    n.error?.toLowerCase().includes("forceful testing")
  ).length;
  const fullyInvalidCount = data.invalid_numbers.length - forcefulCount;

  const tabs = [
    { id: TABS.OVERVIEW, label: "Overview" },
    { id: TABS.VALID, label: `Valid (${data.valid_count})` },
    { id: TABS.INVALID, label: `Invalid (${data.invalid_count})` },
    { id: TABS.MANUAL, label: "🔢 Manual Test" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-black px-6 py-8 text-white border-b-4 border-yellow-400">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Validation Results</h2>
            <p className="text-gray-300">
              Processed on {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onReset}
            className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
          >
            Upload New File
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-400">
            <p className="text-gray-400 text-sm">Total Numbers</p>
            <p className="text-3xl font-bold mt-1 text-white">
              {data.total_numbers}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-400">
            <p className="text-gray-400 text-sm">Valid Numbers</p>
            <p className="text-3xl font-bold mt-1 text-green-400">
              {data.valid_count}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-400">
            <p className="text-gray-400 text-sm">Invalid Numbers</p>
            <p className="text-3xl font-bold mt-1 text-red-400">
              {data.invalid_count}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-400">
            <p className="text-gray-400 text-sm">Success Rate</p>
            <p className="text-3xl font-bold mt-1 text-yellow-400">
              {data.success_rate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex -mb-px flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-yellow-400 text-yellow-600"
                  : "border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === TABS.OVERVIEW && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">
                Country Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(data.country_breakdown).map(
                  ([country, count]) => (
                    <div
                      key={country}
                      className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border-4 border-yellow-400"
                    >
                      <p className="text-3xl font-bold text-black">{count}</p>
                      <p className="text-sm font-semibold text-black mt-2">
                        {getCountryName(country)}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">
                Download Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-black">Valid Numbers</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        downloadJSON(
                          data.valid_numbers,
                          generateDownloadFilename("valid_numbers", ".json")
                        )
                      }
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Download JSON
                    </button>
                    <button
                      onClick={() =>
                        downloadCSV(
                          data.valid_numbers,
                          generateDownloadFilename("valid_numbers", ".csv")
                        )
                      }
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-black">
                    Invalid Numbers
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        downloadJSON(
                          data.invalid_numbers,
                          generateDownloadFilename("invalid_numbers", ".json")
                        )
                      }
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Download JSON
                    </button>
                    <button
                      onClick={() =>
                        downloadCSV(
                          data.invalid_numbers,
                          generateDownloadFilename("invalid_numbers", ".csv")
                        )
                      }
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === TABS.VALID || activeTab === TABS.INVALID) && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by phone, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>

            {activeTab === TABS.VALID && (
              <div className="mb-4 flex gap-2 flex-wrap">
                <button
                  onClick={() =>
                    setValidationMethodFilter(VALIDATION_METHOD_FILTERS.ALL)
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    validationMethodFilter === VALIDATION_METHOD_FILTERS.ALL
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  All ({data.valid_numbers.length})
                </button>
                <button
                  onClick={() =>
                    setValidationMethodFilter(
                      VALIDATION_METHOD_FILTERS.ORIGINAL
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    validationMethodFilter ===
                    VALIDATION_METHOD_FILTERS.ORIGINAL
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Original Format (
                  {
                    data.valid_numbers.filter(
                      (n) =>
                        n.validationMethod ===
                        VALIDATION_METHOD_FILTERS.ORIGINAL
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() =>
                    setValidationMethodFilter(
                      VALIDATION_METHOD_FILTERS.COUNTRY_CODE
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    validationMethodFilter ===
                    VALIDATION_METHOD_FILTERS.COUNTRY_CODE
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Country from form (
                  {
                    data.valid_numbers.filter(
                      (n) =>
                        n.validationMethod ===
                        VALIDATION_METHOD_FILTERS.COUNTRY_CODE
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() =>
                    setValidationMethodFilter(
                      VALIDATION_METHOD_FILTERS.US_FALLBACK
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    validationMethodFilter ===
                    VALIDATION_METHOD_FILTERS.US_FALLBACK
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  US +1 Fallback (
                  {
                    data.valid_numbers.filter(
                      (n) =>
                        n.validationMethod ===
                        VALIDATION_METHOD_FILTERS.US_FALLBACK
                    ).length
                  }
                  )
                </button>
              </div>
            )}

            {activeTab === TABS.INVALID && (
              <div className="mb-4 flex gap-2 flex-wrap">
                <button
                  onClick={() => setInvalidFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    invalidFilter === "all"
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  All ({data.invalid_numbers.length})
                </button>
                <button
                  onClick={() => setInvalidFilter("forceful")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    invalidFilter === "forceful"
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  Forceful Test Issues ({forcefulCount})
                </button>
                <button
                  onClick={() => setInvalidFilter("fully_invalid")}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Type
                    </th>
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
                  {(activeTab === TABS.VALID
                    ? validFiltered
                    : invalidFiltered
                  ).map((number, idx) => (
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
                        {number.region ? (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap inline-block ${
                              activeTab === TABS.VALID
                                ? number.originalCountry &&
                                  number.originalCountry.toUpperCase() !==
                                    (
                                      number.region || number.countryCode
                                    )?.toUpperCase()
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {getCountryName(
                              number.region || number.countryCode
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {number.type ? (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              activeTab === TABS.VALID
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {number.type}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
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
                            {getValidationMethodDisplay(
                              number.validationMethod
                            )}
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
                          onClick={() => handleViewDetails(number)}
                          className="text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(activeTab === TABS.VALID ? validFiltered : invalidFiltered)
                .length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === TABS.MANUAL && (
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
                  <p className="text-yellow-700 font-medium">
                    Testing number...
                  </p>
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

            {data.manualTest && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">
                  Original Upload Test Result
                </h4>
                <ManualTestResultDisplay result={data.manualTest} />
              </div>
            )}
          </div>
        )}
      </div>

      {showDetailsModal && selectedNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-black px-6 py-4 text-white flex justify-between items-center border-b-4 border-yellow-400">
              <h3 className="text-xl font-bold">
                {activeTab === TABS.VALID
                  ? "✅ Valid Number Details"
                  : "❌ Invalid Number Details"}
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedNumber(null);
                }}
                className="text-white hover:text-yellow-400 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedNumber).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p
                      className={`text-sm font-mono ${
                        key === "error"
                          ? "text-red-600"
                          : key === "originalPhoneNumber" ||
                            key === "e164" ||
                            key === "international" ||
                            key === "national"
                          ? "text-yellow-600"
                          : "text-gray-900"
                      }`}
                    >
                      {value !== null && value !== undefined
                        ? String(value)
                        : "—"}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Raw JSON
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(selectedNumber, null, 2)}
                </pre>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  const blob = new Blob(
                    [JSON.stringify(selectedNumber, null, 2)],
                    {
                      type: "application/json",
                    }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `phone-${
                    selectedNumber.rowNumber || "details"
                  }.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors font-medium"
              >
                Download JSON
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedNumber(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}