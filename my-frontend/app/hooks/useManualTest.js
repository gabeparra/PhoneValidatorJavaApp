import { useState } from "react";
import axios from "axios";
import { getApiUrl, API_CONFIG } from "../utils/constants";

export const useManualTest = () => {
  const [manualTestResult, setManualTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

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

  return {
    manualTestResult,
    testLoading,
    handleTestPhone,
  };
};