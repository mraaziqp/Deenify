import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AiAssistantChat } from "@/components/ai-assistant-chat";
import { BotMessageSquare } from "lucide-react";

export default function AiAssistantPage() {
  return (
    <div className="h-full flex flex-col">
       <div className="flex items-center gap-3 mb-4">
            <BotMessageSquare className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">AI Assistant</h1>
              <p className="text-muted-foreground">
                Ask questions about Islam. Answers are based on Quran and Sahih Hadith.
              </p>
            </div>
        </div>
      <Card className="flex-1 flex flex-col shadow-lg">
        <CardContent className="p-0 flex-1 flex">
          <AiAssistantChat />
        </CardContent>
      </Card>
    </div>
  );
}