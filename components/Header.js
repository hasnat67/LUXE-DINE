"use client";

import Link from "next/link";
import { useCart, getCartCount } from "@/lib/CartContext";
import { useAdmin } from "@/lib/AdminContext";

export default function Header({ showBack, backHref = "/menu", title }) {
  const cart = useCart();
  const count = cart ? getCartCount(cart.items) : 0;
  const { theme, toggleTheme } = useAdmin();

  return (
    <header className="header premium-header">
      <div className="header-inner">
        {showBack ? (
          <Link href={backHref} className="header-back-refined">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="back-text">{title || "Back"}</span>
          </Link>
        ) : (
          <Link href="/" className="header-logo">
            <span>LUXE</span> DINE
          </Link>
        )}

        <div className="header-actions">
          {theme && (
            <button 
              onClick={toggleTheme} 
              className="utility-btn" 
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          )}

          <Link href="/cart" className="utility-btn cart-trigger" aria-label="View Cart">
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {count > 0 && <span className="premium-badge">{count}</span>}
            </span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .premium-header {
          background: var(--bg-glass);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-bottom: var(--glass-border);
          display: flex;
          align-items: center;
        }
        .header-inner {
          display: flex;
          align-items: center;
          width: 100%;
          justify-content: space-between;
        }
        .header-back-refined {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .utility-btn {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
          position: relative;
          transition: all 0.2s;
        }
        .utility-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--gold);
        }
        .premium-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--gold-gradient);
          color: #000;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
          z-index: 10;
        }
      `}</style>
    </header>
  );
}
