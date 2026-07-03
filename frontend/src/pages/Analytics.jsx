import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import api from "../utils/api";
import ProductImage from "../components/ProductImage";
import { IMAGE_SIZES } from "../utils/imageUtils";
import "../styles/Analytics.css";
import "../styles/Admin.css";

const RANGES = [
  { label: "7 Days",  value: "7d"  },
  { label: "30 Days", value: "30d" },
  { label: "3 Months",value: "3m"  },
  { label: "All Time",value: "all" },
];

// ── Custom Tooltip for charts ───────────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="tooltip-value" style={{ color: p.color }}>
          {p.name === "revenue" ? `₹${p.value.toLocaleString()}` : `${p.value} orders`}
        </div>
      ))}
    </div>
  );
}

// ── Status Badge ────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const labelMap = {
    pending: "Pending",
    placed: "Confirmed",
    ready: "Ready",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return (
    <span className={`status-badge ${status}`}>
      {labelMap[status] || status}
    </span>
  );
}

// ── KPI Card ────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, colorClass }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${colorClass}`}>{icon}</div>
      <div className="kpi-content">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [range, setRange]     = useState("30d");
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: result } = await api.get(`/analytics/summary?range=${range}`);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">⚠️ {error}</div>
      </div>
    );
  }

  const { kpis, dailySales, monthlySales, topProducts, statusDistribution, lowStockProducts, recentOrders } = data;

  // Decide which time-series to show: daily for 7d/30d, monthly for 3m/all
  const showMonthly = range === "3m" || range === "all";
  const timeSeriesData  = showMonthly ? monthlySales : dailySales;
  const timeSeriesLabel = showMonthly ? "label" : "date";

  return (
    <div className="analytics-page">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="analytics-header">
        <div className="analytics-header-left">
          <span className="admin-eyebrow">HomAura Admin</span>
          <Link to="/admin/products" className="analytics-back-btn">← Back to Dashboard</Link>
          <h1><span className="emoji">📊</span> Analytics Dashboard</h1>
          <nav className="admin-nav-tabs" aria-label="Admin navigation">
            <Link to="/admin/products" className="admin-nav-tab">Products</Link>
            <Link to="/admin/analytics" className="admin-nav-tab admin-nav-tab--active">Analytics</Link>
          </nav>
        </div>
        <div className="analytics-range-tabs">
          {RANGES.map((r) => (
            <button
              key={r.value}
              className={`range-tab ${range === r.value ? "active" : ""}`}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <div className="analytics-body">

        {/* ── KPI Cards ───────────────────────────────────────────── */}
        <div className="kpi-grid">
          <KpiCard
            icon="💰"
            label="Total Revenue"
            value={`₹${kpis.totalRevenue.toLocaleString()}`}
            sub="From non-cancelled orders"
            colorClass="green"
          />
          <KpiCard
            icon="🛒"
            label="Total Orders"
            value={kpis.totalOrders.toLocaleString()}
            sub={`Avg ₹${kpis.avgOrderValue.toLocaleString()} per order`}
            colorClass="blue"
          />
          <KpiCard
            icon="📦"
            label="Avg Order Value"
            value={`₹${kpis.avgOrderValue.toLocaleString()}`}
            sub="Per non-cancelled order"
            colorClass="purple"
          />
          <KpiCard
            icon="👥"
            label="Customers"
            value={kpis.totalCustomers.toLocaleString()}
            sub="Registered non-admin users"
            colorClass="pink"
          />
        </div>

        {/* ── Sales Trend + Status Donut ───────────────────────────── */}
        <div className="charts-row">
          {/* Area/Bar chart for sales trend */}
          <div className="chart-card">
            <h2 className="chart-title">
              📈 {showMonthly ? "Monthly" : "Daily"} Sales Trend
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timeSeriesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#5C6B47" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#5C6B47" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#B5654A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#B5654A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(58, 52, 43, 0.08)" />
                <XAxis
                  dataKey={timeSeriesLabel}
                  tick={{ fill: "var(--gray-400)", fontSize: 11 }}
                  tickFormatter={(v) => showMonthly ? v : v.slice(5)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="rev"
                  tick={{ fill: "var(--gray-400)", fontSize: 11 }}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="ord"
                  orientation="right"
                  tick={{ fill: "var(--gray-400)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  yAxisId="rev"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#5C6B47"
                  strokeWidth={2}
                  fill="url(#revGrad)"
                />
                <Area
                  yAxisId="ord"
                  type="monotone"
                  dataKey="orders"
                  stroke="#B5654A"
                  strokeWidth={2}
                  fill="url(#orderGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <span className="chart-legend-item">
                <span className="chart-legend-dot chart-legend-dot--revenue" />
                Revenue
              </span>
              <span className="chart-legend-item">
                <span className="chart-legend-dot chart-legend-dot--orders" />
                Orders
              </span>
            </div>
          </div>

          {/* Order Status Donut */}
          <div className="chart-card">
            <h2 className="chart-title">🍩 Order Status</h2>
            {statusDistribution.length === 0 ? (
              <div className="analytics-empty">No orders in this range</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background:"var(--color-card-bg)", border:"1px solid var(--color-border)", borderRadius:8, fontSize:12, boxShadow:"var(--shadow-md)" }}
                      itemStyle={{ color:"var(--color-text)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="status-legend">
                  {statusDistribution.map((s, i) => (
                    <div key={i} className="status-legend-item">
                      <span className="status-legend-dot" style={{ background: s.color }} />
                      <span className="status-legend-name">{s.name}</span>
                      <span className="status-legend-count">{s.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Monthly Bar Chart ───────────────────────────────────── */}
        <div className="chart-card-full">
          <h2 className="chart-title">📅 Monthly Revenue (Last 12 Months)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySales} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(58, 52, 43, 0.08)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--gray-400)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--gray-400)", fontSize: 11 }}
                tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background:"var(--color-card-bg)", border:"1px solid var(--color-border)", borderRadius:8, fontSize:12, boxShadow:"var(--shadow-md)" }}
                itemStyle={{ color:"var(--color-primary)" }}
                formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
                labelStyle={{ color:"var(--gray-500)", marginBottom:4 }}
              />
              <Bar dataKey="revenue" fill="#5C6B47" radius={[4,4,0,0]} maxBarSize={50}>
                {monthlySales.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === monthlySales.length - 1 ? "#7A8B62" : "#5C6B47"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Bottom Row: Top Products + Low Stock ────────────────── */}
        <div className="bottom-row">
          {/* Top 5 Products */}
          <div className="chart-card">
            <h2 className="chart-title">🏆 Top 5 Products (by Units Sold)</h2>
            {topProducts.length === 0 ? (
              <div className="analytics-empty">No sales data in this range</div>
            ) : (
              <div>
                {topProducts.map((p, i) => (
                  <div key={p.id} className="top-product-row">
                    <span className="top-product-rank">#{i + 1}</span>
                    <ProductImage
                      product={p}
                      width={IMAGE_SIZES.thumb}
                      alt={p.name}
                      className="top-product-img"
                    />
                    <div className="top-product-info">
                      <div className="top-product-name">{p.name}</div>
                      <div className="top-product-cat">{p.category}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div className="top-product-units">{p.unitsSold} sold</div>
                      <div className="top-product-rev">₹{p.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="chart-card">
            <h2 className="chart-title">⚠️ Low Stock Alerts</h2>
            {lowStockProducts.length === 0 ? (
              <div className="analytics-empty">✅ All products have healthy stock</div>
            ) : (
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ maxWidth:130, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {p.name}
                      </td>
                      <td style={{ color:"var(--gray-500)", fontSize:"0.8rem" }}>{p.category}</td>
                      <td>
                        <span className={p.stock === 0 ? "stock-critical" : p.stock < 5 ? "stock-warning" : "stock-ok"}>
                          {p.stock === 0 ? "Out of stock" : p.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Recent Orders ────────────────────────────────────────── */}
        <div className="chart-card-full">
          <h2 className="chart-title">🕐 Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <div className="analytics-empty">No orders yet</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="analytics-order-id">#{o.id}</td>
                      <td>
                        <div style={{ fontWeight:600 }}>{o.customerName}</div>
                        <div className="analytics-customer-email">{o.customerEmail}</div>
                      </td>
                      <td>{o.items}</td>
                      <td className="analytics-order-total">₹{o.total.toLocaleString()}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="analytics-order-date">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          day:"numeric", month:"short", year:"numeric"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
