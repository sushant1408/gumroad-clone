import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import {
  ProductsList,
  ProductsListLoading,
} from "@/modules/products/ui/components/products-list";
import { getQueryClient, trpc } from "@/trpc/server";

interface SubcategoryPageProps {
  params: Promise<{ category: string; subcategory: string }>;
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { category, subcategory } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({ category: subcategory })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductsListLoading />}>
        <ProductsList category={subcategory} />
      </Suspense>
    </HydrationBoundary>
  );
}
