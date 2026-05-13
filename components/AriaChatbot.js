"use client";

import { useState, useEffect, useRef } from "react";
import "./AriaChatbot.css";

export default function AriaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to LUXE DINE. I'm Aria, your digital concierge. How may I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // The user provided this webhook
      const ARIA_WEBHOOK = 'https://hook.eu1.make.com/hutrlheeeeb0kb1ducxx9jcyuwarx6x4';
      
      const response = await fetch(ARIA_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          timestamp: new Date().toISOString(),
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent
          }
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      // Make.com webhooks can return text directly or JSON
      const data = await response.text();
      let content = data;
      
      try {
        // Try parsing as JSON in case it's a structured response
        const jsonData = JSON.parse(data);
        content = jsonData.output || jsonData.message || jsonData.response || data;
      } catch (e) {
        // Not JSON, use as text
      }

      setMessages((prev) => [...prev, { role: "assistant", content: content }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`aria-container ${isOpen ? "open" : ""}`}>
      {/* Floating Button */}
      <button 
        className="aria-toggle" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Concierge"
      >
        <div className="aria-icon-wrapper">
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          )}
        </div>
        <span className="aria-toggle-label">Aria</span>
      </button>

      {/* Chat Window */}
      <div className="aria-window">
        <div className="aria-header">
          <div className="aria-header-info">
            <div className="aria-avatar">A</div>
            <div>
              <h3>Aria</h3>
              <div className="aria-status">
                <span className="status-dot"></span>
                Digital Concierge
              </div>
            </div>
          </div>
          <button className="aria-close" onClick={() => setIsOpen(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="aria-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`aria-message ${msg.role}`}>
              <div className="aria-message-content">
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="aria-message assistant loading">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="aria-input-area" onSubmit={handleSend}>
          <input 
            type="text" 
            placeholder="Ask me anything..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
