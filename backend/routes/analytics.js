import express from "express";
import prisma from "../prisma/client.js";
import auth from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Helper: get date range start based on filter
function getDateRangeStart(range) {
  const now = new Date();
  switch (range) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "3m":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "all":
    default:
      return null;
  }
}

// Helper: format date as YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Helper: format date as YYYY-MM (month)
function formatMonth(date) {
  return date.toISOString().slice(0, 7);
}

// GET /api/analytics/summary?range=7d|30d|3m|all
router.get("/summary", auth, adminMiddleware, async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const startDate = getDateRangeStart(range);

    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {};
    const nonCancelledFilter = {
      ...dateFilter,
      status: { not: "cancelled" },
    };

    // ── 1. Fetch all relevant orders (non-cancelled) ──────────────────────
    const orders = await prisma.order.findMany({
      where: nonCancelledFilter,
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, category: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // ── 2. Fetch ALL orders for status distribution ───────────────────────
    const allOrders = await prisma.order.findMany({
      where: dateFilter,
      select: { status: true },
    });

    // ── 3. Total customers ────────────────────────────────────────────────
    const totalCustomers = await prisma.user.count({
      where: {
        isAdmin: false,
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
    });

    // ── 4. Products with low stock ────────────────────────────────────────
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 10 } },
      select: { id: true, name: true, stock: true, imageUrl: true, category: true },
      orderBy: { stock: "asc" },
      take: 10,
    });

    // ── 5. Recent orders (latest 10 including cancelled) ──────────────────
    const recentOrders = await prisma.order.findMany({
      where: dateFilter,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // ── 6. Compute KPIs from non-cancelled orders ─────────────────────────
    const totalRevenue = orders.reduce((sum, o) => {
      return sum + o.items.reduce((s, item) => s + item.price * item.quantity, 0);
    }, 0);

    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // ── 7. Daily sales breakdown ──────────────────────────────────────────
    const dailyMap = {};
    orders.forEach((order) => {
      const day = formatDate(new Date(order.createdAt));
      if (!dailyMap[day]) dailyMap[day] = { date: day, revenue: 0, orders: 0 };
      dailyMap[day].orders += 1;
      dailyMap[day].revenue += order.items.reduce(
        (s, item) => s + item.price * item.quantity,
        0
      );
    });

    // Fill missing days with 0 if range is <= 30d
    const dailySales = [];
    if (startDate && (range === "7d" || range === "30d")) {
      const days = range === "7d" ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = formatDate(d);
        dailySales.push(
          dailyMap[key] || { date: key, revenue: 0, orders: 0 }
        );
      }
    } else {
      dailySales.push(...Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date)));
    }

    // ── 8. Monthly sales breakdown ────────────────────────────────────────
    const monthlyMap = {};
    orders.forEach((order) => {
      const month = formatMonth(new Date(order.createdAt));
      if (!monthlyMap[month]) monthlyMap[month] = { month, revenue: 0, orders: 0 };
      monthlyMap[month].orders += 1;
      monthlyMap[month].revenue += order.items.reduce(
        (s, item) => s + item.price * item.quantity,
        0
      );
    });

    // Always show last 12 months for monthly chart
    const monthlySales = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = formatMonth(d);
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
      monthlySales.push(
        monthlyMap[key]
          ? { ...monthlyMap[key], label }
          : { month: key, revenue: 0, orders: 0, label }
      );
    }

    // ── 9. Top products by quantity sold ─────────────────────────────────
    const productMap = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const pid = item.productId;
        if (!productMap[pid]) {
          productMap[pid] = {
            id: pid,
            name: item.product?.name || `Product #${pid}`,
            imageUrl: item.product?.imageUrl || "",
            category: item.product?.category || "",
            unitsSold: 0,
            revenue: 0,
          };
        }
        productMap[pid].unitsSold += item.quantity;
        productMap[pid].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // ── 10. Order status distribution ─────────────────────────────────────
    const statusCount = {};
    allOrders.forEach((o) => {
      statusCount[o.status] = (statusCount[o.status] || 0) + 1;
    });

    const statusDistribution = [
      { name: "Pending", value: statusCount["pending"] || 0, color: "#f59e0b" },
      { name: "Confirmed", value: statusCount["placed"] || 0, color: "#3b82f6" },
      { name: "Ready", value: statusCount["ready"] || 0, color: "#8b5cf6" },
      { name: "Out for Delivery", value: statusCount["out_for_delivery"] || 0, color: "#f97316" },
      { name: "Delivered", value: statusCount["delivered"] || 0, color: "#10b981" },
      { name: "Cancelled", value: statusCount["cancelled"] || 0, color: "#ef4444" },
    ].filter((s) => s.value > 0);

    // ── Return ─────────────────────────────────────────────────────────────
    res.json({
      kpis: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalCustomers,
      },
      dailySales,
      monthlySales,
      topProducts,
      statusDistribution,
      lowStockProducts,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: o.user?.name || "Guest",
        customerEmail: o.user?.email || "",
        status: o.status,
        items: o.items.length,
        total: o.items.reduce((s, item) => s + item.price * item.quantity, 0),
        createdAt: o.createdAt,
      })),
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;
