"use client";

import { useState } from "react";
import { TABS } from "../utils/constants";
import { usePhoneFilters } from "../hooks/usePhoneFilters";
import { useManualTest } from "../hooks/useManualTest";
import { useDetailsModal } from "../hooks/useDetailsModal";
import StatsCards from "./dashboard/StatsCards";
import TabNavigation from "./dashboard/TabNavigation";
import OverviewTab from "./dashboard/OverviewTab";
import PhoneNumbersTable from "./dashboard/PhoneNumbersTable";
import ManualTestTab from "./dashboard/ManualTestTab";
import NumberDetailsModal from "./dashboard/NumberDetailsModal";

export default function Dashboard({ data, onReset }) {
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);

  const {
    searchTerm,
    setSearchTerm,
    validationMethodFilter,
    setValidationMethodFilter,
    invalidFilter,
    setInvalidFilter,
    validFiltered,
    invalidFiltered,
  } = usePhoneFilters(data.valid_numbers, data.invalid_numbers);

  const { manualTestResult, testLoading, handleTestPhone } = useManualTest();

  const {
    selectedNumber,
    showDetailsModal,
    handleViewDetails,
    handleCloseModal,
  } = useDetailsModal();

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

        <StatsCards data={data} />
      </div>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="p-6">
        {activeTab === TABS.OVERVIEW && <OverviewTab data={data} />}

        {(activeTab === TABS.VALID || activeTab === TABS.INVALID) && (
          <PhoneNumbersTable
            activeTab={activeTab}
            numbers={
              activeTab === TABS.VALID ? validFiltered : invalidFiltered
            }
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            validationMethodFilter={validationMethodFilter}
            onValidationMethodFilterChange={setValidationMethodFilter}
            invalidFilter={invalidFilter}
            onInvalidFilterChange={setInvalidFilter}
            validNumbers={data.valid_numbers}
            invalidNumbers={data.invalid_numbers}
            forcefulCount={forcefulCount}
            fullyInvalidCount={fullyInvalidCount}
            onViewDetails={handleViewDetails}
          />
        )}

        {activeTab === TABS.MANUAL && (
          <ManualTestTab
            testLoading={testLoading}
            handleTestPhone={handleTestPhone}
            manualTestResult={manualTestResult}
            manualTestFromData={data.manualTest}
          />
        )}
      </div>

      {showDetailsModal && selectedNumber && (
        <NumberDetailsModal
          activeTab={activeTab}
          selectedNumber={selectedNumber}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
