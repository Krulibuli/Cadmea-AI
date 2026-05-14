import { useState, useRef, useEffect } from "react";
import { useCreateOpenaiConversation, useListOpenaiMessages } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, Bot, User, MessageSquarePlus, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";

interface AiContextParams {
  city?: string;
  districtId?: number;
  mode?: string;
}

interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  contextParams?: AiContextParams;
}

export function AiSidebar({ isOpen, onClose, contextParams }: AiSidebarProps) {
  const { language } = useI18n();
  const copy = language === "lt" ? chatCopy.lt : chatCopy.en;
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  
  const createConv = useCreateOpenaiConversation();
  const { data: messages, refetch: refetchMessages } = useListOpenaiMessages(conversationId || 0, {
    query: { enabled: !!conversationId, queryKey: ["messages", conversationId] }
  });

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleStartNew = () => {
    activeRequestRef.current?.abort();
    setIsStreaming(false);
    setStreamingContent("");
    setError("");
    createConv.mutate({ data: { title: `Chat ${new Date().toLocaleString()}` } }, {
      onSuccess: (res) => {
        setConversationId(res.id);
      },
      onError: () => {
        setError(copy.createError);
      },
    });
  };

  useEffect(() => {
    if (isOpen && !conversationId && !createConv.isPending) {
      handleStartNew();
    }
  }, [isOpen, conversationId, createConv.isPending]);

  useEffect(() => {
    return () => activeRequestRef.current?.abort();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || isStreaming) return;
    
    const userMessage = input.trim();
    const abortController = new AbortController();
    activeRequestRef.current = abortController;
    setInput("");
    setIsStreaming(true);
    setStreamingContent("");
    setError("");
    
    try {
      const response = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMessage, language, context: contextParams }),
        signal: abortController.signal,
      });
      
      if (!response.ok) throw new Error(`Chat request failed with ${response.status}`);
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";
      let doneSeen = false;
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        
        for (const event of events) {
          for (const rawLine of event.split("\n")) {
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;

            const dataStr = line.slice(5).trim();
            if (!dataStr || dataStr === "[DONE]") continue;

            const data = JSON.parse(dataStr) as { content?: string; done?: boolean; error?: string };
            if (data.error) throw new Error(data.error);
            if (data.content) setStreamingContent((prev) => prev + data.content);
            if (data.done) doneSeen = true;
          }
        }
      }

      if (buffer.trim()) {
        for (const rawLine of buffer.split("\n")) {
          const line = rawLine.trim();
          if (!line.startsWith("data:")) continue;
          const dataStr = line.slice(5).trim();
          if (!dataStr || dataStr === "[DONE]") continue;
          const data = JSON.parse(dataStr) as { content?: string; done?: boolean };
          if (data.content) setStreamingContent((prev) => prev + data.content);
          if (data.done) doneSeen = true;
        }
      }

      if (!doneSeen) {
        // The server closed the stream cleanly but did not send a done event.
        // Treat it as finished so the user never gets trapped in loading state.
        await refetchMessages();
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error(err);
        setError(copy.sendError);
      }
    } finally {
      if (activeRequestRef.current === abortController) activeRequestRef.current = null;
      setIsStreaming(false);
      setStreamingContent("");
      await refetchMessages();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-16 bottom-0 w-full md:w-[400px] bg-card border-l z-50 flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-2 font-semibold">
                <div className="bg-primary/20 p-1.5 rounded-md">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                {copy.title}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={handleStartNew} title="New Chat" className="h-8 w-8" disabled={createConv.isPending}>
                  {createConv.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquarePlus className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 md:hidden">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              <div className="flex flex-col gap-4 pb-4">
                {(!messages || messages.length === 0) && !isStreaming && (
                  <div className="text-center py-10 text-muted-foreground flex flex-col items-center">
                    <Bot className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm">{copy.empty}</p>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                
                {messages?.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-secondary" : "bg-primary/20 text-primary"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`whitespace-pre-wrap p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isStreaming && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 text-primary">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="whitespace-pre-wrap p-3 rounded-2xl text-sm bg-muted rounded-tl-sm flex flex-col gap-2 min-w-[60px]">
                      {streamingContent ? streamingContent : <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto" />}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="relative flex items-center"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={copy.placeholder}
                  className="pr-12 rounded-full bg-muted/50 border-transparent focus-visible:ring-primary/30"
                  disabled={isStreaming || !conversationId || createConv.isPending}
                  data-testid="input-chat"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="absolute right-1 w-8 h-8 rounded-full" 
                  disabled={!input.trim() || isStreaming || !conversationId || createConv.isPending}
                  data-testid="btn-send-chat"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const chatCopy = {
  en: {
    title: "Urban AI Assistant",
    empty: "Ask me about districts, hotels, cafes, schools, safety, parks, or what makes a good place to live in Lithuania.",
    placeholder: "Ask about Lithuania...",
    sendError: "The assistant could not finish that response. Please try again.",
    createError: "Could not start a new chat. Please try again.",
  },
  lt: {
    title: "Miesto AI asistentas",
    empty: "Klausk apie rajonus, viešbučius, kavines, mokyklas, saugumą, parkus ar geriausias vietas gyventi Lietuvoje.",
    placeholder: "Klausk apie Lietuvą...",
    sendError: "Asistentas negalėjo užbaigti atsakymo. Bandyk dar kartą.",
    createError: "Nepavyko pradėti naujo pokalbio. Bandyk dar kartą.",
  },
};
