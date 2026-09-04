import z from "zod";

export const registerBodySchema = z.object({
  email: z
    .string("Email must be a valid email address.")
    .email("Email must be a valid email address."),
  password: z
    .string("Password must be at least 8 characters.")
    .min(8, "Password must be at least 8 characters."),
  name: z.string("Name is required.").min(1, "Name is required."),
  code: z
    .string("An invitation code is required.")
    .min(1, "An invitation code is required."),
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
