import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

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

// upload on cloudinary:
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  [key: string]: string | number | boolean | undefined;
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

    // first avatar update
    const file = formData.get("file") as File | null;
    let avatar: string | null = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "vendor-vista-users" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadResult);
            }
          );

          uploadStream.end(buffer);
        }
      );
      avatar = result.public_id;
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const address = formData.get("address") as string;

    if (!firstName || !lastName || !address) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    let updatedUser;

    if (file) {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName, address, avatar },
      });
    } else {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName, address },
      });
    }

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
