import { downloadJSON, downloadCSV } from "../../utils/downloads";
import { generateDownloadFilename, getCountryName } from "../../utils/constants";

export default function OverviewTab({ data }) {
  return (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium mb-2 text-black">All Numbers</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const allNumbers = [
                    ...data.valid_numbers.map((n) => ({
                      ...n,
                      status: n.validationMethod === "forceful" ? "forceful" : "valid",
                    })),
                    ...data.invalid_numbers.map((n) => ({
                      ...n,
                      status: "invalid",
                    })),
                  ];
                  downloadJSON(
                    allNumbers,
                    generateDownloadFilename("all_numbers", ".json")
                  );
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Download JSON
              </button>
              <button
                onClick={() => {
                  const allNumbers = [
                    ...data.valid_numbers.map((n) => ({
                      ...n,
                      status: n.validationMethod === "forceful" ? "forceful" : "valid",
                    })),
                    ...data.invalid_numbers.map((n) => ({
                      ...n,
                      status: "invalid",
                    })),
                  ];
                  downloadCSV(
                    allNumbers,
                    generateDownloadFilename("all_numbers", ".csv")
                  );
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Download CSV
              </button>
            </div>
          </div>
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
            <h4 className="font-medium mb-2 text-black">Invalid Numbers</h4>
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
  );
}

