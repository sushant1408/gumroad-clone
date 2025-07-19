import { Category } from "@/payload-types";
import configPromise from "@payload-config";
import { getPayload } from "payload";
import { ReactNode } from "react";

import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { SearchFilters } from "./search-filters";
import { CustomCategory } from "./types";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const payload = await getPayload({
    config: configPromise,
  });

  const data = await payload.find({
    collection: "categories",
    depth: 1, // populated subcategories
    pagination: false,
    where: {
      parent: { exists: false },
    },
    sort: "name"
  });

  const formattedData: CustomCategory[] = data.docs.map((doc) => ({
    ...doc,
    subcategories: (doc.subcategories?.docs ?? []).map((subdoc) => ({
      // because if 'depth: 1' we are confident 'subdoc' will be Category
      ...(subdoc as Category),
      subcategories: undefined,
    })),
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SearchFilters data={formattedData} />
      <div className="flex-1 bg-[#f4f4f0]">{children}</div>
      <Footer />
    </div>
  );
}
