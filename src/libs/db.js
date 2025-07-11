import { PrismaClient } from "../generated/prisma/index.js";
// manage a global instance of the Prisma Client, ensuring that in development mode, the database connection is reused instead of creating a new instance each time.

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma || new PrismaClient();

if(process.env.NODE_ENV !== "production") 
    globalForPrisma.prisma = db
//This ensures that in non-production environments (development or test), the PrismaClient instance is stored globally, preventing redundant connections to the database.

