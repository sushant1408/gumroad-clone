import type { Where } from "payload";
import z from "zod";

import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: Where = {};

      if (input.minPrice) {
        where["price"] = {
          greater_than_equal: input.minPrice,
        };
      }

      if (input.maxPrice) {
        where["price"] = {
          less_than_equal: input.maxPrice,
        };
      }

      if (input.category) {
        const categoriesData = await ctx.db.find({
          collection: "categories",
          depth: 1,
          limit: 1,
          pagination: false,
          where: {
            slug: {
              equals: input.category,
            },
          },
        });

        const formattedData = categoriesData.docs.map((doc) => ({
          ...doc,
          subcategories: (doc.subcategories?.docs ?? []).map((subdoc) => ({
            // because if 'depth: 1' we are confident 'subdoc' will be Category
            ...(subdoc as Category),
            subcategories: undefined,
          })),
        }));

        const subcategorySlugs = [];
        const parentCategory = formattedData[0];

        if (parentCategory) {
          subcategorySlugs.push(
            ...parentCategory.subcategories.map(
              (subcategory) => subcategory.slug
            )
          );

          where["category.slug"] = {
            in: [parentCategory.slug, ...subcategorySlugs],
          };
        }
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 1, // populated category, image
        where,
      });

      return data;
    }),
});
