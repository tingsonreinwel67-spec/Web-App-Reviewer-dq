import z from "zod";

export const registerBodySchema = z.object({
  email: z.string().email("Email must be a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  name: z.string().min(1, "Name is required."),
});

export type RegisterInput = z.infer<typeof registerBodySchema>;
