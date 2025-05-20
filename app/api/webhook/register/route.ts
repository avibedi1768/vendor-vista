import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) throw new Error("missing WEBHOOK_SECRET in env");

  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed", err);
    return new Response("Invalid webhook signature", { status: 400 });
  }

  const eventType = evt.type;

  //logs
  if (eventType === "user.created") {
    try {
      const {
        id,
        email_addresses,
        primary_email_address_id,
        first_name,
        last_name,
      } = evt.data;

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      if (!primaryEmail) {
        return new Response("no primary email found", { status: 400 });
      }

      // check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: primaryEmail.email_address },
      });

      if (existingUser) {
        console.log("user already exists");
        return new Response("user already exists", { status: 200 });
      }

      const newUser = await prisma.user.create({
        data: {
          id,
          email: primaryEmail.email_address,
          firstName: first_name ?? "",
          lastName: last_name ?? "",
        },
      });

      console.log("user created", newUser);
    } catch (error) {
      return new Response(`error creating user in database: ${error}`, {
        status: 500,
      });
    }
  }

  return new Response("webhook received successfully", { status: 200 });
}
