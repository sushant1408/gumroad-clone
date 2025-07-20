import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SearchParams } from "nuqs/server";

import { DEFAULT_LIMIT } from "@/lib/constants";
import { loadProductFilters } from "@/modules/products/search-params";
import { ProductsListView } from "@/modules/products/ui/views/product-list-view";
import { getQueryClient, trpc } from "@/trpc/server";

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<SearchParams>;
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const { subcategory } = await params;
  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      category: subcategory,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsListView category={subcategory} />
    </HydrationBoundary>
  );
}
