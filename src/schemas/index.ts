import { z } from "zod";

class Schemas {
  [key: string]: Function;
  signup() {
    return z
      .object({
        name: z.string().min(2).max(50),
        email: z.string().email(),
        password: z.string().min(6).max(16),
        confirmPassword: z.string(),
      })
      .refine(({ password, confirmPassword }) => password === confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
  }
}

export default new Schemas();
