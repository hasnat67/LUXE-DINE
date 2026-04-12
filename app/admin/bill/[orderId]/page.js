"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useOrders, mapOrderFromDB } from "@/lib/OrderContext";
import { useAdmin } from "@/lib/AdminContext";
import "@/app/receipt/receipt.css";

function AdminBillContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = typeof params.orderId === "string" ? params.orderId : params.orderId?.[0];
  const { orders, refreshOrders } = useOrders();
  const { settings } = useAdmin();

  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [fetchState, setFetchState] = useState("loading"); // loading | ok | notfound | config

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    if (!orderId) {
      setFetchState("notfound");
      return;
    }

    let cancelled = false;
    setFetchState("loading");
    setFetchedOrder(null);

    (async () => {
      try {
        const res = await fetch(
          `/api/admin/orders?id=${encodeURIComponent(orderId)}`,
          { cache: "no-store" }
        );
        const json = await res.json().catch(() => ({}));

        if (cancelled) return;

        if (res.status === 503) {
          setFetchState("config");
          return;
        }

        if (res.ok && json.order) {
          setFetchedOrder(mapOrderFromDB(json.order));
          setFetchState("ok");
          return;
        }

        setFetchState("notfound");
      } catch {
        if (!cancelled) setFetchState("notfound");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const order = useMemo(() => {
    if (!orderId) return null;
    const fromList = orders.find((o) => o.id === orderId);
    return fromList || fetchedOrder;
  }, [orderId, orders, fetchedOrder]);

  useEffect(() => {
    if (!order || !searchParams.get("print")) return;
    const t = setTimeout(() => window.print(), 900);
    return () => clearTimeout(t);
  }, [order, searchParams]);

  const totals = useMemo(() => {
    if (!order?.items?.length) {
      return {
        subtotal: 0,
        tax: Number(order?.tax ?? 0),
        service: Number(order?.service_charge ?? 0),
        total: Number(order?.total ?? 0),
      };
    }
    const subtotal = order.items.reduce(
      (sum, item) =>
        sum +
        (Number(item.price) || 0) * (Number(item.qty ?? item.quantity) || 1),
      0
    );
    const tax = Number(order.tax ?? 0);
    const service = Number(order.service_charge ?? 0);
    const total = Number(
      order.total ?? order.total_price ?? subtotal + tax + service
    );
    return { subtotal, tax, service, total };
  }, [order]);

  const handlePrint = () => window.print();

  if (fetchState === "loading" || (fetchState === "ok" && !order)) {
    return (
      <div className="page receipt-page-wrapper admin-bill-page" style={{ paddingTop: 48 }}>
        <div className="spinner" style={{ margin: "auto" }} />
        <p className="text-secondary" style={{ textAlign: "center", marginTop: 16 }}>
          Loading bill…
        </p>
      </div>
    );
  }

  if (fetchState === "config") {
    return (
      <div className="page receipt-page-wrapper admin-bill-page">
        <div className="receipt-empty">
          <div className="receipt-empty-icon">⚙️</div>
          <h2>Server configuration</h2>
          <p className="text-secondary" style={{ maxWidth: 360, margin: "0 auto" }}>
            Add <strong>SUPABASE_SERVICE_ROLE_KEY</strong> to <code>.env.local</code> so bills can load from the database, then restart the dev server.
          </p>
          <button
            type="button"
            className="btn btn-gold mt-4"
            onClick={() => router.push("/admin/orders")}
          >
            Back to Live Orders
          </button>
        </div>
      </div>
    );
  }

  if (fetchState === "notfound" || !order) {
    return (
      <div className="page receipt-page-wrapper admin-bill-page">
        <div className="receipt-empty">
          <div className="receipt-empty-icon">📋</div>
          <h2>Order not found</h2>
          <p className="text-secondary">
            This order may have been removed or the link is invalid.
          </p>
          <button
            type="button"
            className="btn btn-gold mt-4"
            onClick={() => router.push("/admin/orders")}
          >
            Back to Live Orders
          </button>
        </div>
      </div>
    );
  }

  const sym = settings.currencySymbol ?? "$";
  const created = new Date(order.createdAt);
  const servedAt = order.updatedAt ? new Date(order.updatedAt) : created;
  const taxPct = (settings.taxRate ?? 0) * 100;
  const svcPct = (settings.serviceCharge ?? 0) * 100;

  return (
    <div className="page receipt-page-wrapper admin-bill-page">
      <div className="order-success animate-scale-in no-print" style={{ marginBottom: 8 }}>
        <h1 className="success-title" style={{ fontSize: 22 }}>
          Customer bill
        </h1>
        <p className="success-subtitle">Print for the guest after the order is served</p>
      </div>

      <div className="receipt-card animate-fade-in-up bill-print-root">
        <div className="receipt-header">
          <div className="receipt-logo">
            <span className="gold-text">{settings.name || "LUXE DINE"}</span>
          </div>
          <p className="receipt-tagline">{settings.tagline || "Fine Dining Experience"}</p>
          <div className="receipt-divider-fancy">
            <span className="receipt-star">◆</span>
          </div>
        </div>

        <div className="receipt-info-grid">
          <div className="receipt-info-item">
            <span className="receipt-label">Order #</span>
            <span className="receipt-value" style={{ fontSize: 11, wordBreak: "break-all" }}>
              {order.id}
            </span>
          </div>
          <div className="receipt-info-item">
            <span className="receipt-label">Table</span>
            <span className="receipt-value">{order.tableNumber || "—"}</span>
          </div>
          <div className="receipt-info-item">
            <span className="receipt-label">Ordered</span>
            <span className="receipt-value">
              {created.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="receipt-info-item">
            <span className="receipt-label">Status</span>
            <span className="receipt-value" style={{ textTransform: "capitalize" }}>
              {order.status}
            </span>
          </div>
        </div>

        {order.status === "served" && (
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--text-tertiary)",
              marginBottom: 12,
            }}
          >
            Served at{" "}
            {servedAt.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}

        <div className="receipt-divider" />

        <div className="receipt-items">
          <div className="receipt-items-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
          </div>
          {order.items.map((item, idx) => {
            const qty = Number(item.qty ?? item.quantity) || 1;
            const line = (Number(item.price) || 0) * qty;
            return (
              <div key={item.id || idx} className="receipt-item-row">
                <span className="receipt-item-name">{item.name}</span>
                <span className="receipt-item-qty">×{qty}</span>
                <span className="receipt-item-price">
                  {sym}
                  {line.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="receipt-divider" />

        <div className="receipt-totals">
          <div className="receipt-total-row">
            <span>Subtotal</span>
            <span>
              {sym}
              {totals.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="receipt-total-row">
            <span>Tax ({taxPct.toFixed(0)}%)</span>
            <span>
              {sym}
              {totals.tax.toFixed(2)}
            </span>
          </div>
          <div className="receipt-total-row">
            <span>Service ({svcPct.toFixed(0)}%)</span>
            <span>
              {sym}
              {totals.service.toFixed(2)}
            </span>
          </div>
          <div className="receipt-divider" />
          <div className="receipt-total-row receipt-grand-total">
            <span>Total</span>
            <span>
              {sym}
              {totals.total.toFixed(2)}
            </span>
          </div>
        </div>

        {order.instructions ? (
          <>
            <div className="receipt-divider" />
            <div className="receipt-notes">
              <span className="receipt-label">Special Instructions</span>
              <p>{order.instructions}</p>
            </div>
          </>
        ) : null}

        <div className="receipt-footer">
          <div className="receipt-divider-fancy">
            <span className="receipt-star">◆</span>
          </div>
          <p className="receipt-thankyou">Thank you for dining with us!</p>
          <p className="receipt-visit">We hope to see you again soon</p>
        </div>
      </div>

      <div className="receipt-actions no-print">
        <button type="button" className="btn btn-gold btn-block" onClick={handlePrint}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          PRINT BILL
        </button>
        <Link href="/admin/orders" className="btn btn-outline btn-block" style={{ textAlign: "center" }}>
          Back to Live Orders
        </Link>
      </div>
    </div>
  );
}

export default function AdminBillPage() {
  return (
    <Suspense
      fallback={
        <div className="page dark-page" style={{ padding: 48 }}>
          <div className="spinner" style={{ margin: "auto" }} />
        </div>
      }
    >
      <AdminBillContent />
    </Suspense>
  );
}
