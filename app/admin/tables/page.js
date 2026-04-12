"use client";

import { useAdmin } from "@/lib/AdminContext";
import { useState, useRef, useEffect } from "react";
import QRCode from "react-qr-code";

export default function TableManager() {
  const { settings, tables, addTable, deleteTable } = useAdmin();
  const [selectedTable, setSelectedTable] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const canvasRef = useRef(null);

  const getTableUrl = (tableId) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/menu?table=${tableId}`;
  };

  const handleDownload = () => {
    const svg = document.getElementById("table-qr-code");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 100;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      ctx.fillStyle = "black";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`TABLE ${selectedTable.id}`, canvas.width / 2, img.height + 50);
      ctx.font = "14px Arial";
      ctx.fillText("Scan to View Menu", canvas.width / 2, img.height + 80);
      
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `table-${selectedTable.id}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const confirmDelete = () => {
    if (selectedTable) {
      deleteTable(selectedTable.id);
      setSelectedTable(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 className="admin-page-title">Table & QR Manager</h1>
          <p className="text-secondary">Generate QRs for tables</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 160 }}>
          <button className="btn btn-gold" onClick={addTable}>
            + Add Table
          </button>
          {selectedTable && (
            <button 
              className="btn btn-outline" 
              style={{ background: 'rgba(244,67,54,0.1)', color: '#f44336', border: '1px solid rgba(244,67,54,0.2)', padding: '10px' }}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete Table {selectedTable.id}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 350px', gap: 24, alignItems: 'start' }}>
        
        {/* Table Map */}
        <div className="admin-card">
          <h3 style={{ marginBottom: 20 }}>Table Map</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 16 }}>
             {tables.map(table => (
                <div 
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  style={{ 
                    aspectRatio: '1',
                    background: selectedTable?.id === table.id ? 'rgba(212,175,55,0.2)' : 'var(--bg-surface)',
                    border: `2px solid ${selectedTable?.id === table.id ? 'var(--gold)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 16,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                   <div style={{ fontSize: 24, fontWeight: 700 }}>{table.id}</div>
                   <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{table.status}</div>
                </div>
             ))}
             {tables.length === 0 && (
               <div style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                 No tables added yet.
               </div>
             )}
          </div>
        </div>

        {/* QR Generator Panel */}
        <div className="admin-card" style={{ position: 'sticky', top: 24 }}>
          <h3 style={{ marginBottom: 20 }}>QR Generator</h3>
          
          {selectedTable ? (
            <div style={{ textAlign: 'center' }}>
               <div style={{ 
                  background: '#fff', 
                  padding: 24, 
                  borderRadius: 16,
                  display: 'inline-block',
                  marginBottom: 24
               }}>
                  <div style={{ padding: '16px', border: '1px solid #eee', borderRadius: '12px', background: '#fff' }}>
                     <QRCode 
                       id="table-qr-code"
                       value={getTableUrl(selectedTable.id)} 
                       size={200} 
                       level={"H"} 
                     />
                  </div>
                  <div style={{ color: '#000', fontWeight: 800, fontSize: 24, marginTop: 16 }}>
                     TABLE {selectedTable.id}
                  </div>
                  <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Scan to View Menu</div>
               </div>
               
               <button className="btn btn-gold btn-block mb-3" onClick={handleDownload}>
                  Download Current QR
               </button>
               <button className="btn btn-outline btn-block" onClick={() => setIsPrintModalOpen(true)}>
                  Print QR Sticker
               </button>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--bg-surface)', borderRadius: 16 }}>
               Select a table to generate its QR code badge.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedTable && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🗑️</div>
            <h2 className="modal-title" style={{ marginBottom: 12 }}>Delete Table?</h2>
            <p className="text-secondary" style={{ marginBottom: 32 }}>
              Are you sure you want to remove <strong>Table {selectedTable.id}</strong>? This action will permanently remove it from your management list.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-block btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-block" style={{ background: '#f44336', color: '#fff' }} onClick={confirmDelete}>Delete Table</button>
            </div>
          </div>
        </div>
      )}

      {/* Print QR Modal */}
      {isPrintModalOpen && selectedTable && (
        <div className="modal-overlay" onClick={() => setIsPrintModalOpen(false)}>
          <div className="modal-content admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400, textAlign: 'center' }}>
            <div className="modal-header qr-print-hide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="modal-title" style={{ margin: 0 }}>Print Table QR</h2>
              <button className="btn-text" onClick={() => setIsPrintModalOpen(false)}>✕</button>
            </div>
            
            {/* The actual element that will be printed */}
            <div className="qr-print-container" style={{ 
              background: '#fff', 
              padding: '40px 24px', 
              borderRadius: '20px', 
              color: '#000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              border: '2px dashed #eee'
            }}>
              <div style={{ fontWeight: 800, fontSize: '32px', letterSpacing: '1px' }}>TABLE {selectedTable.id}</div>
              <div style={{ background: '#fff', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <QRCode value={getTableUrl(selectedTable.id)} size={200} level={"H"} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#444' }}>Scan & Experience AR Menu</div>
            </div>

            <div className="qr-print-hide" style={{ marginTop: 32, display: 'flex', gap: 12 }}>
              <button className="btn btn-block btn-outline" onClick={() => setIsPrintModalOpen(false)}>Cancel</button>
              <button className="btn btn-block btn-gold" onClick={() => window.print()}>Print Sticker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
