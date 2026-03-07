import { useState, useRef, useEffect } from "react";
import { useConversations, useCreateConversation, useChatStream } from "@/hooks/use-chat";
import { Send, Plus, Loader2, Bot, User, MessageSquare } from "lucide-react";
import { cn } from "@/components/layout";

export default function Chat() {
  const { data: conversations, isLoading: convsLoading } = useConversations();
  const createConv = useCreateConversation();
  const [activeId, setActiveId] = useState<number | null>(null);
  
  const { conversation, streamingMessage, isStreaming, sendMessage } = useChatStream(activeId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversations?.length && !activeId) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages, streamingMessage]);

  const handleCreate = async () => {
    const title = prompt("Enter conversation topic:");
    if (!title) return;
    const newConv = await createConv.mutateAsync(title);
    setActiveId(newConv.id);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-3xl overflow-hidden border border-border shadow-xl shadow-black/5 bg-card">
      {/* Sidebar */}
      <div className="w-72 border-r border-border bg-secondary/30 flex flex-col">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold">Chats</h2>
          <button 
            onClick={handleCreate}
            disabled={createConv.isPending}
            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
          >
            {createConv.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {convsLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (
            conversations?.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 truncate",
                  activeId === c.id ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{c.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative">
        {!activeId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Bot className="w-16 h-16 mb-4 opacity-20" />
            <p>Select or create a conversation to start learning.</p>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {conversation?.messages?.map((msg, i) => (
                <div key={i} className={cn("flex gap-4 max-w-3xl", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1", 
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground border border-border"
                  )}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn("px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-secondary/50 text-foreground border border-border rounded-tl-sm prose prose-sm max-w-none"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {/* Streaming Message */}
              {isStreaming && streamingMessage && (
                <div className="flex gap-4 max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed bg-secondary/50 text-foreground border border-border rounded-tl-sm prose prose-sm max-w-none">
                    {streamingMessage}
                    <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask a question about your studies..."
                  className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 pr-14 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none custom-scrollbar"
                  rows={1}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="absolute right-3 bottom-3 p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
