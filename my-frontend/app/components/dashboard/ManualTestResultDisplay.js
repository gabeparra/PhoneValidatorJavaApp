export default function ManualTestResultDisplay({ result }) {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded p-3 border border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Input:</strong>{" "}
          <span className="font-mono">{result.input}</span>
        </p>
      </div>

      {result.valid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              E.164 Format
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.e164}
            </p>
          </div>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              International Format
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.international}
            </p>
          </div>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              National Format
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.national}
            </p>
          </div>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              Country Code
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.countryCode}
            </p>
          </div>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              Region/Country
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.region}
            </p>
          </div>
          <div className="bg-white rounded p-3 border border-green-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
              Phone Type
            </p>
            <p className="text-sm font-mono text-gray-900 mt-1">
              {result.type}
            </p>
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
}

