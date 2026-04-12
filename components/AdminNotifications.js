"use client";

import { useState, useEffect } from "react";

export default function AdminNotifications() {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    // Initial load
    const savedCalls = JSON.parse(localStorage.getItem('waiter_calls') || '[]');
    setCalls(savedCalls);

    // Listen for storage events (cross-tab)
    const handleStorageChange = () => {
      const updatedCalls = JSON.parse(localStorage.getItem('waiter_calls') || '[]');
      setCalls(updatedCalls);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDismiss = (id) => {
    const updatedCalls = calls.filter(call => call.id !== id);
    setCalls(updatedCalls);
    localStorage.setItem('waiter_calls', JSON.stringify(updatedCalls));
  };

  if (calls.length === 0) return null;

  return (
    <div className="admin-notifications-container">
      {calls.map((call) => (
        <div key={call.id} className="admin-notif-card animate-slide-in-right">
          <div className="admin-notif-icon">🔔</div>
          <div className="admin-notif-body">
            <div className="admin-notif-header">
              <strong>WAITER REQUESTed</strong>
              <span className="admin-notif-time">{call.time}</span>
            </div>
            <p className="admin-notif-text">
              Table <span className="highlight">{call.table}</span> is requesting assistance.
            </p>
          </div>
          <button 
            className="admin-notif-dismiss" 
            onClick={() => handleDismiss(call.id)}
            title="Mark as Handled"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
