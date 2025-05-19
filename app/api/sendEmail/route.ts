import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { orderDetails, vendorEmail, customerEmail } = body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // email to customer
    await transporter.sendMail({
      from: `"VendorVista" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Confirmation`,
      html: `
      <h2> Thank you for your order! </h2>
      <p> Here are the details of your order: </p>
      <pre>${JSON.stringify(orderDetails, null, 2)}</pre>`,
    });

    // email to vendor
    await transporter.sendMail({
      from: `"VendorVista" <${process.env.EMAIL_USER}>`,
      to: vendorEmail,
      subject: `New Order Received`,
      html: `
      <h2>You have a new order!</h2>
      <pre>${JSON.stringify(orderDetails, null, 2)}</pre>
      `,
    });

    return NextResponse.json({ success: true, status: 200 });
  } catch (error) {
    console.error("email error: ", error);
    return NextResponse.json({ success: false, error });
  }
}
