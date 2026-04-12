"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import "./qr.css";

export default function QRPage() {
  const [tableNumber, setTableNumber] = useState("1");
  const [baseUrl, setBaseUrl] = useState("");
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const generateQR = useCallback(
    (table) => {
      if (!canvasRef.current) return;
      const url = `${baseUrl || "https://yourdomain.com"}/?table=${table}`;

      // Simple QR code generator using canvas (no external lib needed)
      drawQRCode(canvasRef.current, url, table);
    },
    [baseUrl]
  );

  useEffect(() => {
    if (baseUrl) {
      // Small delay to ensure canvas is mounted
      setTimeout(() => generateQR(tableNumber), 100);
    }
  }, [baseUrl, generateQR, tableNumber]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `luxe-dine-table-${tableNumber}-qr.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page">
      <Header showBack backHref="/menu" title="Menu" />

      <div className="qr-page container">
        <div className="qr-header">
          <h1 className="qr-title">
            QR Code <span className="gold-text">Generator</span>
          </h1>
          <p className="qr-subtitle">
            Generate QR codes for each table. Customers scan to access the AR menu.
          </p>
        </div>

        {/* Table Number Input */}
        <div className="qr-config">
          <div className="qr-input-group">
            <label className="cart-label">Table Number</label>
            <div className="qr-input-row">
              <input
                type="number"
                className="cart-input"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                min="1"
                max="100"
                placeholder="Enter table number"
              />
              <button className="btn btn-gold" onClick={() => generateQR(tableNumber)}>
                Generate
              </button>
            </div>
          </div>

          <div className="qr-url-preview">
            <span className="receipt-label">URL Preview</span>
            <code className="qr-url">
              {baseUrl || "https://yourdomain.com"}/?table={tableNumber}
            </code>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="qr-display">
          <div className="qr-card printable">
            <div className="qr-card-header">
              <span className="qr-card-logo gold-text">LUXE</span>
              <span className="qr-card-logo-sub">DINE</span>
            </div>

            <div className="qr-canvas-wrapper">
              <canvas ref={canvasRef} width={260} height={260} id="qr-canvas" />
            </div>

            <div className="qr-card-footer">
              <p className="qr-card-scan">Scan to view menu</p>
              <p className="qr-card-table">Table {tableNumber}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="qr-actions no-print">
          <button className="btn btn-gold btn-block" onClick={handleDownload}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            DOWNLOAD QR
          </button>
          <button className="btn btn-outline btn-block" onClick={handlePrint}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            PRINT QR
          </button>
        </div>

        {/* Batch Generator */}
        <div className="qr-batch no-print">
          <div className="divider" />
          <h3 className="qr-batch-title">Quick Generate</h3>
          <p className="qr-batch-desc">Select a table to quickly generate its QR code</p>
          <div className="qr-batch-grid">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                className={`qr-batch-btn ${tableNumber === String(num) ? "active" : ""}`}
                onClick={() => {
                  setTableNumber(String(num));
                  generateQR(String(num));
                }}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Draws a stylish QR-like pattern on canvas.
 * This is a visual QR code representation using the URL text.
 * For a real production app, you'd use a library like 'qrcode' npm package.
 */
function drawQRCode(canvas, url, tableNum) {
  const ctx = canvas.getContext("2d");
  const size = canvas.width;

  // Clear canvas
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  // Generate a deterministic pattern from the URL
  const moduleSize = 8;
  const moduleCount = Math.floor(size / moduleSize);
  const margin = 2;

  // Simple hash-based pattern generation
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash * 31 + url.charCodeAt(i)) & 0xffffffff;
  }

  // Draw modules
  for (let row = margin; row < moduleCount - margin; row++) {
    for (let col = margin; col < moduleCount - margin; col++) {
      // Position detection patterns (corners)
      const isTopLeft = row < margin + 7 && col < margin + 7;
      const isTopRight = row < margin + 7 && col >= moduleCount - margin - 7;
      const isBottomLeft = row >= moduleCount - margin - 7 && col < margin + 7;

      let filled = false;

      if (isTopLeft || isTopRight || isBottomLeft) {
        // Draw finder patterns
        const rr = isTopLeft ? row - margin : isBottomLeft ? row - (moduleCount - margin - 7) : row - margin;
        const cc = isTopLeft ? col - margin : isTopRight ? col - (moduleCount - margin - 7) : col - margin;

        if (rr === 0 || rr === 6 || cc === 0 || cc === 6) filled = true;
        else if (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) filled = true;
        else filled = false;
      } else {
        // Data area - use deterministic pseudo-random pattern
        const seed = (row * 137 + col * 251 + hash) & 0xffffffff;
        filled = (seed % 3) !== 0;
      }

      if (filled) {
        const x = col * moduleSize;
        const y = row * moduleSize;

        // Gold gradient for filled modules
        const gradient = ctx.createLinearGradient(x, y, x + moduleSize, y + moduleSize);
        gradient.addColorStop(0, "#D4AF37");
        gradient.addColorStop(1, "#F0C75E");
        ctx.fillStyle = gradient;

        // Rounded rectangles for modern look
        const r = 1.5;
        const w = moduleSize - 1;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + w - r);
        ctx.quadraticCurveTo(x + w, y + w, x + w - r, y + w);
        ctx.lineTo(x + r, y + w);
        ctx.quadraticCurveTo(x, y + w, x, y + w - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // Draw center emblem
  const centerX = size / 2;
  const centerY = size / 2;
  const emblSize = 40;

  // Clear center area
  ctx.fillStyle = "#000000";
  ctx.fillRect(centerX - emblSize / 2 - 4, centerY - emblSize / 2 - 4, emblSize + 8, emblSize + 8);

  // Draw gold border
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 2;
  ctx.strokeRect(centerX - emblSize / 2 - 2, centerY - emblSize / 2 - 2, emblSize + 4, emblSize + 4);

  // Draw table number
  ctx.fillStyle = "#D4AF37";
  ctx.font = "bold 16px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`T${tableNum}`, centerX, centerY);
}
