"use client";

import { useAdmin } from "@/lib/AdminContext";
import { useMenu } from "@/lib/MenuContext";
import { useState, useEffect } from "react";

export default function SettingsManager() {
  const { settings, updateSettings } = useAdmin();
  const { resetMenu } = useMenu();
  const [formData, setFormData] = useState({
    name: settings.name || "",
    tagline: settings.tagline || "",
    currency: settings.currency || "USD",
    taxRate: (settings.taxRate ?? 0.08) * 100,
    serviceCharge: (settings.serviceCharge ?? 0.05) * 100,
    themeColor: settings.themeColor || "#D4AF37",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData({
      name: settings.name || "",
      tagline: settings.tagline || "",
      currency: settings.currency || "USD",
      taxRate: (settings.taxRate ?? 0.08) * 100,
      serviceCharge: (settings.serviceCharge ?? 0.05) * 100,
      themeColor: settings.themeColor || "#D4AF37",
    });
  }, [
    settings.name,
    settings.tagline,
    settings.currency,
    settings.taxRate,
    settings.serviceCharge,
    settings.themeColor,
    settings.currencySymbol,
  ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Map simple symbols
    const symbolMap = {
      "USD": "$",
      "EUR": "€",
      "GBP": "£",
      "AUD": "$",
      "CAD": "$",
      "AED": "DH",
      "PKR": "Rs.",
      "INR": "₹",
      "JPY": "¥"
    };
    
    let currencySymbol = symbolMap[formData.currency] || "$";

    updateSettings({
      ...formData,
      currencySymbol,
      taxRate: parseFloat(formData.taxRate) / 100,
      serviceCharge: parseFloat(formData.serviceCharge) / 100,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("This will delete all custom menu items and restore the original demo menu. Are you sure?")) {
      resetMenu();
      alert("Menu has been reset to defaults!");
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="text-secondary">Configure your restaurant profile and billing</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="admin-card">
        <h3 style={{ marginBottom: 24 }}>Restaurant Profile</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
           <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>Restaurant Name</label>
              <input 
                type="text" 
                className="modern-input" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
           </div>
           <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>Tagline</label>
              <input 
                type="text" 
                className="modern-input" 
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
              />
           </div>
        </div>

        <div className="divider" style={{ margin: '32px 0' }} />

        <h3 style={{ marginBottom: 24 }}>Billing & Tax</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 24 }}>
           <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>Currency</label>
              <select 
                className="modern-select" 
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                style={{ width: '100%', paddingTop: 14, paddingBottom: 14 }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD ($)</option>
                <option value="PKR">Pakistan (Rs.)</option>
              </select>
           </div>
           <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>Tax Rate (%)</label>
              <input 
                type="number" 
                step="0.1"
                className="modern-input" 
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
              />
           </div>
           <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>Service Charge (%)</label>
              <input 
                type="number" 
                step="0.1"
                className="modern-input" 
                name="serviceCharge"
                value={formData.serviceCharge}
                onChange={handleChange}
              />
           </div>
        </div>

        <div className="divider" style={{ margin: '32px 0' }} />
        
        <h3 style={{ marginBottom: 24 }}>Branding</h3>
        
        <div style={{ marginBottom: 32 }}>
           <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>Theme Accent Color</label>
           <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
             <input 
               type="color" 
               name="themeColor"
               value={formData.themeColor}
               onChange={handleChange}
               style={{ width: 60, height: 40, padding: 0, border: 'none', borderRadius: 8, background: 'none' }}
             />
             <input 
                type="text" 
                className="modern-input" 
                value={formData.themeColor}
                onChange={handleChange}
                style={{ width: 150 }}
              />
           </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, alignItems: 'center' }}>
          {saved && <span style={{ color: 'var(--success)' }}>✓ Settings saved successfully</span>}
          <button type="submit" className="btn btn-gold px-8">Save Changes</button>
        </div>
      </form>

      <div className="admin-card" style={{ marginTop: 32, borderColor: 'rgba(244,67,54,0.3)' }}>
         <h3 style={{ marginBottom: 12, color: '#f44336' }}>Danger Zone</h3>
         <p style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 24 }}>
           Having trouble showing items on mobile? Resetting the menu will restore all original demo dishes.
         </p>
         <button className="btn btn-outline" style={{ color: '#f44336', borderColor: 'rgba(244,67,54,0.3)' }} onClick={handleReset}>
           Reset Menu to Default
         </button>
      </div>
    </div>
  );
}
