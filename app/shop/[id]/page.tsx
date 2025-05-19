"use client";

import ProductCard from "@/components/ProductCard";
import { Product } from "@/generated/prisma";
// import { CldImage } from "next-cloudinary";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

function ShopId() {
  const params = useParams();
  const shopId = params.id as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [address, setAddress] = useState();
  const [shopName, setShopName] = useState();

  const getShopDetails = useCallback(async () => {
    const response = await fetch(`/api/shop?userId=${shopId}`);

    if (!response.ok) throw new Error("failed to fetch shop details");

    const data = await response.json();
    console.log(data);

    if (data.shop.address) setAddress(data.shop.address);
    if (data.shop.name) setShopName(data.shop.name);
  }, [shopId]);

  const getShopProducts = useCallback(async () => {
    try {
      const response = await fetch(`/api/products?userId=${shopId}`);

      if (!response.ok) throw new Error("failed to fetch products");

      const data = await response.json();
      console.log(data);
      setProducts(data.products);
    } catch (error) {
      console.error(error);
    }
  }, [shopId]);

  useEffect(() => {
    getShopDetails();
    getShopProducts();
  }, [getShopDetails, getShopProducts]);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome to <span className="text-blue-600">{shopName}</span>
        </h1>
        {/* <p className="text-gray-600 text-sm">Shop ID: {shopId}</p> */}
        <p className="text-gray-500 mt-1">📍 Address: {address}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">🛍️ Products</h2>

      {products.length === 0 ? (
        <p className="text-gray-500 italic">
          Sorry, this shop does not have any products yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} shopId={shopId} />
          ))}
        </div>
      )}
      <div className="mt-10 flex gap-4">
        <Link
          href={`/checkout/${shopId}`}
          className="inline-block rounded-lg bg-blue-500 text-white px-6 py-2 hover:bg-blue-700 transition"
        >
          Checkout
        </Link>

        <Link
          href={`/dashboard/${shopId}`}
          className="inline-block rounded-lg border border-gray-300 px-6 py-2 hover:bg-gray-100 hover:text-gray-800 transition"
        >
          go back to user profile
        </Link>
      </div>
    </div>
  );
}

export default ShopId;
