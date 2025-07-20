"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { InboxIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/lib/constants";
import { useTRPC } from "@/trpc/client";
import { useProductFilters } from "../../hooks/use-product-filters";
import { ProductCard, ProductCardLoading } from "./product-card";
import { cn } from "@/lib/utils";

interface ProductsListProps {
  category?: string;
  tenantSlug?: string;
  narrowView?: boolean;
}

const ProductsList = ({
  category,
  tenantSlug,
  narrowView,
}: ProductsListProps) => {
  const [filters] = useProductFilters();

  const trpc = useTRPC();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
      trpc.products.getMany.infiniteQueryOptions(
        { ...filters, category, tenantSlug, limit: DEFAULT_LIMIT },
        {
          getNextPageParam: (lastPage) =>
            lastPage.docs.length > 0 ? lastPage.nextPage : undefined,
        }
      )
    );

  if (data?.pages?.[0]?.docs.length === 0) {
    return (
      <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
        <InboxIcon />
        <p className="text-base font-medium">No products found</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4",
          narrowView && "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
        )}
      >
        {data?.pages
          .flatMap((page) => page.docs)
          .map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              imageUrl={product.image?.url}
              tenantSlug={product.tenant?.slug}
              price={product.price}
              reviewCount={5}
              reviewRating={3}
              tenantImageUrl={product.tenant?.image?.url}
            />
          ))}
      </div>
      <div className="flex justify-center p-8">
        {hasNextPage && (
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="font-medium text-base disabled:opacity-50 bg-white"
            variant="elevated"
          >
            Load more
          </Button>
        )}
      </div>
    </>
  );
};

const ProductsListLoading = ({ narrowView }: { narrowView?: boolean }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4",
        narrowView && "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3"
      )}
    >
      {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
        <ProductCardLoading key={index} />
      ))}
    </div>
  );
};

export { ProductsList, ProductsListLoading };
