import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";

interface SearchInputProps {
  disabled?: boolean;
}

const SearchInput = ({ disabled }: SearchInputProps) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="relative w-full">
        <SearchIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-4 text-neutral-400" />
        <Input className="pl-8" placeholder="Search products" disabled={disabled} />
      </div>
    </div>
  );
};

export { SearchInput };
