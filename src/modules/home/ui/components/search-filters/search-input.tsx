"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookmarkCheckIcon,
  ListFilterIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductFilters } from "@/modules/products/hooks/use-product-filters";
import { useTRPC } from "@/trpc/client";
import { CategoriesSidebar } from "./categories-sidebar";

interface SearchInputProps {
  disabled?: boolean;
}

const SearchInput = ({ disabled }: SearchInputProps) => {
  const [filters, setFilters] = useProductFilters();
  const [searchValue, setSearchValue] = useState(filters.search);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const trpc = useTRPC();
  const session = useQuery(trpc.auth.session.queryOptions());

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters({ search: searchValue });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchValue, setFilters]);

  return (
    <div className="flex items-center gap-2 w-full">
      <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

      <div className="relative w-full">
        <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-4 text-neutral-400" />
        <Input
          className="pl-8 pr-11"
          placeholder="Search products"
          disabled={disabled}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        {filters.search && (
          <Button
            variant="ghost"
            className="absolute top-1/2 right-1 -translate-y-1/2 border-none h-10"
            onClick={() => setSearchValue("")}
          >
            <XIcon className="size-4" />
          </Button>
        )}
      </div>

      <Button
        variant="elevated"
        className="size-12 shrink-0 flex lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <ListFilterIcon />
      </Button>

      {session.data?.user && (
        <Button variant="elevated" asChild>
          <Link href="/library">
            <BookmarkCheckIcon />
            Library
          </Link>
        </Button>
      )}
    </div>
  );
};

const SearchInputLoading = () => {
  return (
    <div className="relative w-full">
      <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-4 text-neutral-400" />
      <Input disabled className="pl-8" placeholder="Search products" />
    </div>
  );
};

export { SearchInput, SearchInputLoading };
