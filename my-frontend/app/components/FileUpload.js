'use client';

import { useState } from 'react';

export default function FileUpload({ onFileUpload, loading, error }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [manualNumber, setManualNumber] = useState('');
  const [manualCountry, setManualCountry] = useState('US');
  const [showManualInput, setShowManualInput] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400'
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
              className="cursor-pointer text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Choose a file
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".csv,.xlsx,.xls,.sql"
              onChange={handleChange}
              disabled={loading}
            />
            <span className="text-gray-600"> or drag and drop</span>
          </div>
          
          <p className="text-sm text-gray-500">
            CSV, Excel (.xlsx, .xls), or SQL files only
          </p>
        </div>

        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
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
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
          className={`mt-6 w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            !selectedFile || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
      <div className="bg-white rounded-lg shadow-lg p-8">
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="w-full flex items-center justify-between text-left font-semibold text-indigo-600 hover:text-indigo-700"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={manualNumber}
                onChange={(e) => setManualNumber(e.target.value)}
                placeholder="e.g., +1234567890 or 1234567890"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleTestNumber()}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +55 for Brazil, +1 for USA)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country (Fallback)
              </label>
              <select
                value={manualCountry}
                onChange={(e) => setManualCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="US">United States (+1)</option>
                <option value="BR">Brazil (+55)</option>
                <option value="MX">Mexico (+52)</option>
                <option value="CO">Colombia (+57)</option>
                <option value="CR">Costa Rica (+506)</option>
                <option value="ES">Spain (+34)</option>
                <option value="CA">Canada (+1)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Used if country code not detected in number
              </p>
            </div>

            <button
              onClick={handleTestNumber}
              disabled={loading || !manualNumber.trim()}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white transition-colors ${
                loading || !manualNumber.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
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