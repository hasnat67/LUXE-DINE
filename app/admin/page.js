"use client";

import { useState, useMemo } from "react";
import { useOrders } from "@/lib/OrderContext";
import { useMenu } from "@/lib/MenuContext";
import { useAdmin } from "@/lib/AdminContext";
import Link from "next/link";

export default function AdminDashboard() {
  const { orders, getActiveOrders } = useOrders();
  const { items } = useMenu();
  const { settings } = useAdmin();
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, month, year

  const activeOrders = getActiveOrders();
  
  const stats = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let filteredOrders = orders;
    
    if (timeFilter === 'today') {
      filteredOrders = orders.filter(o => new Date(o.createdAt) >= startOfToday);
    } else if (timeFilter === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(o => new Date(o.createdAt) >= sevenDaysAgo);
    } else if (timeFilter === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
    } else if (timeFilter === 'year') {
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(o => new Date(o.createdAt) >= oneYearAgo);
    }

    const revenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    return {
      revenue,
      orderCount: filteredOrders.length,
      label: timeFilter === 'today' ? 'Today' : 
             timeFilter === 'week' ? 'Last 7 Days' : 
             timeFilter === 'month' ? 'Last 30 Days' : 'This Year'
    };
  }, [orders, timeFilter]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="text-secondary">Welcome to {settings.name} Admin Panel</p>
        </div>
        
        <div className="admin-filter-bar">
          <button 
            className={`filter-pill ${timeFilter === 'today' ? 'active' : ''}`}
            onClick={() => setTimeFilter('today')}
          >
            Today
          </button>
          <button 
            className={`filter-pill ${timeFilter === 'week' ? 'active' : ''}`}
            onClick={() => setTimeFilter('week')}
          >
            Week
          </button>
          <button 
            className={`filter-pill ${timeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setTimeFilter('month')}
          >
            Month
          </button>
          <button 
            className={`filter-pill ${timeFilter === 'year' ? 'active' : ''}`}
            onClick={() => setTimeFilter('year')}
          >
            Year
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
             <span className="stat-title">Revenue ({stats.label})</span>
             <span className="stat-trend up">↑ 0%</span>
          </div>
          <span className="stat-value gold">{settings.currencySymbol}{stats.revenue.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Orders ({stats.label})</span>
          </div>
          <span className="stat-value">{stats.orderCount}</span>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Active Orders</span>
          </div>
          <span className="stat-value gold">{activeOrders.length}</span>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-title">Total Menu Items</span>
          </div>
          <span className="stat-value">{items.length}</span>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="mb-4">Recent Activity</h3>
        {orders.length === 0 ? (
          <p className="text-tertiary">No recent orders.</p>
        ) : (
          <div className="activity-list">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="activity-item" style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Order {order.id}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Table {order.tableNumber} - {new Date(order.createdAt).toLocaleTimeString()}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--gold)' }}>{settings.currencySymbol}{order.total.toFixed(2)}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{order.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
