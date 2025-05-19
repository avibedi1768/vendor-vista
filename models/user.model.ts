import prisma from "@/lib/prisma";

interface CreateUserProps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const createUser = async (userData: CreateUserProps) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log("user already exists");
      return existingUser;
    }

    const newUser = await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    });

    return newUser;
  } catch (err) {
    console.error("Error creating user:", err);
    throw new Error("Database insertion failed");
  }
};
