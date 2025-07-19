import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category } from "@/payload-types";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.find({
      collection: "categories",
      depth: 1, // populated subcategories
      pagination: false,
      where: {
        parent: { exists: false },
      },
      sort: "name",
    });

    const formattedData = data.docs.map((doc) => ({
      ...doc,
      subcategories: (doc.subcategories?.docs ?? []).map((subdoc) => ({
        // because if 'depth: 1' we are confident 'subdoc' will be Category
        ...(subdoc as Category),
        subcategories: undefined,
      })),
    }));

    return formattedData;
  }),
});
