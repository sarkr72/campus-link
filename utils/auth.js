import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // Import Prisma client instance

export const loginUser = async (email) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};