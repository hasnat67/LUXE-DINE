"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart, useCartDispatch } from "@/lib/CartContext";
import { useAdmin } from "@/lib/AdminContext";

export default function SwipeableFoodCard({ item, index, isLoaded, layout = "grid" }) {
  const cart = useCart();
  const dispatch = useCartDispatch();
  const { settings } = useAdmin();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);
  const containerRef = useRef(null);

  const threshold = -60; 
  const maxSwipe = -100;

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, maxSwipe));
    } else {
      setSwipeOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset < threshold) {
      setIsSwiped(true);
      setSwipeOffset(threshold - 20); 
    } else {
      setIsSwiped(false);
      setSwipeOffset(0);
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    dispatch({ type: "ADD_ITEM", item });
    
    setShowToast(true);
    setIsSwiped(false);
    setSwipeOffset(0);
    
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <div 
      className={`food-card-wrapper ${isLoaded ? "visible" : ""} ${layout}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      ref={containerRef}
    >
      <div className="swipe-action-bg">
        <button className="swipe-add-btn" onClick={handleQuickAdd}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add</span>
        </button>
      </div>

      <Link
        href={`/item/${item.id}`}
        className={`food-card ${layout}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transform: `translateX(${swipeOffset}px)`
        }}
      >
        <div className="food-card-image">
          <Image
            src={(item.images && item.images[0]) || item.image || "/images/classic-burger.png"}
            alt={item.name}
            width={400}
            height={300}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            priority={index < 4}
          />
        </div>

        <div className="food-card-info">
          <div className="card-top">
            <h3 className="food-card-name">{item.name}</h3>
            {layout === "list" && item.description && (
              <p className="food-card-description">{item.description}</p>
            )}
          </div>

          <div className="food-card-bottom">
            <div className="food-card-meta">
              <span className="food-card-price price">{settings.currencySymbol}{Number(item.price).toFixed(2)}</span>
              <span className="food-card-cal">
                {item.calories != null && item.calories !== "" && !Number.isNaN(Number(item.calories))
                  ? `${Number(item.calories)} kcal`
                  : "—"}
              </span>
            </div>

            <div className="food-card-ingredients">
              {(item.ingredients || []).slice(0, layout === 'list' ? 6 : 3).map((ing) => (
                <span key={ing} className="food-card-ing">
                  {ing}
                </span>
              ))}
              {(item.ingredients || []).length > (layout === 'list' ? 6 : 3) && (
                <span className="food-card-ing more">
                  +{(item.ingredients || []).length - (layout === 'list' ? 6 : 3)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="desktop-quick-add">
           <button onClick={handleQuickAdd} className="btn-quick-circle">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
               <line x1="12" y1="5" x2="12" y2="19"></line>
               <line x1="5" y1="12" x2="19" y2="12"></line>
             </svg>
           </button>
        </div>
        
        {showToast && (
          <div className="quick-add-toast">
            ✓
          </div>
        )}
      </Link>

      <style jsx>{`
        .btn-quick-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gold-gradient);
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
          transition: all 0.2s;
        }
        .btn-quick-circle:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow-glow);
        }
      `}</style>
    </div>
  );
}
