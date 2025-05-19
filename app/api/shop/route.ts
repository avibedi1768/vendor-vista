import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // const { userId } = await auth();

  // if (!userId) {
  //   return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  // }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";

    if (!userId) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }

    const shop = await prisma.shop.findUnique({ where: { id: userId } });

    return NextResponse.json({ shop, status: 200 });
  } catch (error) {
    console.error("error getting shop", error);
    return NextResponse.json({ error: "error getting shop" }, { status: 500 });
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

    const address = formData.get("address") as string | null;
    const name = formData.get("name") as string | null;

    if (!address || !name) {
      return NextResponse.json(
        { error: "missing address or name" },
        { status: 400 }
      );
    }

    const updatedShop = await prisma.shop.update({
      where: { id: userId },
      data: { address, name },
    });

    console.log(updatedShop);

    return NextResponse.json({ updatedShop, status: 200 });
  } catch (error) {
    console.error("error updating shop", error);
    return NextResponse.json({ error: "error updating shop" }, { status: 500 });
  }
}
