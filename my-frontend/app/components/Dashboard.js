'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Dashboard({ data, onReset }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [manualTestResult, setManualTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const downloadJSON = (dataArray, filename) => {
    const blob = new Blob([JSON.stringify(dataArray, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (dataArray, filename) => {
    if (dataArray.length === 0) return;

    const headers = Object.keys(dataArray[0]);
    const csvContent = [
      headers.join(','),
      ...dataArray.map(row =>
        headers.map(header => {
          const value = row[header] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterNumbers = (numbers) => {
    if (!searchTerm) return numbers;
    
    const term = searchTerm.toLowerCase();
    return numbers.filter(
      num =>
        num.originalPhoneNumber?.toLowerCase().includes(term) ||
        num.e164?.toLowerCase().includes(term) ||
        num.email?.toLowerCase().includes(term) ||
        num.name?.toLowerCase().includes(term)
    );
  };

  const handleViewDetails = (number) => {
    setSelectedNumber(number);
    setShowDetailsModal(true);
  };

  // Helper component to display test results
  const ManualTestResultDisplay = ({ result }) => (
    <div className="space-y-3">
      <div className="bg-white rounded p-3 border border-gray-200">
        <p className="text-sm text-gray-600">
          <strong>Input:</strong> <span className="font-mono">{result.input}</span>
        </p>
      </div>

      {result.valid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">E.164 Format</p>
            <p className="text-sm font-mono text-gray-900 mt-1">{result.e164}</p>
          </div>
          
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">International Format</p>
            <p className="text-sm font-mono text-gray-900 mt-1">{result.international}</p>
          </div>
          
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">National Format</p>
            <p className="text-sm font-mono text-gray-900 mt-1">{result.national}</p>
          </div>
          
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Country Code</p>
            <p className="text-sm font-mono text-gray-900 mt-1">{result.countryCode}</p>
          </div>
          
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Region/Country</p>
            <p className="text-sm font-mono text-gray-900 mt-1">{result.region}</p>
          </div>
          
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Phone Type</p>
            <p className="text-sm font-mono text-gray-900 mt-1">{result.type}</p>
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

  // Function to test a phone number
  const handleTestPhone = async () => {
    const phoneInput = document.getElementById('manualTestInput')?.value;
    const countryInput = document.getElementById('manualTestCountry')?.value;

    if (!phoneInput || !phoneInput.trim()) {
      alert('Please enter a phone number');
      return;
    }

    setTestLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/validate-phones-manual`,
        {
          phone: phoneInput.trim(),
          country: countryInput
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Extract result from response
      const testResult = {
        input: phoneInput.trim(),
        valid: response.data.valid_count > 0,
        ...(response.data.valid_count > 0
          ? response.data.valid_numbers?.[0]
          : response.data.invalid_numbers?.[0])
      };

      setManualTestResult(testResult);
      document.getElementById('manualTestInput').value = '';
    } catch (error) {
      alert('Error testing number: ' + (error.response?.data?.detail || error.message));
    } finally {
      setTestLoading(false);
    }
  };

  const validFiltered = filterNumbers(data.valid_numbers);
  const invalidFiltered = filterNumbers(data.invalid_numbers);

  // Build tabs array - include manual test tab
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'valid', label: `Valid (${data.valid_count})` },
    { id: 'invalid', label: `Invalid (${data.invalid_count})` },
    { id: 'manual', label: '🔢 Manual Test' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Validation Results</h2>
            <p className="text-indigo-100">
              Processed on {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onReset}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            Upload New File
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-indigo-100 text-sm">Total Numbers</p>
            <p className="text-3xl font-bold mt-1">{data.total_numbers}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-indigo-100 text-sm">Valid Numbers</p>
            <p className="text-3xl font-bold mt-1 text-green-300">
              {data.valid_count}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-indigo-100 text-sm">Invalid Numbers</p>
            <p className="text-3xl font-bold mt-1 text-red-300">
              {data.invalid_count}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-indigo-100 text-sm">Success Rate</p>
            <p className="text-3xl font-bold mt-1">{data.success_rate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Country Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(data.country_breakdown).map(([country, count]) => (
                  <div
                    key={country}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">{country}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Download Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Valid Numbers</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadJSON(data.valid_numbers, 'valid_numbers.json')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Download JSON
                    </button>
                    <button
                      onClick={() => downloadCSV(data.valid_numbers, 'valid_numbers.csv')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Invalid Numbers</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadJSON(data.invalid_numbers, 'invalid_numbers.json')}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Download JSON
                    </button>
                    <button
                      onClick={() => downloadCSV(data.invalid_numbers, 'invalid_numbers.csv')}
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

        {(activeTab === 'valid' || activeTab === 'invalid') && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by phone, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Row
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Original Number
                    </th>
                    {activeTab === 'valid' ? (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          E164 Format
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Country
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Error
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(activeTab === 'valid' ? validFiltered : invalidFiltered).map(
                    (number, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {number.rowNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                          {number.originalPhoneNumber}
                        </td>
                        {activeTab === 'valid' ? (
                          <>
                            <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                              {number.e164}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {number.region}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                {number.type}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm text-red-600">
                              {number.error}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {number.name}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {number.email}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleViewDetails(number)}
                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
              
              {(activeTab === 'valid' ? validFiltered : invalidFiltered).length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual Test Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-6">
            {/* Test Input Form */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">Test Another Number</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="manualTestInput"
                    placeholder="e.g., +1234567890 or 1234567890"
                    defaultValue=""
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !testLoading) {
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country (Fallback)
                  </label>
                  <select
                    id="manualTestCountry"
                    defaultValue="US"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={testLoading}
                  >
                    <option value="US">United States (+1)</option>
                    <option value="BR">Brazil (+55)</option>
                    <option value="MX">Mexico (+52)</option>
                    <option value="CO">Colombia (+57)</option>
                    <option value="CR">Costa Rica (+506)</option>
                    <option value="ES">Spain (+34)</option>
                    <option value="CA">Canada (+1)</option>
                  </select>
                </div>

                <button
                  onClick={handleTestPhone}
                  disabled={testLoading}
                  className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                    testLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {testLoading ? 'Testing...' : 'Test This Number'}
                </button>
              </div>
            </div>

            {/* Loading State */}
            {testLoading && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-yellow-700 font-medium">Testing number...</p>
                </div>
              </div>
            )}

            {/* Current Test Result */}
            {manualTestResult && !testLoading && (
              <div className={`border-2 rounded-lg p-6 ${
                manualTestResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <h4 className="text-lg font-semibold mb-4">
                  {manualTestResult.valid ? '✅ Test Result - Valid' : '❌ Test Result - Invalid'}
                </h4>
                <ManualTestResultDisplay result={manualTestResult} />
              </div>
            )}

            {/* Original Test Result (if exists) */}
            {data.manualTest && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">Original Upload Test Result</h4>
                <ManualTestResultDisplay result={data.manualTest} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {activeTab === 'valid' ? '✅ Valid Number Details' : '❌ Invalid Number Details'}
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedNumber(null);
                }}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedNumber).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className={`text-sm font-mono ${
                      key === 'error' ? 'text-red-600' : 
                      key === 'originalPhoneNumber' || key === 'e164' || key === 'international' || key === 'national' ? 'text-indigo-600' :
                      'text-gray-900'
                    }`}>
                      {value !== null && value !== undefined ? String(value) : '—'}
                    </p>
                  </div>
                ))}
              </div>

              {/* JSON View */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Raw JSON</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(selectedNumber, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(selectedNumber, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `phone-${selectedNumber.rowNumber || 'details'}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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