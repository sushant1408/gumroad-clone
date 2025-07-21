import type { Sort, Where } from "payload";
import z from "zod";
import { headers as nextHeaders } from "next/headers";

import { DEFAULT_LIMIT } from "@/lib/constants";
import { Category, Media, Tenant } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { sortValues } from "../search-params";

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSlug: z.string().nullable().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const where: Where = {};
      let sort: Sort = "-createdAt";

      if (input.sort === "trending") {
        sort = "-createdAt";
      } else if (input.sort === "hot_and_new") {
        sort = "+createdAt";
      } else if (input.sort === "curated") {
        sort = "-createdAt";
      }

      if (input.minPrice && input.maxPrice) {
        where["price"] = {
          greater_than_equal: input.minPrice,
          less_than_equal: input.maxPrice,
        };
      } else if (input.minPrice) {
        where["price"] = {
          greater_than_equal: input.minPrice,
        };
      } else if (input.maxPrice) {
        where["price"] = {
          less_than_equal: input.maxPrice,
        };
      }

      if (input.tenantSlug) {
        where["tenant.slug"] = {
          equals: input.tenantSlug,
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

      if (input.tags && input.tags.length > 0) {
        where["tags.name"] = {
          in: input.tags,
        };
      }

      const data = await ctx.db.find({
        collection: "products",
        depth: 2, // populated category, image, tenant, tenant.image
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
      });

      const dataWithSummarizedReviews = await Promise.all(
        data.docs.map(async (doc) => {
          const reviewsData = await ctx.db.find({
            collection: "reviews",
            pagination: false,
            where: {
              product: {
                equals: doc.id,
              },
            },
          });

          return {
            ...doc,
            reviewCount: reviewsData.totalDocs,
            reviewRating:
              reviewsData.docs.length === 0
                ? 0
                : reviewsData.docs.reduce(
                    (acc, review) => acc + review.rating,
                    0
                  ) / reviewsData.totalDocs,
          };
        })
      );

      return {
        ...data,
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const headers = await nextHeaders();
      const session = await ctx.db.auth({ headers });

      const product = await ctx.db.findByID({
        collection: "products",
        id: input.id,
        depth: 2,
      });

      let isPurchased = false;

      if (session.user) {
        const orderData = await ctx.db.find({
          collection: "orders",
          pagination: false,
          limit: 1,
          where: {
            and: [
              {
                product: {
                  equals: input.id,
                },
              },
              {
                user: {
                  equals: session.user.id,
                },
              },
            ],
          },
        });

        isPurchased = !!orderData.docs[0];
      }

      const reviewsData = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        where: {
          product: {
            equals: input.id,
          },
        },
      });

      const reviewRating =
        reviewsData.docs.length === 0
          ? 0
          : reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) /
            reviewsData.totalDocs;

      const ratingDistribution: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      if (reviewsData.totalDocs > 0) {
        reviewsData.docs.forEach((review) => {
          const rating = review.rating;

          if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
          }
        });

        Object.keys(ratingDistribution).forEach((key) => {
          const rating = Number(key);
          const count = ratingDistribution[rating] || 0;

          ratingDistribution[rating] = Math.round(
            (count / reviewsData.totalDocs) * 100
          );
        });
      }

      return {
        ...product,
        image: product.image as Media | null,
        tenant: product.tenant as Tenant & { image: Media | null },
        isPurchased,
        reviewCount: reviewsData.totalDocs,
        reviewRating,
        ratingDistribution,
      };
    }),
});
