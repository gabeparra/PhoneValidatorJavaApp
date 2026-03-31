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

const escapeCSV = (value) => {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
};

/**
 * Build CSV with original columns first (from CSV/Excel upload), then validation columns.
 * Use when data.original_column_names is present.
 */
export const downloadCSVWithOriginalColumns = (
  dataArray,
  filename,
  { originalColumnNames, type }
) => {
  if (dataArray.length === 0) return;
  const origCols = originalColumnNames || [];
  const hasOrig = origCols.length > 0;

  let headers;
  let getRowValues;
  if (type === "valid") {
    headers = ["Row", ...origCols, "E.164", "International", "National", "Country Code", "Region", "Type", "Validation Method", "Platform"];
    getRowValues = (row) => {
      const origVals = hasOrig ? (row.originalColumnValues ?? []) : [];
      const padded = hasOrig ? origCols.map((_, i) => origVals[i] ?? "") : [];
      return [
        row.rowNumber ?? "",
        ...padded,
        row.e164 ?? "",
        row.international ?? "",
        row.national ?? "",
        row.countryCode ?? "",
        row.region ?? "",
        row.type ?? "",
        row.validationMethod ?? "",
        row.platform ?? "",
      ];
    };
  } else if (type === "all") {
    headers = ["Row", ...origCols, "Status", "E.164", "International", "National", "Country Code", "Region", "Type", "Validation Method", "Error", "Platform"];
    getRowValues = (row) => {
      const origVals = hasOrig ? (row.originalColumnValues ?? []) : [];
      const padded = hasOrig ? origCols.map((_, i) => origVals[i] ?? "") : [];
      const status = row.status ?? (row.error ? "invalid" : (row.validationMethod === "forceful" ? "forceful" : "valid"));
      return [
        row.rowNumber ?? "",
        ...padded,
        status,
        row.e164 ?? "",
        row.international ?? "",
        row.national ?? "",
        row.countryCode ?? "",
        row.region ?? "",
        row.type ?? "",
        row.validationMethod ?? "",
        row.error ?? "",
        row.platform ?? "",
      ];
    };
  } else {
    headers = ["Row", ...origCols, "Error", "Platform"];
    getRowValues = (row) => {
      const origVals = hasOrig ? (row.originalColumnValues ?? []) : [];
      const padded = hasOrig ? origCols.map((_, i) => origVals[i] ?? "") : [];
      return [
        row.rowNumber ?? "",
        ...padded,
        row.error ?? "",
        row.platform ?? "",
      ];
    };
  }

  const csvContent = [
    headers.map((h) => escapeCSV(h)).join(","),
    ...dataArray.map((row) => getRowValues(row).map(escapeCSV).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Infer original column names from the first record that has originalColumnValues.
 * Used when API doesn't return original_column_names (e.g. old backend or Redis serialization).
 */
function inferOriginalColumnNames(dataArray) {
  for (const row of dataArray) {
    const vals = row?.originalColumnValues;
    if (Array.isArray(vals) && vals.length > 0) {
      return vals.map((_, i) => `Column_${i + 1}`);
    }
  }
  return null;
}

export const downloadCSV = (dataArray, filename, options = null) => {
  if (dataArray.length === 0) return;

  // Prefer explicit original columns from API
  const explicitOrigCols = options?.originalColumnNames;
  // Fallback: infer from first record that has originalColumnValues (so export works even if API didn't send original_column_names)
  const inferredOrigCols = inferOriginalColumnNames(dataArray);
  const originalColumnNames = (explicitOrigCols?.length ? explicitOrigCols : inferredOrigCols) ?? [];

  if (originalColumnNames.length > 0 && options?.type) {
    return downloadCSVWithOriginalColumns(dataArray, filename, {
      originalColumnNames,
      type: options.type,
    });
  }

  const headers = Object.keys(dataArray[0]).filter((k) => k !== "originalColumnValues");
  const csvContent = [
    headers.join(","),
    ...dataArray.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (Array.isArray(value)) return escapeCSV(value.join(","));
          return escapeCSV(value ?? "");
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

