"use client";

import { useQuery } from "@tanstack/react-query";
import { ShoppingCartIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";

const CheckoutButton = dynamic(
  () =>
    import("@/modules/checkout/ui/components/checkout-button").then(
      (mod) => mod.CheckoutButton
    ),
  {
    ssr: false,
    loading: () => (
      <Button disabled className="bg-white">
        <ShoppingCartIcon className="text-black" />
      </Button>
    ),
  }
);

interface NavbarProps {
  slug: string;
}

const Navbar = ({ slug }: NavbarProps) => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.tenants.getOne.queryOptions({ slug }));

  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <Link href={`/tenants/${slug}`} className="flex items-center gap-2">
          {data?.image?.url && (
            <Image
              alt={slug}
              src={data?.image?.url || ""}
              width={32}
              height={32}
              className="rounded-full shrink-0 border size-[32px]"
            />
          )}
          <p className="text-xl">{data?.name}</p>
        </Link>
        <CheckoutButton hideIfEmpty tenantSlug={slug} />
      </div>
    </nav>
  );
};

const NavbarLoading = () => {
  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <div />
        <Button disabled className="bg-white">
          <ShoppingCartIcon className="text-black" />
        </Button>
      </div>
    </nav>
  );
};

export { Navbar, NavbarLoading };
