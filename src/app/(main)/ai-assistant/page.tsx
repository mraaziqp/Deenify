import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiAssistantChat } from "@/components/ai-assistant-chat";
import { BotMessageSquare, Shield, BookOpen, Sparkles } from "lucide-react";

export default function AiAssistantPage() {
  return (
    <div className="h-full flex flex-col">
       <div className="mb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BotMessageSquare className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Islamic AI Assistant</h1>
              <p className="text-muted-foreground">
                Ask questions about Islam based on authentic sources
              </p>
            </div>
          </div>
        </div>
        
        {/* Info badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" />
            Fatwa Firewall Active
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <BookOpen className="h-3 w-3" />
            Quran & Sahih Hadith Only
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            RAG-Powered Responses
          </Badge>
        </div>
      </div>
      
      <Card className="flex-1 flex flex-col shadow-2xl border-primary/20">
        <CardContent className="p-0 flex-1 flex">
          <AiAssistantChat />
        </CardContent>
      </Card>
    </div>
  );
}