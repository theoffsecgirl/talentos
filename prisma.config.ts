import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Para CLI/migrations usa DIRECT (sin pooler)
    // Fallback a DATABASE_URL si no existe (para builds en Vercel)
    url: env("DIRECT_URL") || env("DATABASE_URL"),
  },
});
