export default function StatsCards({ data }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-400">
        <p className="text-gray-400 text-sm">Total Numbers</p>
        <p className="text-3xl font-bold mt-1 text-white">
          {data.total_numbers}
        </p>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-400">
        <p className="text-gray-400 text-sm">Valid Numbers</p>
        <p className="text-3xl font-bold mt-1 text-green-400">
          {data.valid_count}
        </p>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-400">
        <p className="text-gray-400 text-sm">Invalid Numbers</p>
        <p className="text-3xl font-bold mt-1 text-red-400">
          {data.invalid_count}
        </p>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 border-l-4 border-yellow-400">
        <p className="text-gray-400 text-sm">Success Rate</p>
        <p className="text-3xl font-bold mt-1 text-yellow-400">
          {data.success_rate.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}

