import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  messages?: Message[];
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return res.json();
    }
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  });
}

export function useChatStream(conversationId: number | null) {
  const queryClient = useQueryClient();
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const { data: conversation, isLoading } = useQuery<Conversation>({
    queryKey: ["/api/conversations", conversationId],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${conversationId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return res.json();
    },
    enabled: !!conversationId,
  });

  const sendMessage = async (content: string) => {
    if (!conversationId) return;
    
    setIsStreaming(true);
    setStreamingMessage("");

    // Optimistic user message update
    queryClient.setQueryData<Conversation>(["/api/conversations", conversationId], (old) => {
      if (!old) return old;
      return {
        ...old,
        messages: [...(old.messages || []), { 
          id: Date.now(), 
          conversationId, 
          role: "user", 
          content,
          createdAt: new Date().toISOString()
        }]
      };
    });

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to send message");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let done = false;
      let assistantContent = "";
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Keep the incomplete line in the buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (!dataStr) continue;
              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  assistantContent += data.content;
                  setStreamingMessage(assistantContent);
                }
                if (data.done) {
                  done = true;
                }
              } catch (e) {
                console.error("Failed to parse SSE line", e);
              }
            }
          }
        }
      }

      // Finalize the assistant message in cache
      queryClient.setQueryData<Conversation>(["/api/conversations", conversationId], (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...(old.messages || []), { 
            id: Date.now() + 1, 
            conversationId, 
            role: "assistant", 
            content: assistantContent,
            createdAt: new Date().toISOString()
          }]
        };
      });
      setStreamingMessage("");
    } catch (error) {
      console.error("Stream error:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  return { conversation, isLoading, streamingMessage, isStreaming, sendMessage };
}
