"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

function Profile() {
  const { user } = useUser();
  // console.log("clerk user", user);

  const [isLoading, setIsLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [firstNameHeading, setFirstNameHeading] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");

  const getData = async () => {
    setIsLoading(true);
    // console.log("inside getdata");

    try {
      const response = await fetch(`/api/profile`);

      if (!response.ok) {
        throw new Error("failed to fetch data");
      }

      const data = await response.json();

      if (data.user.firstName) setFirstName(data.user.firstName);
      if (data.user.firstName) setFirstNameHeading(data.user.firstName);
      if (data.user.lastName) setLastName(data.user.lastName);
      if (data.user.address) setAddress(data.user.address);

      // console.log("data", data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // console.log("inside handleChange");

    try {
      const formData = new FormData();

      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("address", address);

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });

      // console.log("response", response);

      if (!response.ok) {
        throw new Error("failed to update profile");
      }
      toast.success("profile updated");

      await getData();
    } catch (error) {
      console.error(error);
    }
  };

  return isLoading ? (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-pulse text-center">
      <div className="text-3xl font-semibold text-blue-600">
        Loading your profile...
      </div>
      <Progress value={33} className="w-64 h-3 rounded-full bg-gray-200" />
      <p className="text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-4">
      <div className="w-full max-w-xl p-6 bg-white rounded-xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Profile of {firstNameHeading || "User"}
        </h1>

        <form onSubmit={handleChange} className="space-y-5">
          <div>
            <label
              htmlFor="firstname"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              id="firstname"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          </div>

          <div title="non-editable">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <p className="w-full px-4 py-2 bg-gray-100 border rounded-md text-gray-600">
              {user?.emailAddresses[0].emailAddress}
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
          >
            Update Profile
          </button>
        </form>

        <Link
          href="/admin/dashboard"
          className="block text-center w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 rounded-md transition duration-200"
        >
          Go back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Profile;
