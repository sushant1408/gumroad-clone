import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface CategoriesSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
}

const CategoriesSidebar = ({
  data,
  onOpenChange,
  open,
}: CategoriesSidebarProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="p-0 transition-none"
        style={{ backgroundColor: "white" }}
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            Categories
          </SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export { CategoriesSidebar };
