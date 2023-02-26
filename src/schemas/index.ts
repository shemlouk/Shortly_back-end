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
  signin() {
    return z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });
  }
  urls() {
    return z.object({
      url: z.string().url(),
    });
  }
}

export default new Schemas();
