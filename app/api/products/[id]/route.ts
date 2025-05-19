import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
// import { stat } from "fs";
import { NextRequest, NextResponse } from "next/server";

// delete product
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const productId = url.pathname.split("/").pop();
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }

    if (product.shopId !== userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({
      message: "product deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error("error deleting product", error);

    return NextResponse.json(
      { error: "failed to delete product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const productId = url.pathname.split("/").pop();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "product not found" }, { status: 404 });
    }

    if (product.shopId !== userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // const { stock } = await req.json();
    const formData = await req.formData();
    const stock = parseInt(formData.get("stocks") as string);

    await prisma.product.update({
      where: { id: productId },
      data: { stock },
    });

    return NextResponse.json({
      message: "stocks updated successfully",
      status: 200,
    });
  } catch (error) {
    console.error("error updating stocks of product", error);

    return NextResponse.json(
      { error: "failed to update stocks of product" },
      { status: 500 }
    );
  }
}
