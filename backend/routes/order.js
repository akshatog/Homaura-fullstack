import express from "express";
import prisma from "../prisma/client.js";
import auth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { sendOrderEmail } from "../utils/sendEmail.js";

const router = express.Router();

// GET all orders — admin only
router.get("/", auth, adminMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user/:userId", auth, async (req, res) => {
  try {
    // Always use the JWT-verified user ID — ignore the URL param to prevent IDOR
    const userId = req.user.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    console.error("Fetch user orders error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:orderId", auth, async (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  if (isNaN(orderId)) return res.status(400).json({ error: "Invalid order ID" });

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Ownership check — a regular user can only see their own orders
    if (order.userId !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json(order);
  } catch (err) {
    console.error("Fetch order error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    // Always derive userId from the verified JWT — never trust req.body.userId
    const userId = req.user.userId;
    const { items, customerDetails } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items array is required and must not be empty" });
    }

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({ error: "Each item must have productId and quantity > 0" });
      }
    }

    const customerMessage = customerDetails
      ? [
        "Order received and confirmed.",
        "",
        customerDetails.fullName ? `Name: ${customerDetails.fullName}` : "",
        customerDetails.phone ? `Phone: ${customerDetails.phone}` : "",
        customerDetails.email ? `Email: ${customerDetails.email}` : "",
        customerDetails.address ? `Address: ${customerDetails.address}` : "",
        customerDetails.city ? `City: ${customerDetails.city}` : "",
        customerDetails.state ? `State: ${customerDetails.state}` : "",
        customerDetails.pincode ? `Pincode: ${customerDetails.pincode}` : "",
      ]
        .filter(Boolean)
        .join("\n")
      : "Order received and confirmed";

    // Use a transaction so stock check + decrement is atomic — prevents race conditions
    const order = await prisma.$transaction(async (tx) => {
      // Validate stock for every item inside the transaction
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: parseInt(item.productId) },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: parseInt(userId),
          status: "pending",
          message: customerMessage,
          items: {
            create: items.map((item) => ({
              productId: parseInt(item.productId),
              quantity: parseInt(item.quantity),
              price: item.price || 0,
            })),
          },
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true, price: true, imageUrl: true } },
            },
          },
        },
      });

      // Decrement stock inside the same transaction
      for (const item of items) {
        await tx.product.update({
          where: { id: parseInt(item.productId) },
          data: { stock: { decrement: parseInt(item.quantity) } },
        });
      }

      return newOrder;
    });

    sendOrderEmail(order).catch((emailErr) =>
      console.error("Order email error:", emailErr)
    );

    res.status(201).json(order);
  } catch (err) {
    console.error("Create order error:", err);
    // Surface our own controlled stock/not-found messages as 400;
    // everything else is an unexpected server error
    const isClientError = err.message.includes("not found") || err.message.includes("Insufficient stock");
    if (isClientError) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update order status — admin only
router.put("/:orderId", auth, adminMiddleware, async (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  if (isNaN(orderId)) return res.status(400).json({ error: "Invalid order ID" });

  try {
    const { status, message } = req.body;

    const validStatuses = ["pending", "placed", "ready", "out_for_delivery", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (status === "cancelled" && existingOrder.status !== "cancelled") {
      for (const item of existingOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
        console.log(`✅ Stock restored for product ${item.product.name}: +${item.quantity} (Order #${orderId} cancelled)`);
      }
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        message: message || getDefaultMessage(status),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (status === "out_for_delivery") {
      const { sendOutForDeliveryEmail } = await import("../utils/sendEmail.js");
      sendOutForDeliveryEmail(order).catch((emailErr) =>
        console.error("Out for delivery email error:", emailErr)
      );
    } else if (status === "cancelled") {
      const { sendOrderCancellationEmail } = await import("../utils/sendEmail.js");
      sendOrderCancellationEmail(order, message).catch((emailErr) =>
        console.error("Cancellation email error:", emailErr)
      );
    }

    res.json(order);
  } catch (err) {
    console.error("Update order error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

function getDefaultMessage(status) {
  const messages = {
    pending: "Your order has been received.",
    placed: "Your order has been confirmed and is being prepared.",
    ready: "Your order is ready for pickup/shipment!",
    out_for_delivery: "Your order is out for delivery. It will arrive soon!",
    delivered: "Your order has been delivered. Thank you for shopping!",
    cancelled: "Your order has been cancelled.",
  };
  return messages[status] || "Order status updated";
}

export default router;
