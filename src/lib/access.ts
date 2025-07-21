import { ClientUser } from "payload";

import type { User } from "@/payload-types";

const isSuperAdmin = (user: User | ClientUser | null) =>
  Boolean(user?.roles?.includes("super-admin"));

export { isSuperAdmin };
