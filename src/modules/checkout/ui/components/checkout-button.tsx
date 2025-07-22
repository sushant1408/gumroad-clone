import { ShoppingCartIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn, generateTenantURL } from "@/lib/utils";
import { useCart } from "../../hooks/use-cart";

interface CheckoutButtonProps {
  className?: string;
  hideIfEmpty?: boolean;
  tenantSlug: string;
}

const CheckoutButton = ({
  tenantSlug,
  className,
  hideIfEmpty,
}: CheckoutButtonProps) => {
  const { totalItems } = useCart(tenantSlug);

  if (hideIfEmpty && totalItems === 0) {
    return null;
  }

  return (
    <Button asChild variant="elevated" className={cn("bg-white", className)}>
      <Link href={`${generateTenantURL(tenantSlug)}/checkout`}>
        <ShoppingCartIcon /> {totalItems > 0 ? totalItems : ""}
      </Link>
    </Button>
  );
};

export { CheckoutButton };
