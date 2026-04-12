"use client";

import { useEffect, useState, use, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import QRCode from "react-qr-code";
import Header from "@/components/Header";
import { useCartDispatch } from "@/lib/CartContext";
import { useMenu } from "@/lib/MenuContext";
import { useAdmin } from "@/lib/AdminContext";
import "./item.css";

export default function ItemPage({ params }) {
  const resolvedParams = use(params);
  const { items } = useMenu();
  const { settings } = useAdmin();
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [toast, setToast] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  // Rating States
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // AR & QR States
  const [isARLaunching, setIsARLaunching] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [arStatus, setArStatus] = useState("initializing"); // initializing, ready, launching
  const [sparkles, setSparkles] = useState([]);
  
  const modelViewerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const dispatch = useCartDispatch();

  useEffect(() => {
    const found = items.find(i => i.id === resolvedParams.id);
    if (found) {
      setItem(found);
      setCurrentImgIndex(0); // Reset image index on item change
    }
  }, [resolvedParams.id, items]);

  const handleAddToCart = () => {
    if (!item) return;
    dispatch({
      type: "ADD_ITEM",
      item: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: (item.images && item.images[0]) || item.image,
        calories: item.calories,
      },
      quantity,
    });
    setShowModal(false);
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const handlePostReview = () => {
    setIsPosting(true);
    // Simulate API call
    setTimeout(() => {
      setIsPosting(false);
      setShowReviews(false);
      setUserRating(0);
      setReviewText("");
      alert("Thank you for your review!");
    }, 1500);
  };

  const handleARClick = () => {
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    if (isMobile) {
      setIsARLaunching(true);
      setArStatus("initializing");
    } else {
      setShowQRModal(true);
    }
  };

  // Auto-trigger AR once the model-viewer in the launcher is ready
  useEffect(() => {
    if (isARLaunching && modelViewerRef.current) {
      const mv = modelViewerRef.current;
      
      const onReady = () => {
        setArStatus("ready");
        setTimeout(() => {
          if (mv.activateAR) {
            mv.activateAR();
            setArStatus("launching");
          }
        }, 800);
      };

      const handleProgress = (event) => {
        if (event.detail.totalProgress === 1) {
          onReady();
        }
      };

      mv.addEventListener('progress', handleProgress);
      mv.addEventListener('load', onReady); // Fallback for cached models
      
      return () => {
        mv.removeEventListener('progress', handleProgress);
        mv.removeEventListener('load', onReady);
      };
    }
  }, [isARLaunching]);
  
  // Antigravity Animation Logic
  useEffect(() => {
    if (!isARLaunching || !modelViewerRef.current) return;
    const mv = modelViewerRef.current;

    const handleARStatus = (event) => {
      if (event.detail.status === 'session-started') {
        startEntranceAnimation();
      }
    };

    const triggerSparkles = () => {
      const newSparkles = Array.from({ length: 15 }).map((_, i) => ({
        id: Date.now() + i,
        left: 50 + (Math.random() - 0.5) * 40,
        top: 50 + (Math.random() - 0.5) * 40,
        scale: 0.5 + Math.random()
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 1500);
    };

    const startEntranceAnimation = () => {
      const startTime = performance.now();
      const duration = 1200; // slightly longer for smoother settle

      const animate = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        if (mv.model && mv.model.scene) {
          const model = mv.model;
          const scene = model.scene;

          let currentScale, currentY, currentRot;

          // Follow the requested keyframes (approximated)
          if (t < 0.4) {
            // Entrance & Overshoot phase
            const subT = t / 0.4;
            currentScale = subT * 1.15;
            currentY = -0.3 + (subT * 0.35); // Moves from -0.3 to +0.05
            currentRot = subT * Math.PI; // 0 to 180deg
            
            // Trigger sparkles near peak
            if (t > 0.35 && t < 0.38 && sparkles.length === 0) {
              triggerSparkles();
            }
          } else if (t < 0.7) {
            // Settle phase 1
            const subT = (t - 0.4) / 0.3;
            currentScale = 1.15 - (subT * 0.2); // Settle to 0.95
            currentY = 0.05 - (subT * 0.06); // Settle to -0.01
            currentRot = Math.PI + (subT * Math.PI * 0.83); // 180 to 330deg
          } else {
            // Final Settle phase
            const subT = (t - 0.7) / 0.3;
            currentScale = 0.95 + (subT * 0.05); // Settle to 1
            currentY = -0.01 + (subT * 0.01); // Settle to 0
            currentRot = (Math.PI * 1.83) + (subT * Math.PI * 0.17); // 330 to 360deg
          }

          model.scale.set(currentScale, currentScale, currentScale);
          scene.position.y = currentY;
          scene.rotation.y = currentRot;
        }

        if (t < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          startIdleFloat();
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const startIdleFloat = () => {
      const idleAnimate = (now) => {
        if (mv.model && mv.model.scene) {
          const bob = Math.sin(now / 1500) * 0.015; // ±1.5cm hover
          mv.model.scene.position.y = bob;
        }
        animationFrameRef.current = requestAnimationFrame(idleAnimate);
      };
      animationFrameRef.current = requestAnimationFrame(idleAnimate);
    };

    mv.addEventListener('ar-status', handleARStatus);
    return () => {
      mv.removeEventListener('ar-status', handleARStatus);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isARLaunching]);

  if (!item) {
    return (
      <div className="page">
        <Header showBack />
        <div className="item-loading">
          <div className="skeleton" style={{ width: "100%", height: 300 }} />
          <div className="container">
            <div className="skeleton" style={{ width: "60%", height: 32, marginTop: 24 }} />
          </div>
        </div>
      </div>
    );
  }

  // Navigation Logic (finding next/prev in same category)
  const categoryItems = items.filter(i => i.category === item.category);
  const currentIndex = categoryItems.findIndex(i => i.id === item.id);
  const prevItem = categoryItems[currentIndex - 1];
  const nextItem = categoryItems[currentIndex + 1];

  const allImages = item.images && item.images.length > 0
    ? item.images
    : item.image ? [item.image] : [];
  const hasMultiple = allImages.length > 1;
  const has3D = !!item.modelUrl;

  return (
    <div className="page">
      {has3D && (
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
      )}
      
      <Header showBack />

      <div className="item-page immersive-layout">
        <div className="item-viewer">
          <div className="image-container">
            {allImages.length > 0 ? (
              <Image
                src={allImages[currentImgIndex]}
                alt={item.name}
                width={800}
                height={600}
                className="main-item-image"
                priority
              />
            ) : (
              <div className="placeholder-viewer">🍽️</div>
            )}

            {/* Pagination Indicators */}
            {hasMultiple && (
              <div className="viewer-pagination">
                {allImages.map((_, i) => (
                  <div key={i} onClick={() => setCurrentImgIndex(i)} className={`pagination-dot ${i === currentImgIndex ? "active" : ""}`} />
                ))}
              </div>
            )}

            {/* Navigation Arrows (Sides) */}
            <div className="viewer-nav">
              {prevItem ? (
                <Link href={`/item/${prevItem.id}`} className="nav-arrow prev">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </Link>
              ) : <div />}
              
              {nextItem ? (
                <Link href={`/item/${nextItem.id}`} className="nav-arrow next">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </Link>
              ) : <div />}
            </div>
          </div>
        </div>

        <div className="item-details container">
          <div className="details-header-row">
             <div className="meta-left">
                <h1 className="item-name">{item.name}</h1>
                <div className="item-stats">
                   <span className="stat-cal">
                     🔥{" "}
                     {item.calories != null && item.calories !== "" && !Number.isNaN(Number(item.calories))
                       ? `${Number(item.calories)} kcal`
                       : "—"}
                   </span>
                </div>
             </div>
             <div className="item-price price price-large">
               {settings.currencySymbol}{item.price.toFixed(2)}
             </div>
          </div>

          <p className="item-description-refined">{item.description}</p>
          
          <div className="detail-section">
            <h3 className="section-label">Selected Ingredients</h3>
            <div className="ingredient-pills-refined">
              {(item.ingredients || []).map((ing, i) => {
                const colors = ["pill-gold", "pill-red", "pill-orange", "pill-green", "pill-blue"];
                return (
                  <span key={ing} className={`ingredient-pill ${colors[i % colors.length]}`}>
                    {ing}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="actions-stack">
            <button className="btn btn-gold btn-block btn-lg main-add-btn" onClick={() => setShowModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              ADD TO ORDER
            </button>

            {has3D && (
              <button className="btn-ar-action" onClick={handleARClick}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                Experience in your Space
              </button>
            )}
          </div>

          <div className="footer-review-link" onClick={() => setShowReviews(true)}>
            SHARE YOUR THOUGHTS <span className="chevron">^</span>
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      {showReviews && (
        <div className="modal-overlay" onClick={() => setShowReviews(false)}>
          <div className="modal-content review-form-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowReviews(false)}>✕</button>
            <h2 className="modal-title text-center">Rate this Dish</h2>
            
            <div className="star-rating-input">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  className={`star-btn ${userRating >= star ? "active" : ""}`}
                  onClick={() => setUserRating(star)}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea 
              className="review-textarea"
              placeholder="How was the taste?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            
            <button 
              className={`btn btn-gold btn-block ${isPosting ? "loading" : ""}`}
              disabled={isPosting || userRating === 0}
              style={{ marginTop: 24 }} 
              onClick={handlePostReview}
            >
              {isPosting ? "POSTING..." : "POST REVIEW"}
            </button>
          </div>
        </div>
      )}

      {/* AR Launcher Overlay */}
      {isARLaunching && (
        <div className="ar-launcher-overlay">
          <div className="ar-launcher-content">
            <button className="ar-launcher-close" onClick={() => setIsARLaunching(false)}>✕</button>
            <div className="ar-launcher-status">
              {(arStatus === "initializing" || arStatus === "ready") && (
                <div className="status-box">
                  <div className="mv-spinner" />
                  <h3>{arStatus === "initializing" ? "Refining View..." : "Launching AR..."}</h3>
                </div>
              )}
              {/* Sparkle Burst Overlay */}
              {sparkles.map(s => (
                <div 
                  key={s.id} 
                  className="ar-sparkle" 
                  style={{ 
                    left: `${s.left}%`, 
                    top: `${s.top}%`,
                    transform: `scale(${s.scale})`
                  }} 
                />
              ))}
            </div>
            <model-viewer
              ref={modelViewerRef}
              src={item.modelUrl}
              ar
              ar-modes="webxr scene-viewer quick-look"
              ar-placement="floor"
              camera-controls
              environment-image="neutral"
              exposure="1"
              shadow-intensity="1"
              auto-rotate
              style={{ width: '100%', height: '100%' }}
            >
              <button slot="ar-button" style={{ display: 'none' }}></button>
            </model-viewer>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content qr-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowQRModal(false)}>✕</button>
            <div className="qr-header">
              <div className="qr-icon">📱</div>
              <h2 className="modal-title">View on Phone</h2>
            </div>
            <div className="qr-container">
              <QRCode 
                value={typeof window !== 'undefined' ? window.location.href : ''} 
                size={200}
                fgColor="#00d4ff"
                bgColor="transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Qty Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            <h3 className="modal-title">{item.name}</h3>
            <div className="modal-qty-row">
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <div className="modal-total price">{settings.currencySymbol}{(item.price * quantity).toFixed(2)}</div>
            </div>
            <button className="btn btn-gold btn-block" onClick={handleAddToCart}>CONFIRM ADD</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">✓ Added {item.name}</div>}
    </div>
  );
}
