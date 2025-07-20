import { parseAsString, useQueryStates } from "nuqs";

const useProductFilters = () => {
  return useQueryStates({
    minPrice: parseAsString.withOptions({ clearOnDefault: true }),
    maxPrice: parseAsString.withOptions({ clearOnDefault: true }),
  });
};

export { useProductFilters };
