import React, { useState, useEffect, useRef } from "react";
import { PageTransition } from "@/components/shared/PageTransition";
import { useListSupportMessages, useSendSupportMessage, getListSupportMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Support() {
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useListSupportMessages();
  const sendMutation = useSendSupportMessage();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sendMutation.isPending]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendMutation.isPending) return;

    const messageText = input;
    setInput("");

    sendMutation.mutate(
      { data: { message: messageText } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListSupportMessagesQueryKey() });
        }
      }
    );
  };

  return (
    <PageTransition className="flex flex-col h-[calc(100vh-4rem)] md:h-screen p-0 md:p-4 max-w-4xl mx-auto w-full">
      <div className="bg-card border-x md:border md:rounded-3xl shadow-sm flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <div className="h-16 border-b flex items-center px-6 gap-3 shrink-0 bg-background/50 backdrop-blur-xl z-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold tracking-tight">AI Learning Support</h2>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Online
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-muted/10">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-3/4 rounded-2xl rounded-tl-sm" />
              <Skeleton className="h-16 w-2/3 rounded-2xl rounded-tr-sm ml-auto" />
            </div>
          ) : (
            <>
              <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border shadow-sm p-4 rounded-2xl rounded-tl-sm text-sm text-foreground max-w-[85%]">
                  Hello! I'm your AI tutor. Ask me any conceptual doubts, request study strategies, or ask for explanations of previous questions.
                </div>
              </div>
              
              {messages?.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={msg.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      isUser ? "bg-muted" : "bg-primary/10"
                    )}>
                      {isUser ? <User className="w-4 h-4 text-muted-foreground" /> : <Bot className="w-4 h-4 text-primary" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed shadow-sm",
                      isUser ? "bg-foreground text-background rounded-tr-sm" : "bg-card border rounded-tl-sm"
                    )}>
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              
              {sendMutation.isPending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-card border shadow-sm p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your doubt..."
              className="pr-12 rounded-full h-12 bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:border-primary focus-visible:bg-background transition-colors"
              disabled={sendMutation.isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || sendMutation.isPending}
              className="absolute right-1 w-10 h-10 rounded-full bg-primary hover:bg-primary/90 text-white"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
