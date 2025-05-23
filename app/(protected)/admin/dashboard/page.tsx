"use client";

// import { CardHeader } from "@/components/ui/card";
import { SignOutButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

// shadcn
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CldImage } from "next-cloudinary";

function Page() {
  const { user, isLoaded } = useUser();
  // console.log("user", user);
  // console.log("user id", user?.id);

  // if (!isLoaded) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-pulse text-center">
  //       <div className="text-3xl font-semibold text-blue-600">
  //         Loading your dashboard...
  //       </div>
  //       <Progress value={33} className="w-64 h-3 rounded-full bg-gray-200" />
  //       <p className="text-sm text-muted-foreground">Please wait a moment.</p>
  //     </div>
  //   );
  // }

  const [copied, setCopied] = useState(false);
  const [shopUrl, setShopUrl] = useState("");
  const [address, setAddress] = useState("");
  const [shopName, setShopName] = useState("");
  const [shopPhone, setShopPhone] = useState("");
  const [image, setImage] = useState("");
  const [newImage, setNewImage] = useState<FormData | null>(null);

  const getData = useCallback(async () => {
    try {
      const response = await fetch(`/api/shop?userId=${user?.id}`);

      if (!response.ok) {
        throw new Error("failed to fetch shop data");
      }

      const data = await response.json();
      // console.log("shop data: ", data);

      if (data.shop.address) setAddress(data.shop.address);
      if (data.shop.name) setShopName(data.shop.name);
      if (data.shop.image) setImage(data.shop.image);
      if (data.shop.phone) setShopPhone(data.shop.phone);
    } catch (error) {
      console.log(error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const url = window.location.href;
      // console.log("url", url);
      const baseUrl =
        url.substring(0, url.indexOf("/admin")) + "/shop/" + user?.id;

      setShopUrl(baseUrl);
      // console.log("shopurl", shopUrl);

      getData();
    }
  }, [user, shopUrl, getData]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); //reset color after 2 secs

    toast.success("shop url copied to clipboard");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const file = e?.target.files?.[0];

    if (!file) return;

    // preview
    const previewUrl = URL.createObjectURL(file);
    setImage(previewUrl);

    // image
    const formData = new FormData();
    formData.append("file", file);

    setNewImage(formData);
  };

  const handleShopChanges = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const phone = shopPhone.trim();

      if (!phone || phone === "") return;

      if (isNaN(Number(phone))) return;

      if (!address || !shopName || !phone) {
        toast.error("Please fill all the fields");
        return;
      }

      const formData = new FormData();

      formData.append("address", address);
      formData.append("name", shopName);
      formData.append("phone", phone);

      const file = newImage?.get("file");
      if (file) formData.append("file", file);

      const response = await fetch("/api/shop", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("failed to update shop data");
      }

      await getData();
      toast.success("shop data updated");
    } catch (error) {
      console.error(error);
    }
  };

  return !isLoaded ? (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-pulse text-center">
      <div className="text-3xl font-semibold text-blue-600">
        Loading your dashboard...
      </div>
      <Progress value={33} className="w-64 h-3 rounded-full bg-gray-200" />
      <p className="text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center min-h-screen px-4 py-8 bg-gray-50 text-center space-y-6">
      <h1 className="text-4xl font-bold text-blue-700">
        Dashboard for {user?.firstName}
      </h1>

      <div className="space-x-4">
        <Link
          href="/admin/profile"
          className="text-blue-600 hover:underline text-lg"
        >
          ✏️ Edit Profile
        </Link>
        <Link
          href="/admin/orders"
          className="text-blue-600 hover:underline text-lg"
        >
          📦 Orders
        </Link>
        <Link
          href="/admin/products"
          className="text-blue-600 hover:underline text-lg"
        >
          🛍️ Products
        </Link>
        <Link href="/shop" className="text-blue-600 hover:underline text-lg">
          Browse Shops
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        <h2 className="text-xl font-semibold">Your shop URL</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">🔗 Share</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Link</DialogTitle>
              <DialogDescription>
                Anyone with this link can view your shop.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <Input id="link" defaultValue={shopUrl} readOnly />
              <Button
                size="sm"
                onClick={handleCopy}
                className={`text-white transition-colors ${
                  copied ? "bg-green-600" : "bg-blue-500 hover:bg-blue-700"
                }`}
              >
                <Copy />
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 w-fit bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 cursor-pointer">
        <SignOutButton redirectUrl="/" />
      </div>

      <div className="w-full max-w-md mt-8 bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg font-semibold mb-4">Edit Shop Details</p>
        <form onSubmit={handleShopChanges} className="space-y-4">
          <div className="flex flex-col text-left">
            <label htmlFor="address" className="mb-1 font-medium">
              Shop Address
            </label>
            <Input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter shop address"
            />
          </div>
          <div className="flex flex-col text-left">
            <label htmlFor="name" className="mb-1 font-medium">
              Shop Name
            </label>
            <Input
              type="text"
              id="name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Enter shop name"
            />
          </div>
          <div className="flex flex-col text-left">
            <label htmlFor="name" className="mb-1 font-medium">
              Shop Phone Number
            </label>
            <Input
              type="text"
              id="name"
              value={shopPhone}
              onChange={(e) => setShopPhone(e.target.value)}
              placeholder="Enter shop phone number"
            />
          </div>

          <div className="flex flex-col items-center">
            <label
              htmlFor="image"
              className="mb-2 text-sm font-medium text-gray-700"
            >
              Shop Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleFileUpload}
              className="mb-3 bg-blue-500 text-white p-2 rounded-md cursor-pointer hover:bg-blue-600 "
            />
            {image ? (
              <div className="w-40 h-40 rounded-full overflow-hidden shadow-md">
                <CldImage
                  width="160"
                  height="160"
                  src={image}
                  alt="user image"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No image uploaded</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white"
          >
            Update
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Page;
