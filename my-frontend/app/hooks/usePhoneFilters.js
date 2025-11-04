import { useState, useMemo } from "react";
import { VALIDATION_METHOD_FILTERS } from "../utils/constants";
import {
  filterNumbers,
  filterByValidationMethod,
  filterByInvalidType,
} from "../utils/filters";

export const usePhoneFilters = (validNumbers, invalidNumbers) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [validationMethodFilter, setValidationMethodFilter] = useState(
    VALIDATION_METHOD_FILTERS.ALL
  );
  const [invalidFilter, setInvalidFilter] = useState("all");

  const validFiltered = useMemo(() => {
    return filterByValidationMethod(
      filterNumbers(validNumbers, searchTerm),
      validationMethodFilter
    );
  }, [validNumbers, searchTerm, validationMethodFilter]);

  const invalidFiltered = useMemo(() => {
    return filterByInvalidType(
      filterNumbers(invalidNumbers, searchTerm),
      invalidFilter
    );
  }, [invalidNumbers, searchTerm, invalidFilter]);

  return {
    searchTerm,
    setSearchTerm,
    validationMethodFilter,
    setValidationMethodFilter,
    invalidFilter,
    setInvalidFilter,
    validFiltered,
    invalidFiltered,
  };
};

