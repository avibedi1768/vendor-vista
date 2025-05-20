"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { CldImage } from "next-cloudinary";
import { Product } from "@/generated/prisma";

function ProductCard({
  product,
  shopId,
}: {
  product: Product;
  shopId: string;
}) {
  const [count, setCount] = useState<number>(0);
  const max = product.stock;

  useEffect(() => {
    const saved = localStorage.getItem(`cart-item-${shopId}-${product.id}`);
    if (saved) {
      setCount(
        Math.min(
          product.stock,
          parseInt(saved.substring(0, saved.indexOf("$")))
        )
      );
    }
  }, [shopId, product]);

  const updateCart = (newCount: number) => {
    setCount(newCount);

    if (newCount > 0) {
      localStorage.setItem(
        `cart-item-${shopId}-${product.id}`,
        `${newCount.toString()}$${product.id}$${product.price}`
      );
    } else {
      localStorage.removeItem(`cart-item-${shopId}-${product.id}`);
    }
  };

  return (
    <Card className="w-full max-w-sm rounded-2xl shadow-md hover:scale-[1.02] transition-all">
      <CldImage
        src={product.image || ""}
        width={400}
        height={300}
        alt={product.name}
        className="rounded-t-2xl object-cover w-full h-48"
      />

      <CardContent className="p-5 space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
        <p className="text-base font-medium text-indigo-600">
          ₹{product.price.toString()}
        </p>
        <p className="text-sm text-gray-500 line-clamp-2 italic">
          {product.description || "No description"}
        </p>
        <p className="text-xs text-gray-400">In stock: {product.stock}</p>
      </CardContent>

      <CardFooter className="p-4">
        {count === 0 ? (
          <Button className="w-full" onClick={() => updateCart(1)}>
            Add to cart
          </Button>
        ) : (
          <div className="flex items-center gap-2 w-full justify-between">
            <Button variant="outline" onClick={() => updateCart(count - 1)}>
              -
            </Button>
            <span className="text-md font-medium">{count}</span>
            <Button
              variant="outline"
              onClick={() => updateCart(count + 1)}
              disabled={count >= max}
              className="disabled:cursor-not-allowed disabled:text-red-600"
            >
              {count === max ? "x" : "+"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
