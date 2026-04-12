"use client";

import Link from "next/link";
import { useOrders } from "@/lib/OrderContext";
import { useState, useEffect } from "react";

export default function OrderManager() {
  const { orders, updateOrderStatus, cancelOrder, refreshOrders } = useOrders();
  const [activeTab, setActiveTab] = useState("active"); // active, history

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshOrders();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshOrders]);

  const activeOrders = orders.filter(
    (o) => !["served", "cancelled", "completed"].includes(o.status)
  );
  const historyOrders = orders.filter((o) =>
    ["served", "cancelled", "completed"].includes(o.status)
  );

  const displayOrders = activeTab === "active" ? activeOrders : historyOrders;

  const STATUS_COLORS = {
    received: "rgba(255, 152, 0, 0.2)",
    preparing: "rgba(33, 150, 243, 0.2)",
    ready: "rgba(76, 175, 80, 0.2)",
    served: "rgba(255, 255, 255, 0.1)",
    cancelled: "rgba(239, 83, 80, 0.2)",
    completed: "rgba(255, 255, 255, 0.1)",
  };

  const STATUS_TEXT_COLORS = {
    received: "#ff9800",
    preparing: "#2196f3",
    ready: "#4caf50",
    served: "var(--text-tertiary)",
    cancelled: "#ef5350",
    completed: "var(--text-tertiary)",
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Order Manager</h1>
          <p className="text-secondary">Live kitchen display and order tracking</p>
        </div>
        <div style={{ display: 'flex', gap: 8, background: 'var(--bg-card)', padding: 4, borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
          <button 
            className={`btn ${activeTab === 'active' ? 'btn-gold' : 'btn-text'}`}
            onClick={() => setActiveTab('active')}
          >
            Active ({activeOrders.length})
          </button>
          <button 
            className={`btn ${activeTab === 'history' ? 'btn-gold' : 'btn-text'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
        {displayOrders.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center', background: 'var(--bg-card)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>🍽️</div>
            <h3 style={{ marginBottom: 8 }}>No {activeTab} orders</h3>
            <p className="text-tertiary">Waiting for customers to place an order...</p>
          </div>
        )}

        {displayOrders.map(order => (
          <div key={order.id} className="admin-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Order Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--gold)' }}>Table {order.tableNumber}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>ID: {order.id} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
               </div>
               <div style={{ 
                  padding: '4px 10px', 
                  borderRadius: 20, 
                  fontSize: 12, 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  background: STATUS_COLORS[order.status] || "rgba(255,255,255,0.08)",
                  color: STATUS_TEXT_COLORS[order.status] || "var(--text-tertiary)"
               }}>
                  {order.status}
               </div>
            </div>

            {/* Order Items */}
            <div style={{ padding: '20px', flex: 1 }}>
               {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: idx === order.items.length -1 ? 'none' : '1px dashed rgba(255,255,255,0.06)' }}>
                     <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ fontWeight: 600, color: 'var(--gold)' }}>{item.qty}x</div>
                        <div>
                           <div style={{ fontWeight: 500 }}>{item.name}</div>
                        </div>
                     </div>
                  </div>
               ))}
               
               {order.instructions && (
                  <div style={{ marginTop: 16, padding: 12, background: 'rgba(212, 175, 55, 0.05)', borderRadius: 8, borderLeft: '3px solid var(--gold)' }}>
                     <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>Special Instructions</div>
                     <div style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{order.instructions}"</div>
                  </div>
               )}
            </div>

            {/* Order Actions */}
            <div style={{ padding: '16px 20px', background: 'var(--bg-surface)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
               {order.status === 'received' && (
                  <button className="btn btn-outline btn-block" style={{ borderColor: '#2196f3', color: '#2196f3' }} onClick={() => updateOrderStatus(order.id, 'preparing')}>
                     Mark as Preparing
                  </button>
               )}
               {order.status === 'preparing' && (
                  <button className="btn btn-block" style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }} onClick={() => updateOrderStatus(order.id, 'ready')}>
                     Mark as Ready to Serve
                  </button>
               )}
               {order.status === 'ready' && (
                  <button className="btn btn-gold btn-block" onClick={() => updateOrderStatus(order.id, 'served')}>
                     Complete Order (Served)
                  </button>
               )}
               {order.status === 'served' && (
                  <>
                  <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>
                     Order Completed at {new Date(order.updatedAt).toLocaleTimeString()}
                  </div>
                  <Link
                    href={`/admin/bill/${order.id}?print=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold btn-block"
                    style={{ textAlign: 'center' }}
                  >
                    Print customer bill
                  </Link>
                  </>
               )}
               {order.status === 'cancelled' && (
                  <div style={{ textAlign: 'center', fontSize: 13, color: '#ef5350', padding: '8px 0' }}>
                     Order cancelled
                  </div>
               )}
               {['received', 'preparing', 'ready', 'pending'].includes(order.status) && (
                  <button
                    type="button"
                    className="btn btn-outline btn-block"
                    style={{ borderColor: 'rgba(239, 83, 80, 0.5)', color: '#ef5350' }}
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.confirm('Cancel this order? The kitchen will be notified.')) {
                        cancelOrder(order.id);
                      }
                    }}
                  >
                    Cancel order
                  </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
