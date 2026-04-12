"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { RESTAURANT } from "./data";
import { supabase } from "./supabase";

const AdminContext = createContext();

// Map snake_case DB columns to camelCase
function mapSettingsFromDB(data) {
  if (!data) return data;
  return {
    ...data,
    currency: data.currency ?? RESTAURANT.currency,
    taxRate: data.tax_rate ?? data.taxRate ?? RESTAURANT.taxRate,
    serviceCharge: data.service_charge ?? data.serviceCharge ?? RESTAURANT.serviceCharge,
    currencySymbol: data.currency_symbol ?? data.currencySymbol ?? RESTAURANT.currencySymbol,
    themeColor: data.theme_color ?? data.themeColor ?? '#D4AF37',
  };
}

// Map camelCase frontend keys to snake_case DB columns
function mapSettingsToDB(data) {
  if (!data) return data;
  const mapped = { ...data };
  if ('taxRate' in mapped) { mapped.tax_rate = mapped.taxRate; delete mapped.taxRate; }
  if ('serviceCharge' in mapped) { mapped.service_charge = mapped.serviceCharge; delete mapped.serviceCharge; }
  if ('currencySymbol' in mapped) { mapped.currency_symbol = mapped.currencySymbol; delete mapped.currencySymbol; }
  if ('themeColor' in mapped) { mapped.theme_color = mapped.themeColor; delete mapped.themeColor; }
  // `currency` column matches camelCase key in schema (TEXT)
  return mapped;
}

export function AdminProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState(RESTAURANT);
  const [tables, setTables] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let authSubscription = null;

    async function initializeAdmin() {
      setLoading(true);
      
      // 1. Check Auth State (Supabase + Dev Bypass)
      const { data: { session } } = await supabase.auth.getSession();
      const bypassSession = localStorage.getItem('admin_bypass_session') === 'true';
      
      setIsAuthenticated(!!session || bypassSession);

      // Listen for auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setIsAuthenticated(!!session || localStorage.getItem('admin_bypass_session') === 'true');
      });
      authSubscription = authListener?.subscription || null;

      // 2. Load Settings from Supabase
      try {
        let { data: settingsData, error: settingsError } = await supabase
          .from('restaurants')
          .select('*')
          .limit(1)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw settingsError;
        }

        if (settingsData) {
          // Map snake_case to camelCase if needed, or just use as is
          setSettings(mapSettingsFromDB(settingsData));
        } else {
          // If no settings in DB, use hardcoded and maybe seed later
          setSettings(RESTAURANT);
        }

        // 3. Load Tables
        let { data: tableData, error: tableError } = await supabase
          .from('restaurant_tables')
          .select('*')
          .order('id', { ascending: true });

        if (tableError) throw tableError;
        
        if (tableData && tableData.length > 0) {
          setTables(tableData);
        } else {
          const initialTables = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, status: "available" }));
          setTables(initialTables);
        }
      } catch (error) {
        console.error("Error initializing admin data:", error);
      } finally {
        setLoading(false);
      }

      return () => {
        authListener.subscription.unsubscribe();
      };
    }

    initializeAdmin();

    // 4. Load UI Theme from local storage (UI preference stays local)
    const storedTheme = localStorage.getItem("uiTheme") || "dark";
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);

    // 5. Setup Realtime for Tables
    const tableSubscription = supabase
      .channel('table_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, payload => {
        if (payload.eventType === 'INSERT') {
          setTables(prev => [...prev, payload.new].sort((a, b) => a.id - b.id));
        } else if (payload.eventType === 'UPDATE') {
          setTables(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTables(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    // 6. Setup Realtime for Settings
    const settingsSubscription = supabase
      .channel('settings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, payload => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setSettings(mapSettingsFromDB(payload.new));
        }
      })
      .subscribe();

    // 7. Storage event for cross-tab sync (fallback for Realtime)
    const handleStorageChange = (e) => {
      if (e.key === 'settings_updated_at') {
        initializeAdmin(); // Re-fetch from DB when another tab saves
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe();
      }
      supabase.removeChannel(tableSubscription);
      supabase.removeChannel(settingsSubscription);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Apply theme color
  useEffect(() => {
    if (settings?.theme_color || settings?.themeColor) {
      const color = settings.theme_color || settings.themeColor;
      document.documentElement.style.setProperty('--gold', color);
      document.documentElement.style.setProperty('--gold-gradient', `linear-gradient(135deg, ${color}, ${color}dd)`);
      document.documentElement.style.setProperty('--gold-glow', `0 0 20px ${color}40`);
    }
  }, [settings?.theme_color, settings?.themeColor]);

  const login = async (usernameOrEmail, password) => {
    // For demo/dev, allow a hardcoded admin login bypass
    if (usernameOrEmail === 'admin' && password === 'admin') {
      localStorage.setItem('admin_bypass_session', 'true');
      setIsAuthenticated(true);
      return true;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameOrEmail,
      password,
    });

    if (error) {
      console.error("Login failed:", error.message);
      return false;
    }
    return true;
  };

  const logout = async () => {
    localStorage.removeItem('admin_bypass_session');
    await supabase.auth.signOut();
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("uiTheme", newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const updateSettings = async (newSettings) => {
    try {
      // Use the API bridge to bypass RLS safely on the server side
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: settings.id,
          ...mapSettingsToDB(newSettings)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update settings via API');
      }

      if (result.data) {
        setSettings(mapSettingsFromDB(result.data));
      } else {
        setSettings((prev) => ({ ...prev, ...newSettings }));
      }
      localStorage.setItem('settings_updated_at', Date.now().toString());
    } catch (error) {
      console.error("Error updating settings:", error);
      // Fallback local update in case of network error
      setSettings(prev => ({ ...prev, ...newSettings }));
    }
  };

  const addTable = async () => {
    const nextId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
    const { error } = await supabase
      .from('restaurant_tables')
      .insert([{ id: nextId, status: "available" }]);
    
    if (error) console.error("Error adding table:", error);
  };

  const deleteTable = async (id) => {
    const { error } = await supabase
      .from('restaurant_tables')
      .delete()
      .eq('id', id);
    
    if (error) console.error("Error deleting table:", error);
  };

  const updateTableStatus = async (id, status) => {
    const { error } = await supabase
      .from('restaurant_tables')
      .update({ status })
      .eq('id', id);
    
    if (error) console.error("Error updating table status:", error);
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        settings,
        tables,
        theme,
        loading,
        toggleTheme,
        login,
        logout,
        updateSettings,
        addTable,
        deleteTable,
        updateTableStatus
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}

