"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"; // Import Dialog components
import Link from "next/link";

// Define the type for Order based on your updated database schema
type OrderType = {
  id: number;
  customerName: string;
  amountTotal: number;
  customerPhone: string;
  created: string;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderStatus: string;
  items: Array<{
    description: string;
    quantity: number;
    itemTotal: number;
  }>;
};

function OrderList() {
  // Use the defined OrderType for the state
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null); // State to manage selected order for dialog

  async function fetchOrders() {
    setLoading(true);
    try {
      const response = await fetch("/api/order", {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data); // Log the API response

        // Transform API data to match OrderType
        const transformedOrders: OrderType[] = data.map((order: any) => ({
          id: order.id,
          customerName: order.customerName,
          amountTotal: order.amountTotal,
          customerPhone: order.customerPhone,
          created: order.created,
          address: {
            line1: order.shippingAddress.address.line1 || "",
            city: order.shippingAddress.address.city || "",
            state: order.shippingAddress.address.state || "",
            postalCode: order.shippingAddress.address.postal_code || "",
            country: order.shippingAddress.address.country || "",
          },
          orderStatus: order.orderStatus,
          items: order.items, // Assuming this is how you receive items
        }));

        setOrders(transformedOrders);
      } else {
        console.error("Failed to retrieve orders:", response.statusText);
      }
    } catch (error) {
      console.error("Error retrieving orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: number, newStatus: string) {
    setUpdatingOrderId(orderId); // Set the current order ID that is being updated
    try {
      const response = await fetch("/api/order", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, newStatus }),
      });

      if (response.ok) {
        fetchOrders(); // Refresh the order list after updating status
      } else {
        console.error("Failed to update order status:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdatingOrderId(null); // Reset the updating order ID after operation completes
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="p-4">
      <div className="flex flex-row gap-2">
        <Link href={"/dashboard"}>
          <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        </Link>
        {">"}
        <h1 className="text-2xl font-bold mb-2">Orders</h1>
      </div>
      <Button onClick={fetchOrders} className="w-32 mb-6">
        Refresh Orders
      </Button>
      <Table className="w-full bg-white rounded-lg shadow-md">
        <TableHeader>
          <TableRow>
            <TableHead className="text-left text-gray-600 p-3">
              Order ID
            </TableHead>
            <TableHead className="text-left text-gray-600 p-3">
              Customer Name
            </TableHead>
            <TableHead className="text-left text-gray-600 p-3">Phone</TableHead>
            <TableHead className="text-left text-gray-600 p-3">
              Amount Total
            </TableHead>
            <TableHead className="text-left text-gray-600 p-3">
              Created
            </TableHead>
            <TableHead className="text-left text-gray-600 p-3">
              Order Status
            </TableHead>
            <TableHead className="text-left text-gray-600 p-3">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        {loading ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="p-3 text-center">
                Loading...
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-gray-50">
                <TableCell className="p-3">{order.id}</TableCell>
                <TableCell className="p-3">{order.customerName}</TableCell>
                <TableCell className="p-3">{order.customerPhone}</TableCell>
                <TableCell className="p-3">
                  ${(order.amountTotal / 100).toFixed(2)}
                </TableCell>

                <TableCell className="p-3">{order.created}</TableCell>
                <TableCell className="p-3">{order.orderStatus}</TableCell>
                <TableCell className="p-3">
                  <div className="flex space-x-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={updatingOrderId === order.id}
                        >
                          {updatingOrderId === order.id
                            ? "Updating..."
                            : "Update Status"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Select Status</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            updateOrderStatus(order.id, "processing")
                          }
                        >
                          Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateOrderStatus(order.id, "shipped")}
                        >
                          Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateOrderStatus(order.id, "delivered")
                          }
                        >
                          Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            updateOrderStatus(order.id, "cancelled")
                          }
                        >
                          Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="p-6 bg-white rounded-md shadow-lg">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold">
                            Order Details
                          </DialogTitle>
                          <DialogDescription className="text-sm text-gray-500">
                            Details for Order ID: {order.id}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 space-y-4">
                          <div>
                            <h3 className="font-semibold text-gray-700">
                              {order.created}
                            </h3>
                            <h3 className="font-semibold text-gray-700">
                              Customer Details
                            </h3>
                            <p className="text-gray-600">
                              Name: {order.customerName}
                            </p>
                            <p className="text-gray-600">
                              Phone: {order.customerPhone}
                            </p>
                            <p className="text-gray-600">
                              Address: {order.address.line1},{" "}
                              {order.address.city}, {order.address.state}{" "}
                              {order.address.postalCode},{" "}
                              {order.address.country}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-700">
                              Order Items
                            </h3>
                            <ul className="list-disc pl-5 text-gray-600">
                              {order.items.map((item, index) => (
                                <li key={index}>
                                  {item.description} - {item.quantity} x $
                                  {(item.itemTotal / 100).toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-700">
                              Order Status
                            </h3>
                            <p className="text-gray-600">{order.orderStatus}</p>
                          </div>
                        </div>
                        <DialogClose asChild>
                          <Button variant="outline" className="mt-4">
                            Close
                          </Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
}

export default OrderList;
