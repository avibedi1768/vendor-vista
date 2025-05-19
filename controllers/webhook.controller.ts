import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser } from "@/models/user.model";
// import { Role } from "@prisma/client";

export const handleWebhookEvent = async (evt: WebhookEvent) => {
  // const { id } = evt.data;
  const eventType = evt.type;

  //logs
  if (eventType === "user.created") {
    try {
      const {
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

      // create a new user
      const newUser = await createUser({
        id: evt.data.id!,
        email: primaryEmail.email_address,
        firstName: first_name ?? "",
        lastName: last_name ?? "",
      });

      console.log("user created", newUser);
    } catch (error) {
      return new Response("error creating user in database", { status: 400 });
    }
  }

  return new Response("webhook received successfull", { status: 200 });
};

/*
export const handleWebhookEvent = async (
  evt: WebhookEvent
): Promise<Response> => {
  const eventType = evt.type;

  if (eventType === "user.created") {
    try {
      const {
        id,
        email_addresses,
        primary_email_address_id,
        first_name,
        last_name,
        image_url,
      } = evt.data;

      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id
      );

      if (!primaryEmail) {
        return new Response("primary email not found", { status: 400 });
      }

      const roleFromClerk = evt.data.public_metadata?.role;
      const role: Role = roleFromClerk === "VENDOR" ? "VENDOR" : "CUSTOMER";

      const newUser = await createUser({
        id,
        email: primaryEmail.email_address,
        firstName: first_name ?? "",
        lastName: last_name ?? "",
        role,
        address: "",
        avatar: image_url ?? null,
      });

      console.log("user created", newUser);
    } catch (err) {
      console.error("error creating user", err);
      return new Response("database error", { status: 500 });
    }
  }

  return new Response("webhook processed", { status: 200 });
};
*/
