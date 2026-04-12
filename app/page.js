"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./landing.css";

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    // If accessed via QR code with table param, redirect to menu
    const params = new URLSearchParams(window.location.search);
    if (params.get("table")) {
      window.location.href = `/menu?table=${params.get("table")}`;
    }
  }, []);

  return (
    <div className="landing">
      {/* Ambient particles */}
      <div className="particles">
        {loaded && Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Gold accent lines */}
      <div className="accent-lines">
        <div className="accent-line accent-line-1" />
        <div className="accent-line accent-line-2" />
      </div>

      <div className={`landing-content ${loaded ? "visible" : ""}`}>
        {/* Logo emblem */}
        <div className="emblem">
          <div className="emblem-ring">
            <div className="emblem-inner">
              <span>🍽️</span>
            </div>
          </div>
        </div>

        {/* Restaurant Name */}
        <h1 className="landing-title">
          <span className="title-luxe">LUXE</span>
          <span className="title-dine">DINE</span>
        </h1>

        <p className="landing-subtitle">A Culinary Experience Beyond Imagination</p>

        {/* Feature badges */}
        <div className="landing-features">
          <div className="feature-badge">
            <span className="feature-icon">📱</span>
            <span>Scan & Browse</span>
          </div>
          <div className="feature-badge">
            <span className="feature-icon">🥽</span>
            <span>View in AR</span>
          </div>
          <div className="feature-badge">
            <span className="feature-icon">🛒</span>
            <span>Order & Pay</span>
          </div>
        </div>

        <p className="landing-description">
          Explore our gourmet menu in stunning 3D. See every dish come to life
          on your table with augmented reality before you order.
        </p>

        <Link href="/menu" className="btn btn-gold btn-lg landing-cta">
          <span>Explore Menu</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        <div className="landing-footer">
          <span className="footer-line" />
          <span className="footer-text">Est. 2024 · Fine Dining</span>
          <span className="footer-line" />
        </div>
      </div>
    </div>
  );
}
