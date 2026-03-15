"use client";
import { useState } from "react";
import getStipePromise from "@/lib/stripe";
import { CartProduct } from "@/types/datatype";
import { MdOutlinePayment } from "react-icons/md";
import { Button } from "./ui/button";

interface StripeCheckOutButtonProps {
  products: CartProduct[];
}

const StripeCheckOutButton = ({ products }: StripeCheckOutButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const stripe = await getStipePromise();
      const response = await fetch("/api/stripe-session/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-cache",
        body: JSON.stringify(products),
      });

      const data = await response.json();
      if (data.session) {
        stripe?.redirectToCheckout({ sessionId: data.session.id });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      setLoading(false); // Re-enable the button if there's an error
    }
  };

  return (
    <div>
      <Button
        className="w-full bg-gray-800 text-white hover:bg-gray-950 px-4 py-2"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <span>Loading...</span>
        ) : (
          <>
            <MdOutlinePayment />
            {"   "} Check out
          </>
        )}
      </Button>
    </div>
  );
};

export default StripeCheckOutButton;
