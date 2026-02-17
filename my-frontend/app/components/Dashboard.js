"use client";

import { useState } from "react";
import { TABS, VALIDATION_METHOD_FILTERS } from "../utils/constants";
import { usePhoneFilters } from "../hooks/usePhoneFilters";
import { useManualTest } from "../hooks/useManualTest";
import { useDetailsModal } from "../hooks/useDetailsModal";
import { filterNumbers } from "../utils/filters";
import StatsCards from "./dashboard/StatsCards";
import TabNavigation from "./dashboard/TabNavigation";
import OverviewTab from "./dashboard/OverviewTab";
import PhoneNumbersTable from "./dashboard/PhoneNumbersTable";
import ManualTestTab from "./dashboard/ManualTestTab";
import NumberDetailsModal from "./dashboard/NumberDetailsModal";

export default function Dashboard({ data, onReset }) {
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);

  // Separate forceful validation results from regular valid numbers
  const forcefulNumbers = data.valid_numbers.filter(
    (n) => n.validationMethod === "forceful"
  );
  const regularValidNumbers = data.valid_numbers.filter(
    (n) => n.validationMethod !== "forceful"
  );
  const forcefulCount = forcefulNumbers.length;
  const regularValidCount = regularValidNumbers.length;

  const {
    searchTerm,
    setSearchTerm,
    validationMethodFilter,
    setValidationMethodFilter,
    invalidFilter,
    setInvalidFilter,
    validFiltered,
    invalidFiltered,
  } = usePhoneFilters(regularValidNumbers, data.invalid_numbers);

  const { manualTestResult, testLoading, handleTestPhone } = useManualTest();

  const {
    selectedNumber,
    showDetailsModal,
    handleViewDetails,
    handleCloseModal,
  } = useDetailsModal();

  const tabs = [
    { id: TABS.OVERVIEW, label: "Overview" },
    { id: TABS.VALID, label: `Valid (${regularValidCount})` },
    { id: TABS.FORCEFUL, label: `⚠️ Forceful (${forcefulCount})` },
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
            validNumbers={regularValidNumbers}
            invalidNumbers={data.invalid_numbers}
            forcefulCount={0}
            fullyInvalidCount={data.invalid_numbers.length}
            onViewDetails={handleViewDetails}
          />
        )}

        {activeTab === TABS.FORCEFUL && (
          <PhoneNumbersTable
            activeTab={TABS.VALID}
            numbers={filterNumbers(forcefulNumbers, searchTerm)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            validationMethodFilter={VALIDATION_METHOD_FILTERS.ALL}
            onValidationMethodFilterChange={() => {}}
            invalidFilter="all"
            onInvalidFilterChange={() => {}}
            validNumbers={forcefulNumbers}
            invalidNumbers={[]}
            forcefulCount={0}
            fullyInvalidCount={0}
            onViewDetails={handleViewDetails}
            isForcefulTab={true}
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
