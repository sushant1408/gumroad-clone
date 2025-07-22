import { redirect } from "next/navigation";

import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { caller } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const session = await caller.auth.session();

  if (session.user) {
    redirect("/");
  }

  return <SignInView />;
}
