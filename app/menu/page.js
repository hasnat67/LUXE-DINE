"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import { useMenu } from "@/lib/MenuContext";
import SwipeableFoodCard from "./components/SwipeableFoodCard";
import "./menu.css";

export default function MenuPage() {
  const { items: allItems, categories } = useMenu();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  
  const [displayItems, setDisplayItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const categoryScrollRef = useRef(null);
  const headerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Detect sticky state for compact header using IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel is NOT intersecting (out of view above the top), make header sticky
        setIsSticky(!entry.isIntersecting);
      },
      { 
        threshold: 0,
        rootMargin: '-80px 0px 0px 0px' // Offset by header height
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let filtered = allItems;
    
    // Filter by availability
    filtered = filtered.filter(item => item.available !== false);
    
    // Category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter(item => item.category === activeCategory);
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    // Sort
    if (sortBy === "price_low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "calories") {
      filtered.sort((a, b) => (a.calories || 0) - (b.calories || 0));
    }

    setDisplayItems(filtered);
    setLoaded(true);
  }, [activeCategory, searchTerm, sortBy, allItems]);

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
  };

  const getActiveCategoryName = () => {
    if (activeCategory === "all") return "All Selection";
    const cat = categories.find(c => c.id === activeCategory);
    return cat ? cat.name : "Selection";
  };

  return (
    <div className="page">
      <Header />

      <div className="menu-page">
        {/* Hero Section (Top) */}
        {!searchTerm && activeCategory === "all" && (
          <div className="menu-hero-refined">
            <div className="container">
              <span className="hero-eyebrow">Discover Excellence</span>
              <h1 className="hero-title">Signature <span className="gold-text">Menu</span></h1>
              <p className="hero-subtitle">Meticulously crafted dishes for an unforgettable dining experience.</p>
            </div>
          </div>
        )}

        {/* Sentinel for sticky header detection */}
        <div ref={sentinelRef} style={{ height: '1px', marginBottom: '-1px' }} />

        {/* Sticky Header Section (Sticks after hero) */}
        <div 
          className={`menu-header-sticky ${isSticky ? 'is-sticky' : ''}`}
          ref={headerRef}
        >
          <div className="container">
            <div className="search-row">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input 
                  type="text" 
                  className="modern-search-input" 
                  placeholder="Search our selection..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="view-toggle group-toggle">
                <button 
                  className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                  </svg>
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="category-swiper" ref={categoryScrollRef}>
              <div 
                className={`category-item ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => handleCategoryClick("all")}
              >
                <div className="cat-icon">📋</div>
                <span>All Items</span>
              </div>
              {categories.map((cat) => (
                <div 
                  key={cat.id}
                  className={`category-item ${activeCategory === cat.id ? "active" : ""}`}
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <div className="cat-icon">{cat.icon}</div>
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Listing */}
        <div className="container product-list-section">
          {!loaded ? (
            <div className="menu-loader-box">
               <div className="premium-loader"></div>
               <p>Curating your experience...</p>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="empty-selection">
               <div className="empty-icon">🍽️</div>
               <h3>Selection not found</h3>
               <p>Try adjusting your search or category.</p>
               <button className="btn btn-outline btn-sm mt-4" onClick={() => { setSearchTerm(""); setActiveCategory("all"); }}>
                 Reset View
               </button>
            </div>
          ) : (
            <div className={`product-container ${viewMode}`}>
              {displayItems.map((item, index) => (
                <SwipeableFoodCard 
                  key={item.id} 
                  item={item} 
                  index={index} 
                  isLoaded={loaded} 
                  layout={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .menu-loader-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 0;
          color: var(--text-tertiary);
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .premium-loader {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(212,175,55,0.1);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          margin-bottom: 16px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
