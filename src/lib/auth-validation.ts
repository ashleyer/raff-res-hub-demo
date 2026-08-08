import { z } from "zod";

/* Shared validation for the resident sign-in and registration forms. Errors are
   returned per field so each input can show its own inline message. */

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(255, "That email address is too long.")
    .email("Enter a valid email address."),
  unit: z
    .string()
    .trim()
    .min(1, "Enter your residence number.")
    .max(20, "Enter the residence number only, for example 22H."),
  password: z.string().min(1, "Enter your password or the residence passcode.").max(128),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter the name for your household.")
      .max(100, "Keep the name under 100 characters."),
    email: z
      .string()
      .trim()
      .min(1, "Enter your email address.")
      .max(255, "That email address is too long.")
      .email("Enter a valid email address."),
    unit: z
      .string()
      .trim()
      .min(1, "Enter your residence number.")
      .max(20, "Enter the residence number only, for example 22H."),
    phone: z
      .string()
      .trim()
      .min(1, "Enter a contact number for your household profile.")
      .refine(
        (v) => v.replace(/\D/g, "").length >= 7,
        "Enter a contact number of at least seven digits.",
      )
      .refine((v) => v.replace(/\D/g, "").length <= 15, "That contact number is too long."),
    password: z
      .string()
      .min(8, "Choose a password of at least eight characters.")
      .max(128, "Choose a password under 128 characters."),
    confirm: z.string().min(1, "Confirm your password."),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "The two passwords do not match.",
  });

export const newPasswordSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Enter the reset code sent to you.")
      .max(12, "That reset code is too long."),
    password: z
      .string()
      .min(8, "Choose a password of at least eight characters.")
      .max(128, "Choose a password under 128 characters.")
      .refine((v) => /[A-Za-z]/.test(v), "Include at least one letter.")
      .refine((v) => /\d|[^A-Za-z0-9]/.test(v), "Include at least one number or symbol."),
    confirm: z.string().min(1, "Confirm your new password."),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "The two passwords do not match.",
  });

export type FieldErrors = Record<string, string>;

/** Validate a value against a schema and flatten issues into per-field messages. */
export function validate<T extends z.ZodType>(schema: T, value: unknown): FieldErrors {
  const result = schema.safeParse(value);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
