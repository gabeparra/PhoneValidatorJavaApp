export const downloadJSON = (dataArray, filename) => {
  const blob = new Blob([JSON.stringify(dataArray, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadCSV = (dataArray, filename) => {
  if (dataArray.length === 0) return;

  const headers = Object.keys(dataArray[0]);
  const csvContent = [
    headers.join(","),
    ...dataArray.map((row) =>
      headers
        .map((header) => {
          const value = row[header] || "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

