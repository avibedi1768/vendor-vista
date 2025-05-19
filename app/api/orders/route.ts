import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface ProductProps {
  productId: string;
  quantity: number;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  subTotal: number;
}

interface OrderDetails {
  customerName: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
}

// for creating orders on checkout
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "unauthorised" }, { status: 401 });
    }

    const body = await req.json();

    const products: ProductProps[] = body.productData;
    const shopId: string = body.shopId;

    const vendor = await prisma.user.findUnique({ where: { id: shopId } });
    if (!vendor) {
      return NextResponse.json({ error: "vendor not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    let totalAmount = 0;
    const itemDetails = [];

    for (const product of products) {
      const productRecord = await prisma.product.findUnique({
        where: { id: product.productId },
      });

      if (!productRecord) {
        return NextResponse.json(
          { error: `product ${product.productId} not found` },
          { status: 404 }
        );
      }

      const itemTotal = productRecord.price.toNumber() * product.quantity;
      totalAmount += itemTotal;

      itemDetails.push({
        name: productRecord.name,
        price: productRecord.price.toNumber(),
        quantity: product.quantity,
        subTotal: itemTotal,
      });
    }

    const order = await prisma.order.create({
      data: { shopId, customerId: userId, totalAmount },
    });

    await Promise.all(
      products.map((product: ProductProps) =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.productId,
            quantity: product.quantity,
          },
        })
      )
    );

    // send email now using nodemailer
    const orderDetails = {
      customerName: `${user.firstName} ${user.lastName}`,
      shippingAddress: user.address,
      items: itemDetails,
      totalAmount,
    };

    const vendorEmail = vendor.email;
    const customerEmail = user.email;

    // send emails
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const generateHtml = (orderDetails: OrderDetails) => {
      const itemRows = orderDetails.items
        .map(
          (item) =>
            `<tr>
              <td>${item.name}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price}</td>
              <td>₹${item.subTotal}</td>
            </tr>`
        )
        .join("");

      return `
        <h2>Thank you for your order, ${orderDetails.customerName}!</h2>
        <p><strong>Shipping Address:</strong> ${orderDetails.shippingAddress}</p>
        <table border="1" cellpadding="8" cellspacing="0">
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>SubTotal</th></tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <h3>Total Amount: ₹${orderDetails.totalAmount}</h3>
      `;
    };

    // customer email
    await transporter.sendMail({
      from: `"VendorVista" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: "Order Confirmation",
      html: generateHtml(orderDetails),
    });

    // vendor email
    await transporter.sendMail({
      from: `"VendorVista" <${process.env.EMAIL_USER}>`,
      to: vendorEmail,
      subject: "New Order Received",
      html: generateHtml(orderDetails),
    });

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `something went wrong ${error}` },
      { status: 500 }
    );
  }
}

// for displaying past orders in user dashboard
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
      where: { customerId: userId },
      include: {
        shop: true,
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `something went wrong ${error}` },
      { status: 500 }
    );
  }
}
