import Link from "next/link";

import { CustomCategory } from "../types";

interface SubcategoryMenuProps {
  open: boolean;
  category: CustomCategory;
  position: { top: number; left: number };
}

const SubcategoryMenu = ({
  category,
  open,
  position,
}: SubcategoryMenuProps) => {
  if (
    !open ||
    !category.subcategories ||
    category.subcategories?.length === 0
  ) {
    return null;
  }

  const backgroundColor = category.color || "#f5f5f5";

  return (
    <div
      className="fixed z-100"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* invisible bridge to maintain hover */}
      <div className="h-3 w-60" />
      <div
        className="w-60 text-black rounded-md overflow-hidden border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-x-[2px] -translate-y-[2px]"
        style={{ backgroundColor }}
      >
        <div>
          {category.subcategories?.map((subcategory) => (
            <Link
              key={subcategory.slug}
              href="#"
              className="w-full text-left p-4 hover:bg-black hover:text-white flex justify-between items-center underline font-medium cursor-pointer"
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export { SubcategoryMenu };
