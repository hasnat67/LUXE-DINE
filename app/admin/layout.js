"use client";

import { useAdmin } from "@/lib/AdminContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import AdminNotifications from "@/components/AdminNotifications";
import "./admin.css";

export default function AdminLayout({ children }) {
  const { isAuthenticated, login, logout, settings, loading } = useAdmin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during login.");
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="loading-content">
          <div className="admin-logo animate-pulse">
            <span className="gold-text">LUXE</span> DINE
          </div>
          <div className="loading-spinner-wrapper">
            <div className="loading-spinner-gold"></div>
          </div>
          <p className="loading-text">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login-page dark-page">
        <div className="admin-login-card">
          <div className="login-visual-header">
            <div className="admin-logo">
              <span className="gold-text">LUXE</span> DINE
            </div>
            <div className="login-badge">ADMIN PORTAL</div>
          </div>
          
          <p className="login-subtitle">Please authenticate to access the manager dashboard</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group modern-form-group">
              <div className="input-with-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input
                  type="text"
                  className="modern-input"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="form-group modern-form-group">
              <div className="input-with-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input
                  type="password"
                  className="modern-input"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="login-error-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="error-icon">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p className="error-text">{error}</p>
              </div>
            )}

            <button type="submit" className="btn btn-gold btn-block login-submit-btn">
              LOGIN TO DASHBOARD
            </button>
            <div className="login-footer-links">
               <Link href="/" className="back-link">Return to Restaurant Menu</Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout dark-page">
      {/* Mobile Top Header */}
      <header className="admin-mobile-header">
        <div className="admin-logo-small">
          <span className="gold-text">LUXE</span> DINE <span className="admin-badge">ADMIN</span>
        </div>
        <button className="mobile-toggle-trigger" onClick={toggleSidebar}>
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Sidebar Nav */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo-small">
            <span className="gold-text">LUXE</span> DINE <span className="admin-badge">ADMIN</span>
          </div>
          <button className="mobile-menu-btn" onClick={closeSidebar}>✕</button>
        </div>

        <nav className="admin-nav" onClick={closeSidebar}>
          <NavLink href="/admin" current={pathname}>Dashboard</NavLink>
          <NavLink href="/admin/orders" current={pathname}>Live Orders</NavLink>
          <NavLink href="/admin/menu" current={pathname}>Menu Manager</NavLink>
          <NavLink href="/admin/tables" current={pathname}>QR & Tables</NavLink>
          <NavLink href="/admin/settings" current={pathname}>Settings</NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={() => { logout(); router.push('/admin'); closeSidebar(); }} className="btn btn-outline btn-block">
            Logout
          </button>
          <Link href="/" className="btn btn-text btn-block mt-2">
            View Live Menu
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && <div className="admin-overlay" onClick={closeSidebar} />}

      {/* Main Content Area */}
      <main className="admin-main">
        <AdminNotifications />
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, current, children }) {
  const isActive = current === href || (href !== '/admin' && current.startsWith(href));
  return (
    <Link href={href} className={`admin-nav-link ${isActive ? "active" : ""}`}>
      {children}
    </Link>
  );
}
