import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
// import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function GET(req: NextRequest) {
  // const { userId } = await auth();

  // if (!userId) {
  //   return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  // }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // return NextResponse.json({ error: "unauthorised" }, { status: 401 });
      // console.log("looking for 1 shop with shopId", userId);

      const shop = await prisma.shop.findUnique({ where: { id: userId } });

      if (!shop) {
        return NextResponse.json({ error: "shop not found" }, { status: 404 });
      }

      return NextResponse.json({ shop, status: 200 });
    }

    // console.log("looking for all shops");

    const search = searchParams.get("search") || "";

    const shops = await prisma.shop.findMany({
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            address: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ shops, status: 200 });
  } catch (error) {
    // console.error("error getting shop", error);
    return NextResponse.json(
      { error: `error getting shop ${error}` },
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

    const file = formData.get("file") as File | null;
    let image: string | null = null;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await new Promise<CloudinaryUploadResult>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "vendor-vista-shops" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result as CloudinaryUploadResult);
            }
          );
          uploadStream.end(buffer);
        }
      );
      image = result.public_id;
    }

    const address = formData.get("address") as string | null;
    const name = formData.get("name") as string | null;
    const phone = formData.get("phone") as string | null;

    if (!address || !name || !phone) {
      return NextResponse.json(
        { error: "missing address or name" },
        { status: 400 }
      );
    }

    let updatedShop;

    if (file) {
      updatedShop = await prisma.shop.update({
        where: { id: userId },
        data: { address, name, image, phone },
      });
    } else {
      updatedShop = await prisma.shop.update({
        where: { id: userId },
        data: { address, name, phone },
      });
    }

    // console.log(updatedShop);

    return NextResponse.json({ updatedShop, status: 200 });
  } catch (error) {
    // console.error("error updating shop", error);
    return NextResponse.json(
      { error: `error updating shop ${error}` },
      { status: 500 }
    );
  }
}
