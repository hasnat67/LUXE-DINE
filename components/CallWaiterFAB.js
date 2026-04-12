"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function CallWaiterFAB() {
  const [isCalled, setIsCalled] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [lastTableCalled, setLastTableCalled] = useState("");
  
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) return null;

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsCalled(false);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleOpenModal = () => {
    if (cooldown > 0) return;
    setShowModal(true);
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!tableNumber) return;

    setIsCalled(true);
    setShowToast(true);
    setLastTableCalled(tableNumber);
    setCooldown(30); 
    setShowModal(false);

    // Sync with Admin Panel via localStorage
    const callEvent = {
      id: Date.now(),
      table: tableNumber,
      time: new Date().toLocaleTimeString(),
      status: 'pending'
    };
    
    // Get existing calls or start new list
    const existingCalls = JSON.parse(localStorage.getItem('waiter_calls') || '[]');
    localStorage.setItem('waiter_calls', JSON.stringify([...existingCalls, callEvent]));
    
    // Trigger a storage event manually for the same tab if needed (though admin is usually separate tab)
    window.dispatchEvent(new Event('storage'));

    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <>
      <button 
        className={`waiter-fab ${isCalled ? "active" : ""} ${cooldown > 0 ? "cooldown" : ""}`}
        onClick={handleOpenModal}
        aria-label="Call Waiter"
        title="Call Waiter"
      >
        <div className="waiter-fab-inner">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" 
              fill="currentColor"
            />
            <path 
              d="M6 20C6 17.2386 8.23858 15 11 15H13C15.7614 15 18 17.2386 18 20C18 20.5523 17.5523 21 17 21H7C6.44772 21 6 20.5523 6 20Z" 
              fill="currentColor"
            />
          </svg>
          {cooldown > 0 && <span className="waiter-fab-timer">{cooldown}s</span>}
        </div>
        <div className="waiter-fab-pulse"></div>
      </button>

      {/* Table Number Modal */}
      {showModal && (
        <div className="waiter-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="waiter-modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="waiter-modal-icon">
               <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 <circle cx="12" cy="2" r="1" fill="var(--gold)" />
               </svg>
            </div>
            <h2 className="waiter-modal-title">Call a Waiter?</h2>
            <p className="waiter-modal-subtitle">Please enter your table number</p>
            
            <form onSubmit={handleSendRequest}>
              <div className="waiter-input-wrapper">
                <input 
                  type="text" 
                  className="waiter-table-input" 
                  placeholder="Table No." 
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              
              <button type="submit" className="waiter-modal-submit-btn">
                SEND REQUEST
              </button>
            </form>
          </div>
        </div>
      )}

      {showToast && (
        <div className="waiter-notification animate-fade-in-up">
          <div className="waiter-notification-content">
            <span className="waiter-notif-icon">🔔</span>
            <div className="waiter-notif-text">
              <strong>Waiter Called for Table {lastTableCalled}</strong>
              <span>Someone will be with you shortly</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
