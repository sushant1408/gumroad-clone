import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  tenantSlug: string;
  tenantImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
}

const ProductCard = ({
  tenantSlug,
  id,
  name,
  reviewCount,
  reviewRating,
  tenantImageUrl,
  imageUrl,
}: ProductCardProps) => {
  return (
    <Link prefetch href={`/library/${id}`}>
      <div className="border rounded-md bg-white overflow-hidden h-full flex flex-col hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
        <div className="relative aspect-square">
          <Image
            alt={name}
            fill
            className="object-cover"
            src={imageUrl || "/placeholder.png"}
          />
        </div>
        <div className="p-4 border-t flex flex-col gap-3 flex-1">
          <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
          <div className="flex items-center gap-2">
            {tenantImageUrl && (
              <Image
                alt={tenantSlug}
                src={tenantImageUrl}
                width={16}
                height={16}
                className="rounded-full shrink-0 border size-[16px]"
              />
            )}
            <p className="text-sm underline font-medium">{tenantSlug}</p>
          </div>
          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="fill-black size-3.5" />
              <p className="text-sm font-medium">
                {reviewRating} ({reviewCount})
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const ProductCardLoading = () => {
  return (
    <div className="w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse"></div>
  );
};

export { ProductCard, ProductCardLoading };
