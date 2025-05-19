import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    const orders = await prisma.order.findMany({
      where: {
        shopId: userId,
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `something went wrong ${error}` },
      { status: 500 }
    );
  }
}

//change order status
export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    const { orderId } = await req.json();

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "COMPLETED",
      },
    });

    return NextResponse.json(
      { message: "order status changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `something went wrong while changing status of order ${error}` },
      { status: 500 }
    );
  }
}
