import {
  createLoader,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

const sortValues = ["curated", "trending", "hot_and_new"] as const;

const searchParams = {
  sort: parseAsStringLiteral(sortValues)
    .withDefault("curated")
    .withOptions({ clearOnDefault: true }),
  minPrice: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  maxPrice: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  tags: parseAsArrayOf(parseAsString)
    .withDefault([])
    .withOptions({ clearOnDefault: true }),
};

const loadProductFilters = createLoader(searchParams);

export { loadProductFilters, searchParams, sortValues };
