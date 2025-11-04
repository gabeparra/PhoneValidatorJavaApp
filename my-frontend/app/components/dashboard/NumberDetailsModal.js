import { TABS } from "../../utils/constants";

export default function NumberDetailsModal({
  activeTab,
  selectedNumber,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-black px-6 py-4 text-white flex justify-between items-center border-b-4 border-yellow-400">
          <h3 className="text-xl font-bold">
            {activeTab === TABS.VALID
              ? "✅ Valid Number Details"
              : "❌ Invalid Number Details"}
          </h3>
          <button
            onClick={onClose}
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
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

