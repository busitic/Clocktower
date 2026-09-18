import { z } from "zod";

/*
  SHARED VALIDATION
  ------------------
  These schemas run on BOTH the client (via react-hook-form, for instant
  feedback) and the server (in the register route and the authorize()
  callback above). Writing the rule once and using it twice means the
  client and server can never quietly disagree about what's valid.
*/

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    role: z.enum(["STUDENT", "LANDLORD"]), // never allow ADMIN from a public form
    university: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;