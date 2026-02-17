import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  // Prisma 7: aquí NO va provider, solo url (y opcionalmente shadowDatabaseUrl)
  datasource: {
    url: process.env.DATABASE_URL,
    // shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL, // opcional
  },
});
