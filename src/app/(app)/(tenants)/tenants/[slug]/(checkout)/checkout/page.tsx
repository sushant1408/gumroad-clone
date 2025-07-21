import { CheckoutView } from "@/modules/checkout/ui/views/checkout-view";

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;

  return <CheckoutView tenantSlug={slug} />;
}
