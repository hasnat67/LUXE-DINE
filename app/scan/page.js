"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import Header from "@/components/Header";
import "./scan.css";

export default function ScanPage() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Determine dimensions based on viewport
    const width = window.innerWidth;
    const scannerSize = Math.min(width * 0.8, 300);

    const config = {
      fps: 10,
      qrbox: { width: scannerSize, height: scannerSize },
      aspectRatio: 1.0,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    };

    const scanner = new Html5QrcodeScanner("reader", config, false);
    scannerRef.current = scanner;

    const onScanSuccess = (decodedText) => {
      // Pause scanning on success
      setIsScanning(false);
      
      try {
        // Attempt to parse URL to extract table parameter
        const url = new URL(decodedText);
        const tableNum = url.searchParams.get("table");
        
        if (tableNum) {
          setScanResult(`Found Table ${tableNum}! Redirecting...`);
          // Redirect to menu with table number
          setTimeout(() => {
            router.push(`/menu?table=${tableNum}`);
          }, 1500);
        } else {
          // If it's a valid URL but no table number, redirect to landing
          setScanResult("QR Code found! Redirecting...");
          setTimeout(() => {
            router.push(`/`);
          }, 1500);
        }
      } catch (e) {
        // Not a URL
        setScanResult("Invalid menu QR code.");
        setTimeout(() => setIsScanning(true), 2000);
      }
    };

    const onScanError = (err) => {
      // Ignored - fires continuously while searching for QR code
    };

    // Render scanner
    scanner.render(onScanSuccess, onScanError);

    // Cleanup
    return () => {
      scanner.clear().catch(console.error);
    };
  }, [router]);

  return (
    <div className="page dark-page">
      <Header showBack backHref="/" title="Scan Menu" />

      <div className="scan-container">
        <div className="scan-header">
          <h1 className="scan-title">Scan QR Code</h1>
          <p className="scan-subtitle">
            Point your camera at the QR code on your table to view the AR menu.
          </p>
        </div>

        <div className="scanner-wrapper">
          <div id="reader" className="scanner-div"></div>
          
          {/* Overlay elements */}
          {isScanning && (
            <div className="scanning-overlay">
              <div className="scan-corner top-left"></div>
              <div className="scan-corner top-right"></div>
              <div className="scan-corner bottom-left"></div>
              <div className="scan-corner bottom-right"></div>
              <div className="scan-line"></div>
            </div>
          )}

          {scanResult && (
            <div className="scan-success-overlay">
              <div className="success-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <p>{scanResult}</p>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="camera-error">
            <p>Could not access camera. Please check permissions.</p>
          </div>
        )}

        <div className="scan-footer">
          <p>Powered by LUXE DINE</p>
        </div>
      </div>
    </div>
  );
}
