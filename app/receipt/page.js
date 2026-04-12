"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/lib/AdminContext";
import "./receipt.css";

export default function ReceiptPage() {
  const [order, setOrder] = useState(null);
  const router = useRouter();
  const { settings } = useAdmin();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("luxe-dine-last-order");
      if (saved) {
        setOrder(JSON.parse(saved));
      }
    } catch (e) {
      console.log("No order found");
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleNewOrder = () => {
    router.push("/menu");
  };

  if (!order) {
    return (
      <div className="page receipt-page-wrapper">
        <div className="receipt-empty">
          <div className="receipt-empty-icon">📋</div>
          <h2>No Recent Order</h2>
          <p>Place an order to see your receipt here</p>
          <button className="btn btn-gold" onClick={() => router.push("/menu")}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.timestamp);

  return (
    <div className="page receipt-page-wrapper">
      {/* Success Animation */}
      <div className="order-success animate-scale-in">
        <div className="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h1 className="success-title">Order Placed!</h1>
        <p className="success-subtitle">Your order has been sent to the kitchen</p>
      </div>

      {/* Receipt Card */}
      <div className="receipt-card animate-fade-in-up">
        {/* Receipt Header */}
        <div className="receipt-header">
          <div className="receipt-logo">
            <span className="gold-text">LUXE</span> DINE
          </div>
          <p className="receipt-tagline">Fine Dining Experience</p>
          <div className="receipt-divider-fancy">
            <span className="receipt-star">◆</span>
          </div>
        </div>

        {/* Order Info */}
        <div className="receipt-info-grid">
          <div className="receipt-info-item">
            <span className="receipt-label">Order #</span>
            <span className="receipt-value">{order.orderId}</span>
          </div>
          <div className="receipt-info-item">
            <span className="receipt-label">Table</span>
            <span className="receipt-value">{order.tableNumber || "—"}</span>
          </div>
          <div className="receipt-info-item">
            <span className="receipt-label">Date</span>
            <span className="receipt-value">
              {orderDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div className="receipt-info-item">
            <span className="receipt-label">Time</span>
            <span className="receipt-value">
              {orderDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        <div className="receipt-divider" />

        {/* Items */}
        <div className="receipt-items">
          <div className="receipt-items-header">
            <span>Item</span>
            <span>Qty</span>
            <span>Price</span>
          </div>
          {order.items.map((item) => (
            <div key={item.id} className="receipt-item-row">
              <span className="receipt-item-name">{item.name}</span>
              <span className="receipt-item-qty">×{item.quantity}</span>
              <span className="receipt-item-price">
                {settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="receipt-divider" />

        {/* Totals */}
        <div className="receipt-totals">
          <div className="receipt-total-row">
            <span>Subtotal</span>
            <span>{settings.currencySymbol}{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="receipt-total-row">
            <span>Tax ({(settings.taxRate * 100).toFixed(0)}%)</span>
            <span>{settings.currencySymbol}{order.tax.toFixed(2)}</span>
          </div>
          <div className="receipt-total-row">
            <span>Service ({(settings.serviceCharge * 100).toFixed(0)}%)</span>
            <span>{settings.currencySymbol}{order.serviceCharge.toFixed(2)}</span>
          </div>
          <div className="receipt-divider" />
          <div className="receipt-total-row receipt-grand-total">
            <span>Total</span>
            <span>{settings.currencySymbol}{order.total.toFixed(2)}</span>
          </div>
        </div>

        {order.specialInstructions && (
          <>
            <div className="receipt-divider" />
            <div className="receipt-notes">
              <span className="receipt-label">Special Instructions</span>
              <p>{order.specialInstructions}</p>
            </div>
          </>
        )}

        {/* Receipt Footer */}
        <div className="receipt-footer">
          <div className="receipt-divider-fancy">
            <span className="receipt-star">◆</span>
          </div>
          <p className="receipt-thankyou">Thank you for dining with us!</p>
          <p className="receipt-visit">We hope to see you again soon</p>
        </div>
      </div>

      {/* Actions */}
      <div className="receipt-actions no-print">
        <button className="btn btn-gold btn-block" onClick={handlePrint}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          PRINT RECEIPT
        </button>
        <button className="btn btn-outline btn-block" onClick={handleNewOrder}>
          ORDER AGAIN
        </button>
      </div>
    </div>
  );
}
