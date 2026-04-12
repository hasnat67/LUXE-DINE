"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { MENU_ITEMS, CATEGORIES } from "./data";
import { supabase } from "./supabase";

const MenuContext = createContext();

// Map snake_case DB columns to camelCase frontend keys
function mapItemFromDB(item) {
  if (!item) return item;
  return {
    ...item,
    category: item.category_id || item.category,
    image: item.image_url || item.image,
    modelUrl: item.model_url || item.modelUrl,
    spinPhotos: item.spin_photos || item.spinPhotos || [],
  };
}

// Map camelCase frontend keys to snake_case DB columns
function mapItemToDB(item) {
  const mapped = { ...item };
  if ('category' in mapped) { mapped.category_id = mapped.category; delete mapped.category; }
  if ('image' in mapped) { mapped.image_url = mapped.image; delete mapped.image; }
  if ('modelUrl' in mapped) { mapped.model_url = mapped.modelUrl; delete mapped.modelUrl; }
  if ('spinPhotos' in mapped) { mapped.spin_photos = mapped.spinPhotos; delete mapped.spinPhotos; }
  // Remove frontend-only fields
  delete mapped.images;
  return mapped;
}

export function MenuProvider({ children }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial load from Supabase
  useEffect(() => {
    async function loadMenu() {
      setLoading(true);
      try {
        // Fetch Categories
        let { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (catError) throw catError;
        if (catData && catData.length > 0) {
          setCategories(catData);
        } else {
          setCategories(CATEGORIES); // Fallback to hardcoded
        }

        // Fetch Menu Items
        let { data: itemData, error: itemError } = await supabase
          .from('menu_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (itemError) throw itemError;
        if (itemData && itemData.length > 0) {
          setItems(itemData.map(mapItemFromDB));
        } else {
          setItems(MENU_ITEMS); // Fallback to hardcoded
        }
      } catch (error) {
        console.error("Error loading menu from Supabase:", error);
        // Fallback to static data
        setItems(MENU_ITEMS);
        setCategories(CATEGORIES);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();

    // Setup Realtime subscriptions
    const itemSubscription = supabase
      .channel('menu_items_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, payload => {
        if (payload.eventType === 'INSERT') {
          setItems(prev => [mapItemFromDB(payload.new), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setItems(prev => prev.map(item => item.id === payload.new.id ? mapItemFromDB(payload.new) : item));
        } else if (payload.eventType === 'DELETE') {
          setItems(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    // 2. Storage event for cross-tab sync (fallback for Realtime)
    const handleStorageChange = (e) => {
      if (e.key === 'menu_updated_at') {
        loadMenu(); // Re-fetch from DB when another tab saves
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      supabase.removeChannel(itemSubscription);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addItem = async (item) => {
    const newItem = { 
      ...item, 
      id: item.id || Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          item: mapItemToDB(newItem)
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to add item via API');
      }

      // Update local state and trigger cross-tab sync
      const addedItem = mapItemFromDB(newItem);
      setItems(prev => [addedItem, ...prev]);
      localStorage.setItem('menu_updated_at', Date.now().toString());
    } catch (error) {
      console.error("Error adding item:", error);
      // Fallback
      setItems(prev => [newItem, ...prev]);
    }
  };

  const updateItem = async (id, updates) => {
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          id,
          updates: mapItemToDB(updates)
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update item via API');
      }

      // Update local state and trigger cross-tab sync
      setItems(prev => prev.map((item) => item.id === id ? { ...item, ...updates } : item));
      localStorage.setItem('menu_updated_at', Date.now().toString());
    } catch (error) {
      console.error("Error updating item:", error);
      setItems(prev => prev.map((item) => item.id === id ? { ...item, ...updates } : item));
    }
  };

  const deleteItem = async (id) => {
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          id
        })
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete item via API');
      }

      // Update local state and trigger cross-tab sync
      setItems(prev => prev.filter((item) => item.id !== id));
      localStorage.setItem('menu_updated_at', Date.now().toString());
    } catch (error) {
      console.error("Error deleting item:", error);
      setItems(prev => prev.filter((item) => item.id !== id));
    }
  };



  return (
    <MenuContext.Provider
      value={{
        items,
        categories,
        loading,
        addItem,
        updateItem,
        deleteItem,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}

