"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function OrderDetails() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the stored session ID
    const storedSessionId = sessionStorage.getItem("session_id");

    // If the session_id is new or different, make the POST request
    if (session_id && session_id !== storedSessionId) {
      // Call your API to create the order
      fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_id }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Order created:", data);
          setOrderCreated(true);
          setOrderId(data.order.id); // Store the order ID
          sessionStorage.setItem("orderCreated", "true");
          sessionStorage.setItem("session_id", session_id); // Store the session_id
        })
        .catch((error) => {
          console.error("Error creating order:", error);
        });
    } else if (storedSessionId) {
      // If the session_id matches the stored one, retrieve the order ID
      const storedOrderId = sessionStorage.getItem("orderId");
      if (storedOrderId) {
        setOrderId(storedOrderId);
      }
    }
  }, [session_id]);

  useEffect(() => {
    if (orderId) {
      sessionStorage.setItem("orderId", orderId);
    }
  }, [orderId]);

  return (
    <div className="min-h-screen">
      <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Payment Successful
        </h1>
        <p className="text-lg mb-4">
          Thank you for your purchase! Your order is being processed.
        </p>
        <span className="text-lg mb-4">Note your order ID for tracking.</span>
        {orderId && (
          <p className="text-lg font-semibold text-gray-700">
            <strong>Order ID:</strong> {orderId}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="text-center text-lg">Loading...</div>}>
      <OrderDetails />
    </Suspense>
  );
}
