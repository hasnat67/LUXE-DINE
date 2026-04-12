"use client";

import { useAdmin } from "@/lib/AdminContext";

export default function FoodLabel({ name, price, animated = false }) {
  const { settings } = useAdmin();
  const sym = settings?.currencySymbol ?? "$";

  return (
    <div className={`ar-food-label ${animated ? "animate-fade-in-up" : ""}`}>
      <div className="ar-food-label-inner">
        <h3 className="ar-food-title">{name}</h3>
        <span className="ar-food-price">
          {sym}
          {Number(price).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
