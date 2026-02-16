"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import FileUpload from "./components/FileUpload";
import Dashboard from "./components/Dashboard";
import { getApiUrl, API_CONFIG } from "./utils/constants";

export default function Home() {
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const pollIntervalRef = useRef(null);

  // Poll for job status
  const pollJobStatus = async (jobId) => {
    try {
      const response = await axios.get(
        `${getApiUrl(API_CONFIG.ENDPOINTS.JOB_STATUS)}/${jobId}`
      );
      const status = response.data;
      setJobStatus(status);

      if (status.status === "finished" && status.result) {
        // Job completed successfully
        setValidationData(status.result);
        setLoading(false);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } else if (status.status === "failed") {
        // Job failed
        setError(status.error || "Job processing failed");
        setLoading(false);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
      // If still processing, continue polling
    } catch (err) {
      console.error("Error polling job status:", err);
      setError(
        err.response?.data?.detail || err.message || "Error checking job status"
      );
      setLoading(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleFileUpload = async (
    file,
    manualNumber = null,
    country = null
  ) => {
    setLoading(true);
    setError(null);
    setJobId(null);
    setJobStatus(null);
    setValidationData(null);

    // Clear any existing polling
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    try {
      let response;

      if (manualNumber) {
        // Manual validation - still synchronous for quick response
        response = await axios.post(
          getApiUrl(API_CONFIG.ENDPOINTS.VALIDATE_PHONES_MANUAL),
          {
            phone: manualNumber,
            country: country,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        response.data.manualTest = {
          input: manualNumber,
          valid: response.data.valid_count > 0,
          ...(response.data.valid_count > 0
            ? response.data.valid_numbers?.[0]
            : response.data.invalid_numbers?.[0]),
        };
        setValidationData(response.data);
        setLoading(false);
      } else {
        // File upload - uses queue system
        const formData = new FormData();
        formData.append("file", file);

        response = await axios.post(
          getApiUrl(API_CONFIG.ENDPOINTS.VALIDATE_PHONES),
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        // Check if response has job_id (queue system)
        if (response.data.job_id) {
          setJobId(response.data.job_id);
          setJobStatus({
            status: "queued",
            position: response.data.position,
          });

          // Start polling for job status
          pollIntervalRef.current = setInterval(() => {
            pollJobStatus(response.data.job_id);
          }, 2000); // Poll every 2 seconds

          // Poll immediately
          pollJobStatus(response.data.job_id);
        } else {
          // Fallback to immediate response (if queue disabled)
          setValidationData(response.data);
          setLoading(false);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || err.message || "Validation failed"
      );
      setLoading(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  };

  const handleReset = () => {
    setValidationData(null);
    setError(null);
    setJobId(null);
    setJobStatus(null);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  return (
    <div className="bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Yellow accent line */}
        <div className="h-1 bg-yellow-400 w-full mb-12"></div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            Phone Number Validator
          </h1>
          <p className="text-lg text-gray-700">
            Upload your CSV, Excel, or SQL file to validate and format phone
            numbers
          </p>
        </div>

        {!validationData && !jobId ? (
          <FileUpload
            onFileUpload={handleFileUpload}
            loading={loading}
            error={error}
          />
        ) : jobId && !validationData ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 border-t-4 border-yellow-400">
              <h2 className="text-2xl font-bold text-black mb-4">
                Processing Your File
              </h2>
              
              {jobStatus && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <svg
                      className="animate-spin h-6 w-6 text-yellow-400"
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
                    <div>
                      <p className="text-lg font-medium text-black">
                        {jobStatus.status === "queued" && "Queued for processing"}
                        {jobStatus.status === "started" && "Processing your file..."}
                        {jobStatus.status === "finished" && "Almost done..."}
                      </p>
                      {jobStatus.progress && (
                        <p className="text-sm text-gray-600 mt-1">
                          {jobStatus.progress}
                        </p>
                      )}
                      {jobStatus.position && jobStatus.position > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                          Position in queue: {jobStatus.position}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                      <p className="text-sm text-red-700">{error}</p>
                      <button
                        onClick={handleReset}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <Dashboard data={validationData} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
