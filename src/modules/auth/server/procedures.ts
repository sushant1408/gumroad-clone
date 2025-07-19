import { TRPCError } from "@trpc/server";
import { cookies as nextCookies, headers as nextHeaders } from "next/headers";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { AUTH_COOKIE } from "../constants";
import { loginSchema, registerSchema } from "../schemas";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await nextHeaders();

    const session = await ctx.db.auth({ headers });

    return session;
  }),
  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });

      const existingUser = existingData.docs[0];

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already taken.",
        });
      }

      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          password: input.password, // this will be hashed
          username: input.username,
        },
      });

      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password, // this will be hashed
        },
      });

      if (!data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Failed to login" });
      }

      const cookies = await nextCookies();
      cookies.set({
        name: AUTH_COOKIE,
        value: data.token!,
        httpOnly: true,
        path: "/",
      });

      return data;
    }),
  login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const data = await ctx.db.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password, // this will be hashed
      },
    });

    if (!data) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Failed to login" });
    }

    const cookies = await nextCookies();
    cookies.set({
      name: AUTH_COOKIE,
      value: data.token!,
      httpOnly: true,
      path: "/",
    });

    return data;
  }),
  logout: baseProcedure.mutation(async () => {
    const cookies = await nextCookies();
    cookies.delete(AUTH_COOKIE);
  }),
});
