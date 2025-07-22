import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { DEFAULT_LIMIT } from "@/lib/constants";
import { LibraryView } from "@/modules/library/ui/views/library-view";
import { getQueryClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.library.getMany.infiniteQueryOptions({
      limit: DEFAULT_LIMIT,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LibraryView />
    </HydrationBoundary>
  );
}
