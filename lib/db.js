// lib/db.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Optional: logs SQL queries
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
