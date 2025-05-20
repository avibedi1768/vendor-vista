"use client";

// import { CardHeader } from "@/components/ui/card";
import { SignOutButton } from "@clerk/nextjs";
// import Link from "next/link";
import React, { useEffect, useState } from "react";

interface PastOrderProps {
  id: string;
  createdAt: string;
  shop: {
    address: string;
    name: string;
  };
  orderItems: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: string;
    };
  }[];
  status: string;
  totalAmount: string;
}

function Page() {
  // const { user } = useUser();

  const [firstName, setFirstName] = useState("");
  const [firstNameInHeading, setFirstNameInHeading] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  const [pastOrders, setPastOrders] = useState<PastOrderProps[]>([]);
  // const [pastOrders, setPastOrders] = useState<
  //   Record<
  //     string,
  //     {
  //       createdAt: string;
  //       productName: string;
  //       price: number;
  //       quantity: number;
  //       totalAmount: string;
  //       shopName: string;
  //     }
  //   >
  // >({});

  const getUserData = async () => {
    try {
      const response = await fetch(`/api/profile`);

      if (!response.ok) throw new Error("failed to fetch user data");

      const data = await response.json();
      console.log(data);

      if (data.user.firstName) setFirstName(data.user.firstName);
      if (data.user.firstName) setFirstNameInHeading(data.user.firstName);
      if (data.user.lastName) setLastName(data.user.lastName);
      if (data.user.address) setAddress(data.user.address);
      if (data.user.email) setEmail(data.user.email);
    } catch (error) {
      console.log(error);
    }
  };

  const getUserOrders = async () => {
    console.log("loading user orders in future");

    try {
      const response = await fetch(`/api/orders`);

      if (!response.ok) {
        throw new Error("failed to fetch user orders");
      }

      const data = await response.json();
      console.log("past orders", data);

      setPastOrders(data.orders);
    } catch (error) {
      console.error("error getting user orders", error);
    }
  };

  useEffect(() => {
    getUserData();
    getUserOrders();
  }, []);

  // useEffect(() => {
  //   getUserData();
  // }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("address", address);

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("failed to update profile");
      }

      await getUserData();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Dashboard of {firstNameInHeading}
      </h1>

      <div className="flex justify-end">
        <div className="w-fit bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300 cursor-pointer">
          <SignOutButton redirectUrl="/" />
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Your Details</h2>
      <form
        onSubmit={handleUpdateProfile}
        className="space-y-4 bg-white p-6 rounded-xl shadow-md border"
      >
        <div className="flex flex-col">
          <label htmlFor="firstName" className="font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            className="p-2 mt-1 rounded-md border outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="lastName" className="font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            className="p-2 mt-1 rounded-md border outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="address" className="font-medium text-gray-700">
            Shipping Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            className="p-2 mt-1 rounded-md border outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <p className="text-gray-600 text-sm" title="non-changeable">
            Email: <span className="font-medium">{email}</span>
          </p>
        </div>

        <button
          type="submit"
          className="w-full sm:w-fit px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Update Details
        </button>
      </form>

      <h2 className="text-2xl font-bold mt-12 mb-6">Past Orders</h2>
      <div className="space-y-6">
        {pastOrders.map((order) => (
          <div
            key={order.id}
            className="p-6 bg-white rounded-xl shadow-md border border-gray-200"
          >
            <div className="mb-4 flex flex-col sm:flex-row sm:justify-between">
              <p className="text-sm text-gray-500">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-lg font-semibold text-blue-700">
                Total: ₹{order.totalAmount}
              </p>
            </div>

            <div className="mb-4">
              <p className="font-medium">Shop:</p>
              <p className="text-gray-700">{order.shop.name}</p>
              <p className="text-gray-500 text-sm">{order.shop.address}</p>
            </div>

            <div className="mt-4">
              <p className="font-medium mb-2">Products:</p>
              <ul className="space-y-2">
                {order.orderItems.map((item, index) => (
                  <li key={index} className="bg-gray-50 p-3 rounded-md border">
                    <p className="text-gray-800">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      ₹{item.product.price} × {item.quantity} = ₹
                      {(parseFloat(item.product.price) * item.quantity).toFixed(
                        2
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <span
                className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${
                  order.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                Status: {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
