"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { InboxIcon, LoaderIcon } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { useTRPC } from "@/trpc/client";
import { useCart } from "../../hooks/use-cart";
import { useCheckoutStates } from "../../hooks/use-checkout-states";
import { CheckoutItem } from "../components/checkout-item";
import { CheckoutSidebar } from "../components/checkout-sidebar";
import { useRouter } from "next/navigation";

interface CheckoutViewProps {
  tenantSlug: string;
}

const CheckoutView = ({ tenantSlug }: CheckoutViewProps) => {
  const router = useRouter();

  const { productIds, clearCart, removeProduct } = useCart(tenantSlug);
  const [checkoutStates, setCheckoutStates] = useCheckoutStates();

  const trpc = useTRPC();
  const { data, error, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({ ids: productIds })
  );

  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        setCheckoutStates({
          cancel: false,
          success: false,
        });
      },
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: (error) => {
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/sign-in");
        }
        toast.error(error.message);
      },
    })
  );

  useEffect(() => {
    if (!error) return;

    if (error.data?.code === "NOT_FOUND") {
      clearCart();
      toast.warning("Invalid products found. Cart cleared.");
    }
  }, [error, clearCart]);

  useEffect(() => {
    if (checkoutStates.success) {
      setCheckoutStates({
        cancel: false,
        success: false,
      });
      clearCart();
      router.push("/products");
    }
  }, [checkoutStates.success, setCheckoutStates, clearCart, router]);

  if (isLoading) {
    return (
      <div className="lg:p-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <LoaderIcon className="text-muted-foreground animate-spin" />
        </div>
      </div>
    );
  }

  if (data?.totalDocs === 0) {
    return (
      <div className="lg:p-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <InboxIcon />
          <p className="text-base font-medium">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:p-16 pt-4 px-4 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="border rounded-md overflow-hidden bg-white">
            {data?.docs.map((product, index, array) => (
              <CheckoutItem
                key={product.id}
                isLast={index === array.length - 1}
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`/tenants/${tenantSlug}/products/${product.id}`}
                tenantUrl={`/tenants/${tenantSlug}`}
                tenantName={product.tenant.name}
                price={product.price}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <CheckoutSidebar
            total={data?.tatalPrice || 0}
            onPurchase={() => purchase.mutate({ productIds, tenantSlug })}
            isCanceled={checkoutStates.cancel}
            isPending={purchase.isPending}
          />
        </div>
      </div>
    </div>
  );
};

export { CheckoutView };
