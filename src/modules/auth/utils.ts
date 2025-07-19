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
  });
}
