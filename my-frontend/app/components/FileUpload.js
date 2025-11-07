'use client';

import { useState } from 'react';
import {
  FILE_CONFIG,
  MANUAL_TEST_COUNTRIES,
  DEFAULTS,
} from '../utils/constants';
import BestPracticesTab from './BestPracticesTab';

export default function FileUpload({ onFileUpload, loading, error }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [manualNumber, setManualNumber] = useState('');
  const [manualCountry, setManualCountry] = useState(DEFAULTS.MANUAL_TEST_COUNTRY);
  const [showManualInput, setShowManualInput] = useState(false);
  const [showBestPractices, setShowBestPractices] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const handleTestNumber = () => {
    if (!manualNumber.trim()) {
      alert('Please enter a phone number');
      return;
    }

    const phoneToTest = manualNumber.startsWith('+')
      ? manualNumber
      : `+${manualNumber}`;

    onFileUpload(null, phoneToTest, manualCountry);
    setManualNumber('');
    setShowManualInput(false);
  };

  // Generate accept attribute from FILE_CONFIG
  const acceptedExtensions = FILE_CONFIG.ACCEPTED_EXTENSIONS.join(',');

  // Generate file description text
  const fileDescription = FILE_CONFIG.ACCEPTED_EXTENSIONS
    .map(ext => FILE_CONFIG.DISPLAY_NAMES[ext] || ext.substring(1))
    .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
    .join(', ') + ' files only';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Best Practices Guide */}
      <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-yellow-400">
        <button
          onClick={() => setShowBestPractices(!showBestPractices)}
          className="w-full flex items-center justify-between text-left font-semibold text-black hover:text-yellow-600"
        >
          <span>📋 Excel File Best Practices Guide</span>
          <svg
            className={`h-5 w-5 transform transition-transform ${showBestPractices ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {showBestPractices && (
          <div className="mt-6">
            <BestPracticesTab />
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-yellow-400">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
              ? 'border-yellow-400 bg-yellow-50'
              : 'border-gray-300 hover:border-yellow-400'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="mb-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-yellow-600 hover:text-yellow-700 font-medium"
            >
              Choose a file
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept={acceptedExtensions}
              onChange={handleChange}
              disabled={loading}
            />
            <span className="text-gray-600"> or drag and drop</span>
          </div>

          <p className="text-sm text-gray-500">
            {fileDescription}
          </p>
        </div>

        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-gray-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">{selectedFile.name}</span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-red-500 hover:text-red-700"
                disabled={loading}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          className={`mt-6 w-full py-3 px-4 rounded-lg font-medium text-black transition-colors ${!selectedFile || loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-yellow-400 hover:bg-yellow-500'
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
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
              Validating...
            </span>
          ) : (
            'Validate Phone Numbers'
          )}
        </button>
      </div>

      {/* Manual Number Testing */}
      <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-yellow-400">
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="w-full flex items-center justify-between text-left font-semibold text-black hover:text-yellow-600"
        >
          <span>🔢 Test Individual Phone Number</span>
          <svg
            className={`h-5 w-5 transform transition-transform ${showManualInput ? 'rotate-180' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {showManualInput && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={manualNumber}
                onChange={(e) => setManualNumber(e.target.value)}
                placeholder={DEFAULTS.PLACEHOLDER_TEXT.PHONE_NUMBER}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleTestNumber()}
                disabled={loading}
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
                value={manualCountry}
                onChange={(e) => setManualCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent focus:outline-none"
                disabled={loading}
              >
                {MANUAL_TEST_COUNTRIES.map(country => (
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
              onClick={handleTestNumber}
              disabled={loading || !manualNumber.trim()}
              className={`w-full py-2 px-4 rounded-lg font-medium text-black transition-colors ${loading || !manualNumber.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-yellow-400 hover:bg-yellow-500'
                }`}
            >
              Test This Number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}