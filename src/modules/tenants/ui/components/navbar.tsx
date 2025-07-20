"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

import { useTRPC } from "@/trpc/client";

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
      </div>
    </nav>
  );
};

const NavbarLoading = () => {
  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <div />
      </div>
    </nav>
  );
};

export { Navbar, NavbarLoading };
