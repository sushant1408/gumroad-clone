import z from "zod";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(63, "Username must be less than 63 characters")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Username can only contain lowercase letters, numbers and hyphens. It must start and end with a letter or a number."
    )
    .refine(
      (value) => !value.includes("--"),
      "Username cannot contain consecutive hyphens"
    )
    .transform((value) => value.toLowerCase()),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
