"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { LoaderIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";

export default function StripeVerifyPage() {
  const trpc = useTRPC();
  const { mutate } = useMutation(
    trpc.checkout.varify.mutationOptions({
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: () => {
        window.location.href = "/";
      },
    })
  );

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  );
}
