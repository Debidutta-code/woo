import config from "./env.configs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/generated/prisma/client";


const postgresUrl = config.postgresUrl;
if (!postgresUrl) {
  throw new Error("DATABASE_URL is required to initialize PrismaClient");
}

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: postgresUrl }),
});

export async function connectPostgres() {
  try {
    await prisma.$connect();
    console.log("✅ Prisma Db connected successfully");
  } catch (error) {
    console.error("❌ Error connecting Postgres:", error);
  }
}
