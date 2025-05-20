"use client";

import { Shop, User } from "@/generated/prisma";
import { CldImage } from "next-cloudinary";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Progress } from "@/components/ui/progress";

function CheckoutIndividual() {
  // call orders api from this. and create an order. and send email to user and shop owner (vendor) about the order details.

  const { isLoaded } = useUser();

  const params = useParams();
  const shopId = params.id;

  // const [vendorInfo, setVendorInfo] = useState<User>();
  const [shopInfo, setShopInfo] = useState<Shop>();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [prods, setProds] = useState<
    {
      full: string;
      quantity: string;
      productId: string;
      price: string;
      total: string;
    }[]
  >([]);

  const [prodInfo, setProdInfo] = useState<
    Record<string, { name: string; image: string }>
  >({});
  const [userData, setUserData] = useState<User>();
  // const [orderId, setOrderId] = useState("");

  // for edits in user details
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [address, setAddress] = useState(userData?.address || "");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // from localstorage
  const fetchCartItems = useCallback(() => {
    const items = Object.keys(localStorage)
      .filter((key) => key.startsWith(`cart-item-${shopId}`))
      .map((key) => localStorage.getItem(key))
      .filter((item): item is string => item !== null);

    // console.log(items);

    let runningTotal = 0;
    const ids: string[] = [];

    const parsedProds = items.map((item) => {
      const full = item;
      const quantity = item.substring(0, item.indexOf("$"));
      const productId = item.substring(
        item.indexOf("$") + 1,
        item.lastIndexOf("$")
      );
      const price = item.substring(item.lastIndexOf("$") + 1);
      const total = parseInt(quantity) * parseInt(price);
      runningTotal += total;

      ids.push(productId);

      // prods.push({ full, quantity, productId, price });
      return {
        full,
        quantity,
        productId,
        price,
        total: total.toString(),
      };
    });

    setTotalAmount(runningTotal);
    setProds(parsedProds);
    // console.log("parsed prods: ", prods);

    setProductIds(ids);
  }, [shopId]);

  const fetchVendorInfo = useCallback(async () => {
    try {
      const response = await fetch(`/api/checkout`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shopId }),
      });

      if (!response.ok) {
        throw new Error("failed to fetch vendor info");
      }

      const data = await response.json();

      console.log("vendor info", data);
      // setVendorInfo(data.vendor);
    } catch (error) {
      console.error("error getting vendor info", error);
    }
  }, [shopId]);

  interface ProductItem {
    id: string;
    name: string;
    image: string;
  }

  const getProductData = useCallback(async () => {
    try {
      const response = await fetch(`/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds, shopId }),
      });

      // console.log("response of product data", response);

      if (!response.ok) throw new Error("failed to fetch products or shop");

      const data = await response.json();
      // console.log("product data", data);

      const products: ProductItem[] = data.products;

      // works as map.
      // map[prod_id] -> {name, image}
      const map = Object.fromEntries(
        products.map((item) => [
          item.id,
          { name: item.name, image: item.image },
        ])
      );

      setProdInfo(map);

      setShopInfo(data.shop);
    } catch (error) {
      console.error("error getting product data", error);
    }
  }, [productIds, shopId]);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/profile");

      if (!response.ok) throw new Error("failed to fetch user data");

      const data = await response.json();
      console.log("user data", data);
      setUserData(data.user);

      setFirstName(data.user?.firstName || "");
      setLastName(data.user?.lastName || "");
      setAddress(data.user?.address || "");
    } catch (error) {
      console.error("error getting user data", error);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();
    fetchUserData();
    fetchVendorInfo();
  }, [fetchCartItems, fetchUserData, fetchVendorInfo]);

  useEffect(() => {
    if (productIds.length > 0) getProductData();
  }, [productIds, getProductData]);

  // const sendEmails = async () => {
  //   // console.log("env email = ", process.env.EMAIL_USER);
  //   // console.log("env pass = ", process.env.EMAIL_PASS ? "yes" : "no");

  //   const response = await fetch(`/api/sendEmail`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       orderDetails: {
  //         id: orderId,
  //         items: [...prods],
  //         total: totalAmount,
  //       },
  //       vendorEmail: vendorInfo?.email,
  //       customerEmail: userData?.email,
  //     }),
  //   });

  //   if (!response.ok) {
  //     throw new Error("failed to send emails");
  //   }

  //   const data = await response.json();
  //   console.log("email sent result", data);
  // };

  const handleConfirmOrder = async () => {
    if (!prods || prods.length === 0) return;

    setIsSubmitting(true);

    try {
      const productData = prods.map(({ productId, quantity }) => ({
        productId,
        quantity: Number(quantity),
      }));

      const response = await fetch(`/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productData, shopId }),
      });

      if (!response.ok) {
        throw new Error("failed to confirm order");
      }

      const data = await response.json();
      console.log("order confirmed", data);

      // setOrderId(data.order.id);

      // alert("order confirmed");

      // send email logic

      // clear localstorage and redirect to success page
      Object.keys(localStorage)
        .filter((key) => key.startsWith(`cart-item-${shopId}`))
        .map((key) => localStorage.removeItem(key));

      // send emails
      // await sendEmails(); (sent inside only)

      toast.success("Order confirmed successfully");

      router.push("/thankyou");
    } catch (error: unknown) {
      if (error instanceof Error)
        throw new Error("error confirming order", error);
      else throw new Error("something went wrong while confirming order");
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();

    // stuff
    try {
      // backend logic
      if (!firstName || !lastName || !address) {
        toast.error("Please fill all the fields");
        return;
      }
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("address", address);

      const response = await fetch(`/api/profile`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        toast.error("failed to save changes");
        return;
      }

      fetchUserData();
      toast.success("Changes saved successfully");
    } catch (error) {
      toast.error("failed to save changes");
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return !isLoaded ? (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-pulse text-center">
      <div className="text-3xl font-semibold text-blue-600">
        Loading Checkout...
      </div>
      <Progress value={33} className="w-64 h-3 rounded-full bg-gray-200" />
      <p className="text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  ) : (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Checkout for <span className="text-blue-600">{shopInfo?.name}</span>{" "}
      </h1>

      <div className="space-y-6 mb-10">
        {prods.map((prod, index) => (
          <div
            key={index}
            className="border rounded-2xl shadow-md p-5 bg-white transition transform hover:scale-[1.01]"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <CldImage
                width="300"
                height="200"
                src={prodInfo[prod.productId]?.image}
                alt={prodInfo[prod.productId]?.name}
                className="rounded-lg shadow-sm"
              />
              <div className="flex-1 space-y-2">
                <p className="text-lg">
                  <span className="font-semibold">Product:</span>{" "}
                  {prodInfo[prod.productId]?.name}
                </p>
                <p>
                  <span className="font-semibold">Quantity:</span>{" "}
                  {prod.quantity}
                </p>
                <p>
                  <span className="font-semibold">Price/unit:</span> ₹
                  {prod.price}
                </p>
                <p>
                  <span className="font-semibold">Total:</span> ₹{prod.total}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Total Amount</h2>
        <span className="text-2xl font-bold text-green-600">
          ₹{totalAmount}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-md p-5 max-w-md mx-auto mb-6 mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          User Details
        </h3>
        <div className="text-gray-700 space-y-2">
          {isEditing ? (
            <>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border px-3 py-1 rounded w-full"
                placeholder="First Name"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border px-3 py-1 rounded w-full"
                placeholder="Last Name"
              />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border px-3 py-1 rounded w-full"
                placeholder="Address"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-1 rounded"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 text-black px-4 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p>
                <span className="font-medium text-gray-800">User Name:</span>{" "}
                {userData?.firstName} {userData?.lastName}
              </p>
              <p>
                <span className="font-medium text-gray-800">
                  Shipping Address:
                </span>{" "}
                {userData?.address}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 text-blue-600 underline"
              >
                Edit details
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 text-center">
        <button
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-xl font-medium text-lg shadow hover:scale-105 transition-transform cursor-pointer"
          onClick={handleConfirmOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Confirm Order"}
        </button>

        <Link
          href={`/shop/${shopId}`}
          className={`bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-3 rounded-xl font-medium text-lg shadow transition-transform inline-block text-center ${
            isSubmitting
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "hover:scale-105"
          }`}
        >
          Go back to Shop
        </Link>
      </div>
    </div>
  );
}

export default CheckoutIndividual;
