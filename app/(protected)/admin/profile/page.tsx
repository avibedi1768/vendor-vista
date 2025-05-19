"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CldImage } from "next-cloudinary";
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
  const [avatar, setAvatar] = useState("");
  const [newAvatar, setNewAvatar] = useState<FormData | null>(null);

  const getData = async () => {
    setIsLoading(true);
    console.log("inside getdata");

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
      if (data.user.avatar) setAvatar(data.user.avatar);

      console.log("data", data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const file = e?.target.files?.[0];

    if (!file) return;

    // preview
    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);

    // image
    const formData = new FormData();
    formData.append("file", file);

    setNewAvatar(formData);
  };

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("inside handleChange");

    try {
      const formData = new FormData();

      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("address", address);

      const file = newAvatar?.get("file");
      if (file) formData.append("file", file);

      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });

      console.log("response", response);

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
        Loading your products...
      </div>
      <Progress value={33} className="w-64 h-3 rounded-full bg-gray-200" />
      <p className="text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  ) : (
    <>
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Profile of {firstNameHeading || "User"}
        </h1>
        {/* <p className="text-center text-sm text-gray-500">
        User Email & Role are not editable.
      </p> */}

        <form onSubmit={handleChange} className="space-y-5">
          <div className="flex flex-col">
            <label
              htmlFor="firstname"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              id="firstname"
              value={firstName}
              placeholder="First name"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="lastName"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              id="lastName"
              value={lastName}
              placeholder="Last name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="address"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              type="text"
              id="address"
              value={address}
              placeholder="Address"
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex flex-col" title="non-editable">
            <label
              htmlFor="email"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <p className="p-2 bg-gray-100 border rounded-md text-gray-600">
              {user?.emailAddresses[0].emailAddress}
            </p>
          </div>

          <div className="flex flex-col items-center">
            <label
              htmlFor="avatar"
              className="mb-2 text-sm font-medium text-gray-700"
            >
              Avatar
            </label>
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleFileUpload}
              className="mb-3 bg-blue-500 text-white p-2 rounded-md cursor-pointer hover:bg-blue-600 "
            />
            {avatar ? (
              <div className="w-40 h-40 rounded-full overflow-hidden shadow-md">
                <CldImage
                  width="160"
                  height="160"
                  src={avatar}
                  alt="user avatar"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No avatar uploaded</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md cursor-pointer"
          >
            Update Profile
          </button>
        </form>

        <Link
          href="/admin/dashboard"
          className="block text-center w-full bg-violet-500 hover:bg-violet-700 text-white font-semibold py-2 rounded-md mt-4"
        >
          Go back to Dashboard
        </Link>
      </div>
    </>
  );
}

export default Profile;
