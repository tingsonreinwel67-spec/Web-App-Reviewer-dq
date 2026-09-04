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

export const forgotPasswordSchema = z.object({
  email: z
    .string("Email must be a valid email address.")
    .email("Email must be a valid email address."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string("A reset token is required.").min(1, "A reset token is required."),
  password: z
    .string("Password must be at least 8 characters.")
    .min(8, "Password must be at least 8 characters."),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
