import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ReactNode, Suspense } from "react";

import { Footer } from "@/modules/tenants/ui/components/footer";
import { Navbar, NavbarLoading } from "@/modules/tenants/ui/components/navbar";
import { getQueryClient, trpc } from "@/trpc/server";

interface TenantSlugLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function TenantSlugLayout({
  children,
  params,
}: TenantSlugLayoutProps) {
  const { slug } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({ slug }));

  return (
    <div className="min-h-screen bg-[#f4f4f0] flex flex-col">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NavbarLoading />}>
          <Navbar slug={slug} />
        </Suspense>
      </HydrationBoundary>
      <div className="flex-1">
        <div className="max-w-(--breakpoint-xl) mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
