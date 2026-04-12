"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { useOrders } from "@/lib/OrderContext";

function OrderStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uuid = searchParams.get("id");
  const { refreshOrders, orders, cancelOrder } = useOrders();
  const [cancelling, setCancelling] = useState(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll for updates
  useEffect(() => {
    if (!uuid) return;

    const checkOrder = () => {
      // search params ID might be the DB UUID or the local Fallback UUID
      const currentOrder = orders.find(o => o.id === uuid);
      if (currentOrder) {
        setOrder(currentOrder);
        setLoading(false);
      }
    };

    checkOrder();
  }, [uuid, orders]);
  useEffect(() => {
    refreshOrders();
    const interval = setInterval(refreshOrders, 4000);
    return () => clearInterval(interval);
  }, [refreshOrders]);

  if (!uuid || (!loading && !order)) {
    return (
      <div className="page dark-page">
        <Header showBack title="Order Not Found" />
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h3>Order not found</h3>
          <p className="text-secondary mt-2">We couldn't track this order.</p>
          <button className="btn btn-gold mt-4" onClick={() => router.push('/')}>Return to Home</button>
        </div>
      </div>
    );
  }

  if (loading || !order) {
    return (
      <div className="page dark-page">
        <Header showBack={false} title="Loading Order..." />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  const STAGES = ["received", "preparing", "ready", "served"];
  const currentStageIndex = STAGES.indexOf(order.status);
  const progressPercent = Math.max(10, ((currentStageIndex + 1) / STAGES.length) * 100);
  const isCancelled = order.status === "cancelled";
  const canCustomerCancel =
    !isCancelled &&
    !["served", "completed"].includes(order.status);

  const getStatusText = () => {
    switch (order.status) {
      case "received":
        return "Order Received! Kitchen is reviewing.";
      case "preparing":
        return "Chef is preparing your meal.";
      case "ready":
        return "Your order is ready! A waiter is bringing it over.";
      case "served":
        return "Enjoy your meal!";
      case "cancelled":
        return "This order has been cancelled.";
      default:
        return "";
    }
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case "received":
        return "📝";
      case "preparing":
        return "👨‍🍳";
      case "ready":
        return "🛎️";
      case "served":
        return "✨";
      case "cancelled":
        return "✕";
      default:
        return "📝";
    }
  };

  const handleCancelOrder = async () => {
    if (!uuid || !canCustomerCancel || cancelling) return;
    if (typeof window !== "undefined" && !window.confirm("Cancel this order? This cannot be undone.")) {
      return;
    }
    setCancelling(true);
    const ok = await cancelOrder(uuid);
    setCancelling(false);
    if (!ok && typeof window !== "undefined") {
      window.alert("Could not cancel the order. Please ask a waiter for help.");
    } else {
      await refreshOrders();
    }
  };

  return (
    <div className="page dark-page">
      <Header showBack={false} title="Live Order Status" rightAction={() => router.push('/receipt')} rightActionText="Receipt" />

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        
        {/* Status Hero Area */}
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fade-in 0.5s ease-out' }}>
          <div style={{ fontSize: 64, marginBottom: 16, color: isCancelled ? '#ef5350' : undefined }}>{getStatusIcon()}</div>
          <h2 style={{ fontSize: 24, marginBottom: 8, color: isCancelled ? '#ef5350' : 'var(--gold)' }}>{order.status.toUpperCase()}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{getStatusText()}</p>
        </div>

        {/* Progress Bar */}
        {!isCancelled && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
             <div style={{ 
               height: '100%', 
               background: 'var(--gold)', 
               width: `${progressPercent}%`,
               transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
               boxShadow: '0 0 10px var(--gold)'
              }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, textTransform: 'uppercase', color: 'var(--text-tertiary)', fontWeight: 600 }}>
             <span style={{ color: currentStageIndex >= 0 ? 'var(--gold)' : '' }}>Received</span>
             <span style={{ color: currentStageIndex >= 1 ? 'var(--gold)' : '' }}>Preparing</span>
             <span style={{ color: currentStageIndex >= 2 ? 'var(--gold)' : '' }}>Ready</span>
             <span style={{ color: currentStageIndex >= 3 ? 'var(--gold)' : '' }}>Served</span>
          </div>
        </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
           <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
             <button 
               className="btn btn-block" 
               style={{ flex: 1, minWidth: 140, background: 'rgba(255, 152, 0, 0.1)', color: '#ff9800', border: '1px solid rgba(255, 152, 0, 0.3)', opacity: isCancelled ? 0.5 : 1 }}
               disabled={isCancelled}
               onClick={() => {
                  alert("A waiter has been called to Table " + order.tableNumber + ".");
               }}
             >
               🔔 Call Waiter
             </button>
             <button 
               className="btn btn-outline btn-block"
               style={{ flex: 1, minWidth: 140, opacity: isCancelled ? 0.5 : 1 }}
               disabled={isCancelled}
               onClick={() => router.push(`/menu?table=${order.tableNumber}`)}
             >
               + Add to Order
             </button>
           </div>
           {canCustomerCancel && (
             <button
               type="button"
               className="btn btn-outline btn-block"
               style={{ borderColor: 'rgba(239, 83, 80, 0.5)', color: '#ef5350' }}
               disabled={cancelling}
               onClick={handleCancelOrder}
             >
               {cancelling ? "Cancelling…" : "Cancel order"}
             </button>
           )}
        </div>

        {/* Order Details Summary */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid rgba(255,255,255,0.06)' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
              <span style={{ fontWeight: 600 }}>Table {order.tableNumber}</span>
              <span style={{ color: 'var(--text-secondary)' }}>Ord. #{order.id}</span>
           </div>
           
           <h4 style={{ marginBottom: 16, fontSize: 14, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Items</h4>
           
           {order.items.map((item, idx) => (
             <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                   <span style={{ color: 'var(--gold)', fontWeight: 600, marginRight: 12 }}>{(item.qty || item.quantity || 1)}x</span>
                   <span>{item.name}</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<div className="page dark-page"><div className="spinner" style={{margin:'auto', marginTop:'40vh'}} /></div>}>
      <OrderStatusContent />
    </Suspense>
  );
}
