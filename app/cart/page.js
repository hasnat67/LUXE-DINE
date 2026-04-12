"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useCart, useCartDispatch, getCartTotal } from "@/lib/CartContext";
import { useOrders } from "@/lib/OrderContext";
import { useAdmin } from "@/lib/AdminContext";
import "./cart.css";

export default function CartPage() {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const router = useRouter();
  const { placeOrder } = useOrders();
  const { settings } = useAdmin();
  const [instructions, setInstructions] = useState(cart?.specialInstructions || "");
  const [tableNumber, setTableNumber] = useState(cart?.tableNumber || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="page">
        <Header showBack />
        <div className="cart-empty">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Explore our menu and add some delicious items</p>
          <button className="btn btn-gold" onClick={() => router.push("/menu")}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal(cart.items);
  const taxRate = settings.taxRate ?? 0.08;
  const serviceChargeRate = settings.serviceCharge ?? 0.05;
  
  const tax = subtotal * taxRate;
  const serviceCharge = subtotal * serviceChargeRate;
  const total = subtotal + tax + serviceCharge;

  const handlePlaceOrder = async () => {
    const normalizedTableNumber = String(tableNumber || "").trim();
    if (isSubmitting || !normalizedTableNumber) return;

    setIsSubmitting(true);
    dispatch({ type: "SET_TABLE", tableNumber: normalizedTableNumber });
    dispatch({ type: "SET_INSTRUCTIONS", instructions });

    try {
      const { order: newOrder, error: orderError } = await placeOrder(
        cart.items,
        subtotal,
        tax,
        serviceCharge,
        total,
        normalizedTableNumber,
        instructions
      );

      if (!newOrder?.id) {
        alert(
          orderError ||
            "Failed to send order to the kitchen. Check .env.local (Supabase keys), add SUPABASE_SERVICE_ROLE_KEY from your Supabase dashboard, and run supabase/seed.js so tables exist."
        );
        return;
      }

      try {
        localStorage.setItem("luxe-dine-active-order", JSON.stringify({ id: newOrder.id }));
      } catch (storageError) {
        console.warn("Could not persist active order to localStorage:", storageError);
      }

      dispatch({ type: "CLEAR_CART" });
      router.push(`/order-status?id=${newOrder.id}`);
    } catch (err) {
      console.error("Order placement error:", err);
      alert("An unexpected error occurred. Please try again or notify a waiter.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Header showBack />

      <div className="cart-page container">
        <div className="cart-header">
          <h1 className="cart-title">
            Your <span className="gold-text">Order</span>
          </h1>
          <p className="cart-subtitle">{cart.items.length} item{cart.items.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Cart Items */}
        <div className="cart-items">
          {cart.items.map((item) => {
            const imageSrc =
              typeof item.image === "string" && item.image.trim() !== ""
                ? item.image.trim()
                : null;

            return (
            <div key={item.id} className="cart-item animate-fade-in-up">
              <div className="cart-item-image">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={item.name}
                    width={80}
                    height={80}
                    style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "var(--radius-md)" }}
                  />
                ) : (
                  <div
                    className="cart-item-image-placeholder"
                    role="img"
                    aria-label={item.name}
                  >
                    <span aria-hidden="true">🍽️</span>
                  </div>
                )}
              </div>
              <div className="cart-item-info">
                <h3 className="cart-item-name">{item.name}</h3>
                <span className="cart-item-cal">
                  {item.calories != null && item.calories !== "" && !Number.isNaN(Number(item.calories))
                    ? `${Number(item.calories)} kcal`
                    : "—"}
                </span>
                <div className="cart-item-bottom">
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_QUANTITY",
                          id: item.id,
                          quantity: item.quantity - 1,
                        })
                      }
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() =>
                        dispatch({
                          type: "UPDATE_QUANTITY",
                          id: item.id,
                          quantity: item.quantity + 1,
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                  <span className="price">{settings.currencySymbol}{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
              <button
                className="cart-item-remove"
                onClick={() => dispatch({ type: "REMOVE_ITEM", id: item.id })}
                aria-label="Remove item"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            );
          })}
        </div>

        <div className="divider" />

        {/* Table Number */}
        <div className="cart-section">
          <label className="cart-label">Table Number</label>
          <input
            type="text"
            className="cart-input"
            placeholder="Enter your table number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        </div>

        {/* Special Instructions */}
        <div className="cart-section">
          <label className="cart-label">Special Instructions</label>
          <textarea
            className="cart-textarea"
            placeholder="Any allergies, preferences, or special requests..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
          />
        </div>

        <div className="divider" />

        {/* Price Breakdown */}
        <div className="price-breakdown">
          <div className="price-row">
            <span>Subtotal</span>
            <span>{settings.currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>Tax ({(settings.taxRate * 100).toFixed(0)}%)</span>
            <span>{settings.currencySymbol}{tax.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>Service Charge ({(settings.serviceCharge * 100).toFixed(0)}%)</span>
            <span>{settings.currencySymbol}{serviceCharge.toFixed(2)}</span>
          </div>
          <div className="divider" />
          <div className="price-row price-total">
            <span>Total</span>
            <span className="price price-large">{settings.currencySymbol}{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Place Order */}
        <button
          className="btn btn-gold btn-block btn-lg place-order-btn"
          onClick={handlePlaceOrder}
          disabled={!tableNumber || isSubmitting}
          style={{ opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? "PLACING ORDER..." : "PLACE ORDER"}
        </button>

        {!tableNumber && (
          <p className="cart-warning">Please enter your table number to place the order</p>
        )}
      </div>
    </div>
  );
}
