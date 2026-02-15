'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { askAboutIslam } from '@/ai/flows/ask-about-islam';
import { Bot, User, Loader2, Send, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const ChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

const suggestedQuestions = [
  "What are the five pillars of Islam?",
  "How do I perform wudu correctly?",
  "What is the significance of Ramadan?",
  "Can you explain the concept of Tawheed?",
  "What are the etiquettes of making dua?",
];

export function AiAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof ChatSchema>>({
    resolver: zodResolver(ChatSchema),
    defaultValues: {
      message: '',
    },
  });

  // Load conversation from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('aiChatHistory');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }
  }, []);

  // Save conversation to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('aiChatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const onSubmit = async (data: z.infer<typeof ChatSchema>) => {
    const userMessage: Message = { 
      role: 'user', 
      content: data.message,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    form.reset();

    try {
      const response = await askAboutIslam({ question: data.message });
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.answer,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, but I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    localStorage.removeItem('aiChatHistory');
    toast.success('Conversation cleared', { duration: 2000 });
  };

  const handleSuggestedQuestion = (question: string) => {
    form.setValue('message', question);
    form.handleSubmit(onSubmit)();
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {messages.length > 0 && (
        <div className="border-b p-3 flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{messages.length} messages</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearConversation}
            className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto">
            <div className="p-4 bg-primary/10 rounded-full">
              <Bot className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Ask About Islam</h3>
              <p className="text-muted-foreground mb-6">
                I'm here to answer your questions about Islamic teachings, practices, and traditions.
              </p>
            </div>
            <div className="w-full space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((question, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1.5 text-xs"
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className='bg-primary text-primary-foreground'>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-md rounded-lg p-3 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8">
                  <AvatarFallback className='bg-primary text-primary-foreground'>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
          </div>
        )}
      </ScrollArea>
      <div className="border-t p-4 bg-background">
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <Textarea
            placeholder="Type your question here..."
            className="pr-16 resize-none"
            onKeyDown={handleKeyPress}
            {...form.register('message')}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute top-1/2 -translate-y-1/2 right-3"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">
          This AI is for informational purposes. For fatwas, consult a qualified scholar.
        </p>
      </div>
    </div>
  );
}
