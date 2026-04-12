"use client";

import { useMenu } from "@/lib/MenuContext";
import { useAdmin } from "@/lib/AdminContext";
import { useState } from "react";
import Image from "next/image";

export default function MenuManager() {
  const { items, categories, updateItem, deleteItem, addItem } = useMenu();
  const { settings } = useAdmin();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [modelUploading, setModelUploading] = useState(false);
  const [modelFileName, setModelFileName] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    calories: 0,
    category: "",
    description: "",
    images: [],
    ingredients: [],
    modelUrl: "",
    available: true,
    featured: false
  });

  const filteredItems = items.filter(item => {
    const matchesTab = activeTab === "all" || item.category === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      price: item.price || 0,
      calories: item.calories != null ? Number(item.calories) : 0,
      category: item.category || "",
      description: item.description || "",
      images: item.images || (item.image ? [item.image] : []),
      ingredients: item.ingredients || [],
      modelUrl: item.modelUrl || "",
      available: item.available !== false,
      featured: !!item.featured
    });
    setModelFileName(item.modelUrl ? item.modelUrl.split('/').pop() : "");
    setIsModalOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      price: 0,
      calories: 0,
      category: categories[0]?.id || "",
      description: "",
      images: [],
      ingredients: [],
      modelUrl: "",
      available: true,
      featured: false
    });
    setModelFileName("");
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const cal = parseInt(formData.calories, 10);
    const cleanData = {
      ...formData,
      price: parseFloat(formData.price),
      calories: Number.isFinite(cal) && cal >= 0 ? cal : 0
    };

    if (editingItem) {
      updateItem(editingItem.id, cleanData);
    } else {
      addItem({
        ...cleanData,
        id: formData.name.toLowerCase().replace(/\s+/g, '-'),
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const toggleAvailability = (item) => {
    updateItem(item.id, { available: !item.available });
  };

  const toggleFeatured = (item) => {
    updateItem(item.id, { featured: !item.featured });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredient.trim()]
      }));
      setNewIngredient("");
    }
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const getPillColorClass = (index) => {
    const colors = ['pill-gold', 'pill-red', 'pill-orange', 'pill-green', 'pill-blue'];
    return colors[index % colors.length];
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleModelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['glb', 'gltf'].includes(ext)) {
      alert('Please upload a .glb or .gltf file.');
      return;
    }
    setModelUploading(true);
    setModelFileName(file.name);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload-model', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');
      setFormData(prev => ({ ...prev, modelUrl: json.url }));
    } catch (err) {
      alert('Model upload failed: ' + err.message);
      setModelFileName('');
    } finally {
      setModelUploading(false);
    }
  };

  const removeModel = () => {
    setFormData(prev => ({ ...prev, modelUrl: '' }));
    setModelFileName('');
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Menu Manager</h1>
          <p className="text-secondary">Manage items, prices, and 3D views</p>
        </div>
        <button className="btn btn-gold" onClick={handleAddNewClick}>
           + Add New Item
        </button>
      </div>

      <div className="admin-card mb-4" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          
          <div className="search-input-wrapper admin-search-compact">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              className="modern-search-input" 
              placeholder="Search dishes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="search-clear" onClick={() => setSearchTerm("")}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            <button 
              className={`btn ${activeTab === 'all' ? 'btn-gold' : 'btn-outline'}`}
              style={{ padding: '6px 16px', fontSize: 13 }}
              onClick={() => setActiveTab('all')}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`btn ${activeTab === cat.id ? 'btn-gold' : 'btn-outline'}`}
                style={{ padding: '6px 16px', fontSize: 13 }}
                onClick={() => setActiveTab(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden', border: 'none', background: 'transparent' }}>
        {/* Desktop Table View */}
        <div className="desktop-only">
          <div className="admin-card" style={{ padding: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ITEM</th>
                  <th>PRICE</th>
                  <th>KCAL</th>
                  <th>STATUS</th>
                  <th>FEATURED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: item.available === false ? 0.6 : 1 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', position: 'relative', background: '#222' }}>
                          <Image src={(item.images && item.images[0]) || item.image || '/images/classic-burger.png'} alt={item.name} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                            {categories.find(c => c.id === item.category)?.name}
                            {item.modelUrl && <span style={{ marginLeft: 8, color: 'var(--gold)' }}>• 3D</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {settings.currencySymbol}{item.price.toFixed(2)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                      {item.calories != null ? `${Number(item.calories)}` : '—'}
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleAvailability(item)}
                        style={{ 
                          padding: '4px 10px', 
                          borderRadius: 20, 
                          fontSize: 10, 
                          fontWeight: 700, 
                          border: 'none',
                          cursor: 'pointer',
                          background: item.available !== false ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)',
                          color: item.available !== false ? '#4caf50' : '#f44336',
                          textTransform: 'uppercase'
                        }}>
                        {item.available !== false ? 'Available' : 'Out of Stock'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <button 
                        onClick={() => toggleFeatured(item)}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer',
                          fontSize: 18,
                          color: item.featured ? 'var(--gold)' : 'var(--text-tertiary)',
                          filter: item.featured ? 'drop-shadow(var(--gold-glow))' : 'none'
                        }}>
                        {item.featured ? '★' : '☆'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleEditClick(item)}>Edit</button>
                        <button className="btn" style={{ padding: '6px 12px', fontSize: 12, background: 'rgba(244,67,54,0.1)', color: '#f44336' }} onClick={() => handleDeleteClick(item)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-only">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredItems.map(item => (
              <div key={item.id} className="admin-card" style={{ padding: 16, opacity: item.available === false ? 0.7 : 1 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', position: 'relative', background: '#222' }}>
                    <Image src={(item.images && item.images[0]) || item.image || '/images/classic-burger.png'} alt={item.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{item.name}</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--gold)' }}>{settings.currencySymbol}{item.price.toFixed(2)}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                          {item.calories != null ? `${Number(item.calories)} kcal` : '—'}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {categories.find(c => c.id === item.category)?.name}
                      {item.modelUrl && <span style={{ marginLeft: 8, color: 'var(--gold)', background: 'rgba(212,175,55,0.1)', padding: '2px 6px', borderRadius: 4 }}>3D AVAILABLE</span>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ flex: 1, textTransform: 'none', padding: '10px' }}
                    onClick={() => handleEditClick(item)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm" 
                    style={{ 
                      flex: 1, 
                      textTransform: 'none', 
                      padding: '10px',
                      background: item.available !== false ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                      color: item.available !== false ? '#4caf50' : '#f44336',
                      border: `1px solid ${item.available !== false ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`
                    }}
                    onClick={() => toggleAvailability(item)}
                  >
                    {item.available !== false ? 'In Stock' : 'Out of Stock'}
                  </button>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ width: 44, padding: 0, color: item.featured ? 'var(--gold)' : 'var(--text-muted)' }}
                    onClick={() => toggleFeatured(item)}
                  >
                    {item.featured ? '★' : '☆'}
                  </button>
                  <button 
                    className="btn btn-sm" 
                    style={{ width: 44, padding: 0, background: 'rgba(244,67,54,0.1)', color: '#f44336' }}
                    onClick={() => handleDeleteClick(item)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🍽️</div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No dishes found</h3>
            <p>Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>


      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <h2 className="admin-modal-title">
                {editingItem ? 'Edit Dish' : 'Add New Dish'}
              </h2>
              <button className="btn-text" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <label className="admin-label">Dish Name</label>
                  <input type="text" name="name" className="modern-input" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="admin-label">Category</label>
                  <select name="category" className="modern-select" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '14px' }}>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <label className="admin-label">Price ({settings.currencySymbol})</label>
                  <input type="number" name="price" step="0.01" className="modern-input" value={formData.price} onChange={handleChange} required />
                </div>
                <div>
                  <label className="admin-label">Calories (kcal)</label>
                  <input type="number" name="calories" min="0" step="1" className="modern-input" value={formData.calories} onChange={handleChange} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="admin-label">Dish Images</label>
                <div style={{ 
                  border: '2px dashed rgba(255,255,255,0.1)', 
                  borderRadius: '12px', 
                  padding: '24px', 
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'border-color 0.2s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                >
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileUpload}
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      opacity: 0, 
                      cursor: 'pointer' 
                    }}
                  />
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📸</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Click to Upload Images</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>Supports JPG, PNG (Max 8 images recommended)</div>
                </div>

                {/* Preview Gallery */}
                {formData.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12, marginTop: 16 }}>
                    {formData.images.map((img, index) => (
                      <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Image src={img} alt={`Preview ${index}`} fill style={{ objectFit: 'cover' }} />
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{ 
                            position: 'absolute', 
                            top: 4, 
                            right: 4, 
                            width: 20, 
                            height: 20, 
                            borderRadius: '50%', 
                            background: 'rgba(244,67,54,0.9)', 
                            color: '#fff', 
                            border: 'none', 
                            fontSize: 10, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="ar-text-gradient">AR</span>
                  3D Model File (.glb / .gltf)
                </label>

                {formData.modelUrl ? (
                  /* ── Success state ── */
                  <div className="ar-status-gold">
                    <div style={{ fontSize: 28 }}>📦</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--gold)', marginBottom: 2 }}>3D Model Uploaded</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {modelFileName || formData.modelUrl.split('/').pop()}
                      </div>
                    </div>
                    <button type="button" onClick={removeModel}
                      className="btn btn-outline btn-sm"
                      style={{ background: 'rgba(244,67,54,0.05)', borderColor: 'rgba(244,67,54,0.2)', color: '#f44336' }}>
                      Remove
                    </button>
                  </div>
                ) : modelUploading ? (
                  /* ── Uploading state ── */
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--gold)',
                    borderRadius: 12, padding: '24px'
                  }}>
                    <div style={{ width: 28, height: 28, border: '3px solid rgba(212,175,55,0.15)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gold)' }}>Uploading {modelFileName}…</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Please wait, this may take a moment</div>
                    </div>
                  </div>
                ) : (
                  /* ── Upload zone ── */
                  <div className="ar-upload-zone-gold">
                    <input type="file" accept=".glb,.gltf" onChange={handleModelUpload}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }} />
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>Upload 3D Model</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Drag &amp; drop or click · .glb / .gltf supported</div>
                    <div style={{ marginTop: 12, fontSize: 10, color: 'var(--gold)', letterSpacing: 1, opacity: 0.8 }}>ENABLES AR ✦ VIEW ON YOUR TABLE</div>
                  </div>
                )}
              </div>

              {/* Ingredients Management */}
              <div style={{ marginBottom: 24 }}>
                <label className="admin-label">Ingredients & Tags</label>
                
                {/* Ingredient List */}
                <div className="ingredient-pills" style={{ marginBottom: formData.ingredients.length > 0 ? 16 : 0 }}>
                  {formData.ingredients.map((ing, index) => (
                    <span key={index} className={`ingredient-pill ${getPillColorClass(index)}`}>
                      {ing}
                      <span className="pill-remove-btn" onClick={() => removeIngredient(index)}>✕</span>
                    </span>
                  ))}
                </div>

                {/* Ingredient Input */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <input 
                    type="text" 
                    className="modern-input" 
                    placeholder="Add ingredient (e.g. Tomato, Basil...)" 
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addIngredient();
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ whiteSpace: 'nowrap', padding: '0 20px' }}
                    onClick={addIngredient}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="admin-label">Description</label>
                <textarea name="description" className="modern-input" rows={3} value={formData.description} onChange={handleChange} style={{ resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                   <input type="checkbox" name="available" checked={formData.available} onChange={handleChange} />
                   Item is In Stock
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, marginLeft: 16 }}>
                   <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                   Feature on Home
                 </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold">Save Dish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗑️</div>
            <h2 className="modal-title" style={{ marginBottom: 12 }}>Delete Dish?</h2>
            <p className="text-secondary" style={{ marginBottom: 32 }}>
              Are you sure you want to remove <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-block btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-block" style={{ background: '#f44336', color: '#fff' }} onClick={confirmDelete}>Delete Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
