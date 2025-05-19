// https://github.com/prisma/prisma-examples/blob/latest/orm/clerk-nextjs/src/lib/prisma.ts

// import { PrismaClient } from "@prisma/client";

// const prismaClientSingleton = () => {
//   return new PrismaClient();
// };

// type prismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// // use existing connection of PrismaClient, or make a new one
// const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// export default prisma;

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }

import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
