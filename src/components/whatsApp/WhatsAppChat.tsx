"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, SmilePlus, Bot } from "lucide-react";
import type {
  WhatsAppContact,
  WhatsAppMessage,
  AIResponse,
} from "../../types/whatsapp";

interface WhatsAppChatProps {
  contact: WhatsAppContact;
}

export function WhatsAppChat({ contact }: WhatsAppChatProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: WhatsAppMessage = {
      id: Math.random().toString(),
      type: "outbound",
      content: message,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      // In a real app, integrate with OpenAI API
      const aiResponse: AIResponse = {
        intent: "schedule_appointment",
        confidence: 0.95,
        reply:
          "Claro! Posso ajudar você a agendar um horário. Que tal amanhã às 14h?",
        actions: [
          {
            type: "schedule",
            data: {
              date: "2024-03-15",
              time: "14:00",
            },
          },
        ],
        entities: {
          service: "aesthetic",
          datetime: "2024-03-15T14:00:00",
        },
      };

      // Simulate AI response delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const botMessage: WhatsAppMessage = {
        id: Math.random().toString(),
        type: "inbound",
        content: aiResponse.reply,
        timestamp: new Date(),
        status: "sent",
        metadata: {
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          entities: aiResponse.entities,
        },
      };

      setMessages((prev) => [...prev, botMessage]);

      // Handle AI actions
      if (aiResponse.actions) {
        aiResponse.actions.forEach((action) => {
          switch (action.type) {
            case "schedule":
              // Update CRM with scheduling info
              break;
            case "payment":
              // Generate payment link
              break;
            case "crm_update":
              // Update CRM data
              break;
            case "notification":
              // Send notification
              break;
          }
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">{contact.name}</h3>
          <p className="text-sm text-gray-500">{contact.phone}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              contact.status === "active"
                ? "bg-green-500"
                : contact.status === "inactive"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-500">{contact.status}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.type === "outbound" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.type === "outbound"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <div
                className={`text-xs mt-1 ${
                  msg.type === "outbound" ? "text-indigo-200" : "text-gray-500"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
                {msg.type === "outbound" && (
                  <span className="ml-2">
                    {msg.status === "sent"
                      ? "✓"
                      : msg.status === "delivered"
                      ? "✓✓"
                      : msg.status === "read"
                      ? "✓✓"
                      : "!"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500">
            <Bot className="w-4 h-4" />
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <Paperclip className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <SmilePlus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Digite uma mensagem..."
            className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 text-white bg-indigo-600 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
