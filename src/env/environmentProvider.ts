import { z } from "zod";

const envObj = z.object({
  DATABASE_URL: z.string().trim().min(1),
  SESSION_SECRET: z.string().trim().min(6),
});

export const applicationBootEnv = envObj.parse(process.env);
