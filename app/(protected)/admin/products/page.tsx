"use client";

import { useUser } from "@clerk/nextjs";
import React, { useCallback, useEffect, useState } from "react";

import { CldImage } from "next-cloudinary";

// debounce -> when user is typing, wait for some time (eg: 300ms) before sending the request. usually we send request at every typed word.
import { useDebounceValue } from "usehooks-ts";

import { Product } from "@/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Pencil, PencilOff, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Image from "next/image";

function Products() {
  const { user, isLoaded } = useUser();

  // if (!isLoaded) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-pulse text-center">
  //       <div className="text-3xl font-semibold text-blue-600">
  //         Loading your products...
  //       </div>
  //       <Progress value={33} className="w-64 h-3 rounded-full bg-gray-200" />
  //       <p className="text-sm text-muted-foreground">Please wait a moment.</p>
  //     </div>
  //   );
  // }

  const [products, setProducts] = useState<Product[]>([]);
  // const [totalProducts, setTotalProducts] = useState<number>(0);
  // const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<FormData | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [stock, setStock] = useState("");

  const [editProductId, seteditProductId] = useState<string | null>(null);
  const [productStocks, setProductStocks] = useState("");

  // const [debounceSearchTerm] = useDebounceValue(searchTerm, 300);
  const [debounceSearchTerm] = useDebounceValue(searchTerm, 300);

  // list the products
  const fetchProducts = useCallback(
    async (page: number) => {
      try {
        // setIsLoading(true);

        // console.log("user: ", user);
        // console.log("userid = ", user?.id);

        const response = await fetch(
          `/api/products?page=${page}&search=${debounceSearchTerm}&userId=${user?.id}`
        );

        if (!response.ok) {
          throw new Error("failed to fetch products");
        }

        const data = await response.json();
        // console.log("products: ", data);

        setProducts(data.products);
        // setTotalProducts(data.totalProducts);

        // setIsLoading(false);
      } catch (error) {
        // setIsLoading(false);
        console.error("error fetching products", error);
      }
    },
    [debounceSearchTerm, user]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [debounceSearchTerm, fetchProducts]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    // preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // image
    const formData = new FormData();
    formData.append("file", file);

    setImage(formData);
  };

  // add products
  const handleAddProduct = async () => {
    try {
      // console.log("inside trycatch of add product (client");

      if (!image) {
        // console.error("no image selected");
        toast.error("No image selected");
        return;
      }

      if (isNaN(Number(price)) || isNaN(Number(stock))) {
        toast.error("Price and stock must be valid numbers");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);

      const file = image.get("file");
      if (file) formData.append("file", file);
      else {
        toast.error("no file in image");
        return;
      }

      const response = await fetch("/api/products", {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        // body: JSON.stringify(productData),
        body: formData,
      });

      if (!response.ok) {
        throw new Error("failed to add product", { cause: response });
      }

      toast.success("Product added successfully");

      await fetchProducts(1);

      setImage(null);
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   console.log("image", image);
  // }, [image]);

  // delete products
  const handleDeleteProduct = async (id: string) => {
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });

    if (!response.ok) {
      throw new Error("failed to delete product");
    }

    toast.success("Product deleted successfully");
    await fetchProducts(1);
  };

  const handleStockUpdate = async (
    e: React.FormEvent,
    id: string,
    stocks: string
  ) => {
    e.preventDefault();

    stocks = stocks.trim();

    if (!stocks || stocks === "") return;

    if (isNaN(Number(stocks))) return;

    const formData = new FormData();
    formData.append("stocks", Number(stocks).toString());

    const response = await fetch(`/api/products/${id}`, {
      method: "PUT",
      // headers: { "Content-Type": "application/json" },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("failed to update stock");
    }

    seteditProductId(null);
    toast.success("Stock updated successfully");
    await fetchProducts(1);
  };

  return !isLoaded ? (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-pulse text-center">
      <div className="text-3xl font-semibold text-blue-600">
        Loading your products...
      </div>
      <Progress value={33} className="w-64 h-3 rounded-full bg-gray-200" />
      <p className="text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  ) : (
    <div className="p-6 space-y-10 mx-auto">
      {/* Back Button */}
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
        >
          ← Go back to dashboard
        </Link>
      </div>

      {/* Products Section */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Here are products of{" "}
          <span className="text-blue-600">{user?.firstName}</span>
        </h1>

        <div className="flex justify-center my-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150"
            />
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-gray-500 italic">No products found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 shadow-sm space-y-2 relative"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="text-sm text-gray-500">
                      {product.description}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      ₹{product.price.toString()}
                    </p>
                    <p className="text-sm text-green-600">
                      Stocks: {product.stock}
                    </p>
                  </div>

                  <div className="space-x-2 flex">
                    {/* Delete */}
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Trash2 className="text-red-500 hover:text-red-700 cursor-pointer" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the product from your
                            shop.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Edit */}
                    {editProductId !== product.id ? (
                      <Pencil
                        className="cursor-pointer text-gray-600 hover:text-black"
                        onClick={() => {
                          seteditProductId(product.id);
                          setProductStocks(product.stock.toString());
                        }}
                      />
                    ) : (
                      <PencilOff
                        className="cursor-pointer text-gray-600 hover:text-black"
                        onClick={() => seteditProductId(null)}
                      />
                    )}
                  </div>
                </div>

                {/* Image */}
                {product.image && (
                  <CldImage
                    width="200"
                    height="200"
                    src={product.image}
                    alt={product.name}
                    className="rounded-md mt-2"
                  />
                )}

                {/* Stock Update Form */}
                {editProductId === product.id && (
                  <form
                    onSubmit={(e) =>
                      handleStockUpdate(e, product.id, productStocks)
                    }
                    className="mt-3 space-y-2"
                  >
                    <label
                      htmlFor="stock"
                      className="block text-sm font-medium"
                    >
                      Update Stocks
                    </label>
                    <input
                      type="text"
                      placeholder="Enter stocks"
                      value={productStocks}
                      onChange={(e) => setProductStocks(e.target.value)}
                      className="border rounded-md p-2 w-full"
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
                    >
                      Submit
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
        <p className="text-center text-muted-foreground">End of products.</p>
      </div>

      {/* Add New Product Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddProduct();
            }}
            className="space-y-4"
          >
            {/* Name */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                type="text"
                id="description"
                placeholder="Enter product description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                type="text"
                id="price"
                placeholder="Enter product price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                type="text"
                id="stock"
                placeholder="Enter product stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image">Image</Label>
              <Input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleFileUpload}
                required
              />
            </div>

            {/* Preview */}
            {image && (
              <Image
                src={imagePreview}
                alt="product preview"
                className="mt-2 w-32 h-32 object-cover rounded-md"
              />
            )}

            <Button type="submit" className="w-full">
              Add Product
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Products;
