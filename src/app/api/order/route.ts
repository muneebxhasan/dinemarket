import { NextRequest, NextResponse } from "next/server";
import db, { Order } from "@/lib/db";
import { ensureTablesExist } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const { session_id } = await req.json();

    if (!session_id) {
      return new NextResponse("Session ID is required", { status: 400 });
    }

    // Retrieve the session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "customer", "payment_intent"],
    });

    if (!session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    const {
      amount_total,
      currency,
      payment_status,
      customer_details,
      shipping_details,
      line_items,
    } = session;

    const items = line_items?.data.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      itemTotal: item.amount_total,
    }));

    // Insert the order into the database
    const [order] = await db
      .insert(Order)
      .values({
        sessionId: session.id,
        amountTotal: amount_total || 0,
        currency: currency || "usd",
        paymentStatus: payment_status || "unpaid",
        orderStatus: "processing",
        customerEmail: customer_details?.email || null,
        customerName: customer_details?.name || null,
        customerPhone: customer_details?.phone || null,
        shippingAddress: shipping_details || null,
        items: items || [], // Store the items as JSONB
      })
      .returning();

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error creating order:", error);
    return new NextResponse("Database error", { status: 500 });
  }
}

// Route to get order(s)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("id");
    let phoneNumber = url.searchParams.get("phone");

    // console.log("orderId", orderId);
    // console.log("phoneNumber", phoneNumber);
    phoneNumber = "+" + phoneNumber;
    // console.log("phoneNumber", phoneNumber);
    if (orderId && phoneNumber) {
      // Fetch a specific order by ID and phone number
      const [order] = await db
        .select()
        .from(Order)
        .where(
          and(
            eq(Order.id, Number(orderId)),
            eq(Order.customerPhone, phoneNumber),
          ),
        );

      if (!order) {
        return new NextResponse("Order not found", { status: 404 });
      }

      return NextResponse.json(order);
    } else {
      // If no specific order is requested, fetch all orders
      let session = await auth();
      if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      const orders = await db.select().from(Order);
      return NextResponse.json(orders);
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new NextResponse("Database error", { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  } else {
    try {
      const { orderId, newStatus } = await req.json();

      // Validate inputs
      if (!orderId || !newStatus) {
        return new NextResponse("Missing orderId or newStatus", {
          status: 400,
        });
      }

      // Update the order status in the database
      const [updatedOrder] = await db
        .update(Order)
        .set({ orderStatus: newStatus })
        .where(eq(Order.id, Number(orderId)))
        .returning();

      if (!updatedOrder) {
        return new NextResponse("Order not found", { status: 404 });
      }

      return NextResponse.json({ updatedOrder });
    } catch (error) {
      console.error("Error updating order status:", error);
      return new NextResponse("Database error", { status: 500 });
    }
  }
}
