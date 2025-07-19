"use client";

import { ListFilterIcon, SearchIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomCategory } from "../types";
import { CategoriesSidebar } from "./categories-sidebar";

interface SearchInputProps {
  disabled?: boolean;
  data: CustomCategory[];
}

const SearchInput = ({ disabled, data }: SearchInputProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 w-full">
      <CategoriesSidebar
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        data={data}
      />

      <div className="relative w-full">
        <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-4 text-neutral-400" />
        <Input
          className="pl-8"
          placeholder="Search products"
          disabled={disabled}
        />
      </div>

      <Button
        variant="elevated"
        className="size-12 shrink-0 flex lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
      >
        <ListFilterIcon />
      </Button>
    </div>
  );
};

export { SearchInput };
