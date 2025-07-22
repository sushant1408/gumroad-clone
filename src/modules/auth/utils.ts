import { cookies as nextCookies } from "next/headers";

interface Props {
  prefix: string;
  value: string;
}

export async function generateAuthCookie({ prefix, value }: Props) {
  const cookies = await nextCookies();
  cookies.set({
    name: `${prefix}-token`,
    value: value,
    httpOnly: true,
    path: "/",
    // This enables the cookie auth on localhost
    // But it will not work with subdomains turned on
    ...(process.env.NODE_ENV !== "development" && {
      sameSite: "none",
      domain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
      secure: true,
    }),
  });
}
