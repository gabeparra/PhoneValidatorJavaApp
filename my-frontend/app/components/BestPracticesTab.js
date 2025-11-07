"use client";

export default function BestPracticesTab() {
  const recommendedColumns = [
    { name: "ID", required: false, description: "Unique identifier for the record" },
    { name: "Name", required: false, description: "Full name (preferred over First Name/Last Name)" },
    { name: "Email", required: false, description: "Email address" },
    { name: "Phone", required: true, description: "Phone number (REQUIRED - at least one phone column needed)" },
    { name: "Country", required: false, description: "Country code or name (helps with validation)" },
    { name: "Platform", required: false, description: "Platform or source information" },
  ];

  const supportedVariations = {
    "ID": ["ID", "id", "EMPLID", "SEVIS ID"],
    "Name": [
      "Name (full name - preferred)",
      "First Name + Last Name",
      "Given Name + Surname",
      "Primary Name"
    ],
    "Email": [
      "Email",
      "E-mail",
      "Personal Email (preferred over Campus Email)",
      "Campus Email"
    ],
    "Phone": [
      "Phone",
      "Updated Number",
      "Telephone U.S.",
      "Telephone Foreign"
    ],
    "Country": [
      "Country",
      "Citizenship"
    ],
    "Platform": [
      "Platform"
    ]
  };

  const exampleData = [
    { ID: "12345", Name: "John Doe", Email: "john@example.com", Phone: "+1234567890", Country: "US", Platform: "Facebook" },
    { ID: "12346", Name: "Jane Smith", Email: "jane@example.com", Phone: "+5511987654321", Country: "BR", Platform: "Instagram" },
    { ID: "12347", Name: "Carlos García", Email: "", Phone: "+521234567890", Country: "MX", Platform: "" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Start */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Start - Recommended Column Names
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          Use these simple column names for the easiest parsing experience:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendedColumns.map((col) => (
            <div
              key={col.name}
              className={`p-3 rounded-lg border-2 ${
                col.required
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-black text-sm">{col.name}</span>
                {col.required && (
                  <span className="text-xs font-bold text-red-600 bg-red-200 px-2 py-0.5 rounded">
                    REQUIRED
                  </span>
                )}
                {!col.required && (
                  <span className="text-xs text-gray-500">Optional</span>
                )}
              </div>
              <p className="text-xs text-gray-600">{col.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-gray-700">
            <strong>Note:</strong> At least one phone number column is required. 
            If you don't have a phone number, the row will be skipped.
          </p>
        </div>
      </div>

      {/* Supported Variations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
          <span className="mr-2">🔍</span>
          All Supported Column Name Variations
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          The parser recognizes these column name variations. Use any of these and it will work:
        </p>
        <div className="space-y-3">
          {Object.entries(supportedVariations).map(([category, variations]) => (
            <div key={category} className="border-l-4 border-yellow-400 pl-3">
              <h4 className="font-semibold text-black mb-2 text-sm">{category}:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {variations.map((variation, idx) => (
                  <li key={idx} className="text-xs">
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                      {variation}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Example Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Example Excel Format
        </h3>
        <p className="text-gray-600 mb-4 text-sm">
          Here's how your Excel file should look:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-yellow-100">
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-black">
                  ID
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-black">
                  Name
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-black">
                  Email
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-black">
                  Phone
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-black">
                  Country
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-black">
                  Platform
                </th>
              </tr>
            </thead>
            <tbody>
              {exampleData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="border border-gray-300 px-3 py-2 text-gray-700">
                    {row.ID}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-700">
                    {row.Name}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-700">
                    {row.Email || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-700 font-mono">
                    {row.Phone}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-700">
                    {row.Country}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-700">
                    {row.Platform || <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
          <span className="mr-2">💡</span>
          Tips for Best Results
        </h3>
        <div className="space-y-2">
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2 font-bold text-sm">✓</span>
            <p className="text-gray-600 text-xs">
              <strong className="text-black">Phone Number Format:</strong> Phone numbers can include spaces, dashes, parentheses, or just digits. 
              The parser will clean them automatically. Include country code (e.g., +1, +55) for best results.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2 font-bold text-sm">✓</span>
            <p className="text-gray-600 text-xs">
              <strong className="text-black">Multiple Sheets:</strong> The parser processes all sheets in your workbook. Each sheet should have headers in the first row.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2 font-bold text-sm">✓</span>
            <p className="text-gray-600 text-xs">
              <strong className="text-black">Name Handling:</strong> Use a single "Name" column for full names, or use "First Name" and "Last Name" separately. 
              Full name column takes priority if both are present.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2 font-bold text-sm">✓</span>
            <p className="text-gray-600 text-xs">
              <strong className="text-black">Multiple Phone Columns:</strong> If you have multiple phone columns (Phone, US Telephone, Foreign Telephone), 
              the parser will use them in order: Phone → US Telephone → Foreign Telephone.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2 font-bold text-sm">✓</span>
            <p className="text-gray-600 text-xs">
              <strong className="text-black">Country Information:</strong> Including country information helps with validation accuracy, especially for numbers without country codes.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2 font-bold text-sm">✓</span>
            <p className="text-gray-600 text-xs">
              <strong className="text-black">Empty Cells:</strong> Empty cells are fine for optional fields. Only phone number is required - rows without phone numbers will be skipped.
            </p>
          </div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
          <span className="mr-2">⚠️</span>
          Common Issues to Avoid
        </h3>
        <div className="space-y-2">
          <div className="flex items-start">
            <span className="text-red-500 mr-2 font-bold text-sm">✗</span>
            <p className="text-gray-700 text-xs">
              <strong className="text-black">Missing Headers:</strong> Always include column headers in the first row. Headers are case-insensitive but must match supported variations.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-500 mr-2 font-bold text-sm">✗</span>
            <p className="text-gray-700 text-xs">
              <strong className="text-black">No Phone Numbers:</strong> Rows without phone numbers will be skipped. Make sure at least one phone column exists and has data.
            </p>
          </div>
          <div className="flex items-start">
            <span className="text-red-500 mr-2 font-bold text-sm">✗</span>
            <p className="text-gray-700 text-xs">
              <strong className="text-black">Merged Cells:</strong> Avoid merged cells in the header row or data rows. This can cause parsing issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
