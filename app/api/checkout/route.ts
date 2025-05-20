import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // console.log("inside checkout get api");

    const { productIds, shopId } = await req.json();

    if (!productIds || !shopId) {
      return NextResponse.json(
        { error: "missing product ids or shop id" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.findUnique({ where: { id: shopId } });

    if (!shop) {
      return NextResponse.json({ error: "shop not found" }, { status: 404 });
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "no product ids" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    return NextResponse.json({ products, shop }, { status: 200 });
  } catch (error) {
    console.log("error getting products for checkout", error);
    return NextResponse.json(
      { error: "error getting products for checkout" },
      { status: 500 }
    );
  }
}

// send vendor info
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    const { shopId } = await req.json();

    if (!shopId) {
      return NextResponse.json({ error: "missing shop id" }, { status: 400 });
    }

    const vendor = await prisma.user.findUnique({ where: { id: shopId } });
    if (!vendor) {
      return NextResponse.json({ error: "vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ vendor }, { status: 200 });
  } catch (error) {
    // console.error("error getting vendor info", error);
    return NextResponse.json(
      { error: `error getting vendor info ${error}` },
      { status: 500 }
    );
  }
}
