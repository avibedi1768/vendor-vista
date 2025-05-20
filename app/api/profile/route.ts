import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  // console.log("userId", userId);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return NextResponse.json({ user, status: 200 });
  } catch (error) {
    // console.error("error getting user", error);
    return NextResponse.json(
      { error: `error getting user ${error}` },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  // console.log("checking user");

  if (!userId) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  // console.log("checked user");

  try {
    const formData = await req.formData();

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const address = formData.get("address") as string;

    if (!firstName || !lastName || !address) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName, address },
    });

    // console.log(updatedUser);

    return NextResponse.json({ updatedUser, status: 200 });
  } catch (error) {
    // console.error("error updating user", error);
    return NextResponse.json(
      { error: `error updating user ${error}` },
      { status: 500 }
    );
  }
}
