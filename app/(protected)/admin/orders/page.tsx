"use client";

import { Progress } from "@/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";

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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface OrderProps {
  id: string;
  createdAt: string;
  customer: {
    address: string;
    firstName: string;
    lastName: string;
  };
  orderItems: {
    id: string;
    quantity: string;
    product: {
      id: string;
      name: string;
      price: string;
    };
  }[];
  status: string;
  totalAmount: string;
}

function Orders() {
  const { user, isLoaded } = useUser();

  // send at last
  // if (!isLoaded) {
  //   return (
  //     <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-pulse text-center">
  //       <div className="text-3xl font-semibold text-blue-600">
  //         Loading your orders...
  //       </div>
  //       <Progress value={33} className="w-64 h-3 rounded-full bg-gray-200" />
  //       <p className="text-sm text-muted-foreground">Please wait a moment.</p>
  //     </div>
  //   );
  // }

  // const [orders, setOrders] = useState<OrderProps[]>([]);
  const [pendingOrders, setPendingOrders] = useState<OrderProps[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderProps[]>([]);

  const getOrders = async () => {
    try {
      const response = await fetch(`/api/adminOrders`);

      if (!response.ok) {
        console.error("failed to get orders");
        toast.error("failed to get orders");
        return;
      }

      const data = await response.json();
      // console.log(data);

      // setOrders(data.orders);

      setPendingOrders(
        data.orders.filter((order: OrderProps) => order.status === "PENDING")
      );
      setCompletedOrders(
        data.orders.filter((order: OrderProps) => order.status === "COMPLETED")
      );
    } catch (error) {
      console.error("failed to get orders", error);
      toast.error("failed to get orders");
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const handleComplete = async (e: React.MouseEvent, orderId: string) => {
    e.preventDefault();

    // console.log("complete it bro");

    try {
      const response = await fetch(`/api/adminOrders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        console.error("failed to complete order");
        toast.error("failed to complete order");
        return;
      }

      toast.success("Order completed successfully");
      await getOrders();
    } catch (error) {
      console.error("failed to complete order", error);
      toast.error("failed to complete order");
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-pulse text-center">
        <div className="text-3xl font-semibold text-blue-600">
          Loading your orders...
        </div>
        <Progress value={33} className="w-64 h-3 rounded-full bg-gray-200" />
        <p className="text-sm text-muted-foreground">Please wait a moment.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link
        href="/admin/dashboard"
        className="inline-block mb-4 text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        ← Go back to dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-6">Orders for {user?.firstName}</h1>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-500">
          Pending Orders
        </h2>
        {pendingOrders.length === 0 ? (
          <p className="text-muted-foreground">No pending orders.</p>
        ) : (
          <div className="grid gap-6">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="border rounded-2xl shadow-md p-6 bg-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-medium">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer.address}
                    </p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                    PENDING
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Order Time: {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-base font-semibold">
                    Total: Rs.{order.totalAmount}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Items:</h3>
                  <ul className="grid gap-2 text-sm">
                    {order.orderItems.map((item) => (
                      <li
                        key={item.id}
                        className="border p-2 rounded-md bg-gray-50"
                      >
                        <p className="font-semibold">{item.product.name}</p>
                        <p>Price: Rs.{item.product.price}</p>
                        <p>Quantity: {item.quantity}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="default" className="cursor-pointer">
                        Mark as Completed
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Complete this order?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to complete this order? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="cursor-pointer"
                          onClick={(e) => handleComplete(e, order.id)}
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-green-600">
          Completed Orders
        </h2>
        {completedOrders.length === 0 ? (
          <p className="text-muted-foreground">No completed orders.</p>
        ) : (
          <div className="grid gap-6">
            {completedOrders.map((order) => (
              <div
                key={order.id}
                className="border rounded-2xl shadow-md p-6 bg-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-medium">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer.address}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    COMPLETED
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Order Time: {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-base font-semibold">
                    Total: Rs.{order.totalAmount}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Items:</h3>
                  <ul className="grid gap-2 text-sm">
                    {order.orderItems.map((item) => (
                      <li
                        key={item.id}
                        className="border p-2 rounded-md bg-gray-50"
                      >
                        <p className="font-semibold">{item.product.name}</p>
                        <p>Price: Rs.{item.product.price}</p>
                        <p>Quantity: {item.quantity}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
