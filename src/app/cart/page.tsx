"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/strore";
import { CartActions } from "@/store/slice/cartSlice";
import { CartProduct } from "@/types/datatype";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StripeCheckOutButton from "@/components/Checkout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Cart = () => {
  const dispatch: AppDispatch = useDispatch();
  const products = useSelector((state: RootState) => state.cartSlice.products);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      dispatch(CartActions.setCart(parsedCart));
    }
  }, [dispatch]);

  const handleRemove = (id: number, size: string) => {
    dispatch(CartActions.removeProduct({ id, size }));
  };

  const handleClearCart = () => {
    dispatch(CartActions.clearCart());
  };

  const handleIncrement = (id: number, size: string) => {
    dispatch(CartActions.incrementProduct({ id, size }));
  };

  const handleDecrement = (id: number, size: string) => {
    dispatch(CartActions.decrementProduct({ id, size }));
  };

  const totalQuantity = products.reduce(
    (total: number, product: CartProduct) => total + (product.quantity ?? 0),
    0,
  );

  const totalPrice = products.reduce((total: number, product: CartProduct) => {
    const price = parseFloat((product.price ?? "0").replace(/[^0-9.-]+/g, ""));
    return total + price * (product.quantity ?? 0);
  }, 0);

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row md:space-x-6 min-h-screen">
      <div className="flex-1 space-y-6">
        {products.length === 0 ? (
          <div className="text-center text-lg font-medium py-20">
            <p>Your cart is currently empty.</p>
          </div>
        ) : (
          <Table className="w-full border border-gray-200 rounded-lg shadow-md">
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Product</TableHead>
                <TableHead className="text-left">Type</TableHead>
                <TableHead className="text-left">Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product: any) => (
                <TableRow key={product.id} className="border-t">
                  <TableCell className="flex items-center">
                    <Image
                      src={String(product.images[0])}
                      alt={product.name || "Product Image"}
                      width={100}
                      height={100}
                      className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                    />
                    <div className="ml-4">
                      <div className="text-xl font-semibold">
                        {product.name}
                      </div>
                      <div className="text-gray-600">{product.clothType}</div>
                    </div>
                  </TableCell>
                  <TableCell>{product.clothType}</TableCell>
                  <TableCell className="text-lg font-semibold">
                    ${product.price}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        onClick={() =>
                          product.id &&
                          product.size &&
                          handleDecrement(product.id, product.size)
                        }
                        variant="outline"
                        className="px-4 py-1"
                      >
                        -
                      </Button>
                      <span className="text-lg">{product.quantity}</span>
                      <Button
                        onClick={() =>
                          product.id &&
                          product.size &&
                          handleIncrement(product.id, product.size)
                        }
                        variant="outline"
                        className="px-4 py-1"
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      onClick={() =>
                        product.id &&
                        product.size &&
                        handleRemove(product.id, product.size)
                      }
                      variant="outline"
                      className="w-full md:w-auto px-4 py-1"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="w-full md:w-[350px] mt-6 md:mt-0">
        <Card className="border border-gray-200 rounded-lg shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Quantity:</span>
                <span className="text-lg">{totalQuantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Price:</span>
                <span className="text-lg">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex flex-col justify-between items-center mt-4">
                <Button
                  onClick={handleClearCart}
                  className="w-full bg-gray-500 text-white hover:bg-gray-600 px-4 py-2"
                >
                  Clear Cart
                </Button>
              </div>
              <StripeCheckOutButton products={products} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Cart;
