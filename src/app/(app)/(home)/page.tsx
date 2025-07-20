import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { SearchParams } from "nuqs/server";

import { DEFAULT_LIMIT } from "@/lib/constants";
import { loadProductFilters } from "@/modules/products/search-params";
import { ProductsListView } from "@/modules/products/ui/views/product-list-view";
import { getQueryClient, trpc } from "@/trpc/server";

interface CategoryPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function HomePage({ searchParams }: CategoryPageProps) {
  const filters = await loadProductFilters(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      ...filters,
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsListView />
    </HydrationBoundary>
  );
}
