import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function GET(req: NextRequest) {
  // const { userId } = await auth();

  // if (!userId) {
  // return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  // }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || "";

  if (userId === "") {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  // const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  try {
    const products = await prisma.product.findMany({
      where: {
        shopId: userId,
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: { name: "asc" },
    });

    const totalProducts = await prisma.product.count({
      where: { shopId: userId },
    });

    // console.log("inside get products", products, totalProducts, userId);

    return NextResponse.json({ products, totalProducts });
  } catch (error) {
    // console.error("error getting products", error);

    return NextResponse.json(
      { error: `internal server error ${error}` },
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

// create new product
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  // console.log("inside post products function");

  if (!userId) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  // console.log(user);

  if (!user) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "missing file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "vendor-vista-products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        );

        uploadStream.end(buffer);
      }
    );

    // console.log("public_id of image: ", result.public_id);

    // create product (rest stuff)
    // const { name, description, price, stock } = await req.json();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const stock = parseInt(formData.get("stock") as string);

    if (!name || !description || !price || !stock) {
      return NextResponse.json(
        { error: "missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image: result.public_id,
        stock,
        shopId: userId,
      },
    });

    return NextResponse.json({ product, status: 201 });
  } catch (error) {
    console.log("upload image failed", error);
    return NextResponse.json(
      { error: "product upload failed" },
      { status: 500 }
    );
  }
}
