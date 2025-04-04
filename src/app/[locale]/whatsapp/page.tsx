"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { WhatsAppModule } from "@/components/whatsApp/WhatsAppModule";

export default function WhatsAppPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <h1
              onClick={() => router.push("/")}
              className="text-xl font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition-colors"
            >
              Beauty Tech
            </h1>
            <span className="mx-2">›</span>
            <h2 className="text-lg font-medium text-gray-700">WhatsApp</h2>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WhatsAppModule />
      </main>
    </div>
  );
}
