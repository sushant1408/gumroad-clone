import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

import { getQueryClient, trpc } from "@/trpc/server";
import {
  ProductView,
  ProductViewLoading,
} from "@/modules/library/ui/views/product-view";

interface LibraryProductPageProps {
  params: Promise<{ productId: string }>;
}

export default async function LibraryProductPage({
  params,
}: LibraryProductPageProps) {
  const { productId } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.library.getOne.queryOptions({ productId })
  );
  void queryClient.prefetchQuery(
    trpc.reviews.getOne.queryOptions({ productId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductViewLoading />}>
        <ProductView productId={productId} />
      </Suspense>
    </HydrationBoundary>
  );
}
