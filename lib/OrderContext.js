"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

const OrderContext = createContext();

function normalizeStoredItems(raw) {
  if (Array.isArray(raw)) {
    return { lines: raw, tableLabel: "", specialInstructions: "" };
  }
  if (raw && typeof raw === "object" && Array.isArray(raw.lines)) {
    return {
      lines: raw.lines,
      tableLabel: raw.tableLabel || "",
      specialInstructions: raw.specialInstructions || "",
    };
  }
  return { lines: [], tableLabel: "", specialInstructions: "" };
}

// Map DB snake_case to frontend camelCase (exported for bill page direct fetch)
export function mapOrderFromDB(order) {
  if (!order) return order;
  const { lines, tableLabel, specialInstructions } = normalizeStoredItems(order.items);
  return {
    ...order,
    id: order.id,
    table_id: order.table_id,
    tableNumber:
      order.table_id != null
        ? String(order.table_id)
        : tableLabel || order.tableNumber || "",
    total: parseFloat(order.total_price || order.total || 0),
    items: lines,
    instructions: specialInstructions,
    status: order.status || "pending",
    createdAt: order.created_at || order.createdAt || new Date().toISOString(),
    updatedAt: order.updated_at || order.updatedAt || new Date().toISOString(),
  };
}

function mergeOrderIntoList(prev, order) {
  const mapped = mapOrderFromDB(order);
  if (!mapped?.id) return prev;
  if (prev.some((o) => o.id === mapped.id)) return prev;
  return [mapped, ...prev];
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const adminRes = await fetch("/api/admin/orders", { cache: "no-store" });
      if (adminRes.ok) {
        const json = await adminRes.json();
        if (Array.isArray(json.orders)) {
          setOrders(json.orders.map(mapOrderFromDB));
          return;
        }
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data || []).map(mapOrderFromDB));
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    // Setup Realtime subscription for orders
    const orderSubscription = supabase
      .channel('order_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        if (payload.eventType === 'INSERT') {
          setOrders((prev) => mergeOrderIntoList(prev, payload.new));
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(order => order.id === payload.new.id ? mapOrderFromDB(payload.new) : order));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(order => order.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(orderSubscription);
    };
  }, [loadOrders]);

  const placeOrder = async (cartItems, subtotal, tax, serviceCharge, total, tableNum, instructions) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          subtotal,
          tax,
          serviceCharge,
          total,
          tableNum,
          instructions,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.order) {
        console.error("Order API error:", json.error || res.statusText);
        return {
          order: null,
          error:
            json.error ||
            "Could not place order. Check your connection and Supabase setup.",
        };
      }

      const mapped = mapOrderFromDB(json.order);
      setOrders((prev) => mergeOrderIntoList(prev, json.order));

      return { order: mapped, error: null };
    } catch (err) {
      console.error("Critical placeOrder Error:", err);
      return {
        order: null,
        error: err?.message || "Network error while placing order.",
      };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const updatedAt = new Date().toISOString();

    const apiRes = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status }),
    });

    if (apiRes.ok) {
      const json = await apiRes.json().catch(() => ({}));
      if (json.order) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? mapOrderFromDB(json.order) : order
          )
        );
        return true;
      }
    }

    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: updatedAt })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error);
      return false;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt, updated_at: updatedAt }
          : order
      )
    );
    return true;
  };

  const cancelOrder = async (orderId) => {
    return updateOrderStatus(orderId, "cancelled");
  };

  const getOrderById = (id) => {
    return orders.find(o => o.id === id);
  };

  const getActiveOrders = () => {
    return orders.filter(
      (o) =>
        !["served", "completed", "cancelled"].includes(o.status)
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        placeOrder,
        updateOrderStatus,
        cancelOrder,
        refreshOrders: loadOrders,
        getOrderById,
        getActiveOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}

