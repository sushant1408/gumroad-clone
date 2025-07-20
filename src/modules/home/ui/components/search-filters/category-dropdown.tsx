"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CategoriesGetManyOutputSingle } from "@/modules/categories/types";
import { SubcategoryMenu } from "./subcategory-menu";

interface CategoryDropdownProps {
  category: CategoriesGetManyOutputSingle;
  isActive?: boolean;
  isNavigationHovered?: boolean;
}

const CategoryDropdown = ({
  category,
  isActive,
  isNavigationHovered,
}: CategoryDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const onMouseEnter = () => {
    if (category.subcategories) {
      setIsOpen(true);
    }
  };

  const onMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative">
        <Link href={`/${category.slug === "all" ? "" : category.slug}`}>
          <Button
            variant="elevated"
            className={cn(
              "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black",
              isActive && !isNavigationHovered && "bg-white border-primary",
              isOpen &&
                "bg-white border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[4px] -translate-y-[4px]"
            )}
          >
            {category.name}
          </Button>
        </Link>

        {/* dropdown arrow/triangle */}
        {category.subcategories && category.subcategories?.length > 0 && (
          <div
            className={cn(
              "opacity-0 absolute -bottom-3 w-0 h-0 border-x-[10px] border-x-transparent border-b-[10px] border-b-black left-1/2 -translate-x-1/2",
              isOpen && "opacity-100"
            )}
          />
        )}
      </div>

      <SubcategoryMenu category={category} open={isOpen} />
    </div>
  );
};

export { CategoryDropdown };
