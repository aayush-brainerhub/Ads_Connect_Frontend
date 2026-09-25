import { createServerFn } from "@tanstack/react-start";

import { apiGet, apiPost } from "./api-client";

export interface Conversation {
  id: string;
  /** The other participant's name. */
  name: string;
  subject: string | null;
  lastMessage: string | null;
  /** ISO 8601, or null for a thread with no messages yet. */
  lastMessageDate: string | null;
  unread: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  fromMe: boolean;
  text: string | null;
  sentDate: string;
  senderName: string | null;
}

export const getConversations = createServerFn({ method: "GET" }).handler(() =>
  apiGet<Conversation[]>("/api/Message/GetConversations"),
);

/** Opening a thread also marks it read, so this is a POST rather than a loader GET. */
export const getMessages = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): string => {
    if (typeof input !== "string" || !input) throw new Error("A conversation id is required.");
    return input;
  })
  .handler(({ data: id }) =>
    apiGet<ChatMessage[]>(`/api/Message/GetMessages?conversationId=${encodeURIComponent(id)}`),
  );

export interface SendResult {
  ok: boolean;
  message?: ChatMessage;
  error?: string;
}

export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): { conversationId: string; text: string } => {
    const value = input as { conversationId?: string; text?: string } | undefined;
    if (!value?.conversationId) throw new Error("A conversation id is required.");
    if (!value.text?.trim()) throw new Error("A message cannot be empty.");
    return { conversationId: value.conversationId, text: value.text.trim() };
  })
  .handler(async ({ data }): Promise<SendResult> => {
    const body = await apiPost<ChatMessage>("/api/Message/SendMessage", data);
    return body.success && body.data
      ? { ok: true, message: body.data }
      : { ok: false, error: body.errMessage ?? "The message could not be sent." };
  });
