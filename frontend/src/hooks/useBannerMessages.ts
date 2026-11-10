// src/hooks/useBannerMessages.ts
import { useEffect, useState } from "react";
import { demoFetch } from "../demo/store";

export function useBannerMessages() {
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    demoFetch("/banner")
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { messages, loading };
}
