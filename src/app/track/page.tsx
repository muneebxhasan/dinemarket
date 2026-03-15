"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Zod schema to validate the order ID and phone number
const trackOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  phoneNumber: z
    .string()
    .regex(/^\d+$/, "Phone number must be numeric")
    .min(10, "Phone number must be at least 10 digits"), // Ensure phone number is numeric and has at least 10 digits
});

// Define the data structure for the order based on your schema
type Order = {
  id: number;
  sessionId: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: {
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    amount_total: number;
  }>;
  created: string; // Assuming the timestamp is in string format
};

type TrackOrderFormData = z.infer<typeof trackOrderSchema>;

const TrackOrder = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackOrderFormData>({
    resolver: zodResolver(trackOrderSchema),
  });

  const [order, setOrder] = useState<Order | null>(null);

  const onSubmit = async (data: TrackOrderFormData) => {
    try {
      // Convert phone number to string if needed (already handled by zod validation as string)
      const phoneNumberString = data.phoneNumber;

      const response = await fetch(
        `/api/order?id=${data.orderId}&phone=${phoneNumberString}`,
        {
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error("Order not found");
      }

      const orderData: Order = await response.json();
      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      alert("Order not found");
    }
  };

  return (
    <div className="max-w-lg mx-auto my-10 min-h-screen">
      <h1 className="text-2xl font-semibold text-center mb-6">
        Track Your Order
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input {...register("orderId")} placeholder="Enter your Order ID" />
          {errors.orderId && (
            <p className="text-red-500">{errors.orderId.message}</p>
          )}
        </div>
        <div>
          <Input
            {...register("phoneNumber")}
            placeholder="Enter your Phone Number"
          />
          {errors.phoneNumber && (
            <p className="text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Track Order
        </Button>
      </form>
      {order && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Order Details:</h3>
          <p>
            <strong>Order ID:</strong> {order.id}
          </p>
          <p>
            <strong>Status:</strong> {order.orderStatus}
          </p>
          <p>
            <strong>Amount Paid:</strong> $
            {(order.amountTotal / 100).toFixed(2)}{" "}
            {order.currency.toUpperCase()}
          </p>
          <p>
            <strong>Payment Status:</strong> {order.paymentStatus}
          </p>
          <p>
            <strong>Customer Name:</strong> {order.customerName || "N/A"}
          </p>
          <p>
            <strong>Customer Email:</strong> {order.customerEmail || "N/A"}
          </p>
          <p>
            <strong>Customer Phone:</strong> {order.customerPhone || "N/A"}
          </p>
          <p>
            <strong>Order Created:</strong>{" "}
            {new Date(order.created).toLocaleString()}
          </p>

          {order.shippingAddress && (
            <div>
              <h4 className="mt-4 font-semibold">Shipping Address:</h4>
              <p>{order.shippingAddress.address.line1}</p>
              <p>
                {order.shippingAddress.address.city},{" "}
                {order.shippingAddress.address.state}
              </p>
              <p>
                {order.shippingAddress.address.postal_code},{" "}
                {order.shippingAddress.address.country}
              </p>
            </div>
          )}

          {order.items && (
            <div>
              <h4 className="mt-4 font-semibold">Items:</h4>
              <ul>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.description} - {item.quantity} x $
                    {(item.amount_total / 100).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
