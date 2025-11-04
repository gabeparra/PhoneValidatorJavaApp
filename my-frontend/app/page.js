'use client';

import { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function Home() {
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (file, manualNumber = null, country = null) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (manualNumber) {
        const tempFileData = [
          {
            rowNumber: 1,
            id: 'manual-test',
            email: '',
            name: 'Manual Test',
            originalPhoneNumber: manualNumber,
            country: country
          }
        ];

        response = await axios.post(
          `${API_URL}/validate-phones-manual`,
          {
            phone: manualNumber,
            country: country
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        response.data.manualTest = {
          input: manualNumber,
          valid: response.data.valid_count > 0,
          ...(response.data.valid_count > 0
            ? response.data.valid_numbers?.[0]
            : response.data.invalid_numbers?.[0])
        };
      } else {
        const formData = new FormData();
        formData.append('file', file);

        response = await axios.post(
          `${API_URL}/validate-phones`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      }

      setValidationData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValidationData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Yellow accent line */}
        <div className="h-1 bg-yellow-400 w-full mb-12"></div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            Phone Number Validator
          </h1>
          <p className="text-lg text-gray-700">
            Upload your CSV, Excel, or SQL file to validate and format phone numbers
          </p>
        </div>

        {!validationData ? (
          <FileUpload
            onFileUpload={handleFileUpload}
            loading={loading}
            error={error}
          />
        ) : (
          <Dashboard
            data={validationData}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}