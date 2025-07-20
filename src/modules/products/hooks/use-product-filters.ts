import { useQueryStates } from "nuqs";

import { searchParams } from "../search-params";

const useProductFilters = () => {
  return useQueryStates(searchParams);
};

export { useProductFilters };
