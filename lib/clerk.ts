"use server";

import { clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const setUserRole = async (userId: string, role: "CUSTOMER" | "VENDOR") => {
  try {
    // update clerk publicMetadata
    await (
      await clerkClient()
    ).users.updateUser(userId, {
      publicMetadata: { role },
    });

    // update role in neondb
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { role },
    // });

    // let userExists = false;

    // for (let i = 1; i <= 5; i++) {
    //   const user = await prisma.user.findUnique({ where: { id: userId } });

    //   if (user) {
    //     userExists = true;
    //     break;
    //   } else {
    //     await new Promise((res) => setTimeout(res, 500)); // wait 0.5sec
    //   }
    // }

    // if (!userExists) {
    //   throw new Error("user not created in neondb ie prisma");
    // }

    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    // create shop in neondb if role = bendor
    if (role === "VENDOR") {
      const existingShop = await prisma.shop.findFirst({
        where: { id: userId },
      });

      if (!existingShop) {
        await prisma.shop.create({
          data: {
            id: userId,
          },
        });
      }
    }
  } catch (error) {
    console.error("failed to role in clerk or db, or create shop", error);
    throw new Error("could not set user role");
  }
};

export { setUserRole };
