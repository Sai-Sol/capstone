"use client";

import AIAssistant from "@/components/ai-assistant";

export default function PublicAIPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <AIAssistant />
      </div>
    </div>
  );
}