"use client";

import { Progress } from "@/components/ui/progress";
import { Shop } from "@/generated/prisma";
import { useUser } from "@clerk/nextjs";
import { Search } from "lucide-react";
// import { CldImage } from "next-cloudinary";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

function ShopPage() {
  const { isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceSearchTerm] = useDebounceValue(searchTerm, 300);
  const [shops, setShops] = useState<Shop[]>([]);

  const getShops = useCallback(async () => {
    try {
      // console.log("trying to get shops");

      const response = await fetch(`/api/shop?search=${debounceSearchTerm}`);

      if (!response.ok) {
        throw new Error("failed to fetch shops");
      }

      const data = await response.json();
      // console.log("shops", data);

      setShops(data.shops);
    } catch (error) {
      console.error("error getting shops", error);
    }
  }, [debounceSearchTerm]);

  useEffect(() => {
    getShops();
  }, [debounceSearchTerm, getShops]);

  return !isLoaded ? (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-pulse text-center">
      <div className="text-3xl font-semibold text-blue-600">
        Loading the shops...
      </div>
      <Progress value={33} className="w-64 h-3 rounded-full bg-gray-200" />
      <p className="text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-600">
        Shops
      </h1>
      <div className="mb-6 text-center">
        <Link
          href="/dashboard"
          className="inline-block text-indigo-500 hover:text-indigo-700 font-semibold transition"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search shops..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {shops.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No shops found
          </p>
        ) : (
          shops.map((shop) => (
            <div
              key={shop.id}
              className="p-4 border rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{shop.name}</h2>
              <p className="text-gray-600 mb-4">{shop.address}</p>
              <Link
                href={`/shop/${shop.id}`}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Visit Shop →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ShopPage;
