import { VALIDATION_METHOD_FILTERS } from "./constants";

export const filterNumbers = (numbers, searchTerm) => {
  if (!searchTerm) return numbers;

  const term = searchTerm.toLowerCase();
  return numbers.filter(
    (num) =>
      num.originalPhoneNumber?.toLowerCase().includes(term) ||
      num.e164?.toLowerCase().includes(term) ||
      num.email?.toLowerCase().includes(term) ||
      num.name?.toLowerCase().includes(term)
  );
};

export const filterByValidationMethod = (numbers, validationMethodFilter) => {
  if (validationMethodFilter === VALIDATION_METHOD_FILTERS.ALL) return numbers;
  return numbers.filter(
    (num) => num.validationMethod === validationMethodFilter
  );
};

export const filterByInvalidType = (numbers, invalidFilter) => {
  if (invalidFilter === "all") return numbers;
  if (invalidFilter === "forceful") {
    return numbers.filter((num) =>
      num.error?.toLowerCase().includes("forceful testing")
    );
  }
  if (invalidFilter === "fully_invalid") {
    return numbers.filter(
      (num) => !num.error?.toLowerCase().includes("forceful testing")
    );
  }
  return numbers;
};

