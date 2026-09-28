import type { ChatMessage, StoredChats } from "@/types/chat"

const STORAGE_KEY = "green-api-chats"

const EMPTY_CHATS: StoredChats = {
  phones: [],
  activePhone: null,
  messagesByPhone: {},
}

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false
  const item = value as ChatMessage
  return (
    typeof item.id === "string" &&
    typeof item.text === "string" &&
    (item.direction === "in" || item.direction === "out") &&
    (item.status === "sending" || item.status === "sent" || item.status === "error")
  )
}

export function loadChats(): StoredChats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_CHATS

    const parsed = JSON.parse(raw) as Partial<StoredChats>
    const phones = Array.isArray(parsed.phones)
      ? parsed.phones.filter((phone): phone is string => typeof phone === "string")
      : []

    const messagesByPhone: Record<string, ChatMessage[]> = {}
    const storedMessages =
      parsed.messagesByPhone && typeof parsed.messagesByPhone === "object"
        ? parsed.messagesByPhone
        : {}

    for (const phone of phones) {
      const list = storedMessages[phone]
      messagesByPhone[phone] = Array.isArray(list)
        ? list.filter(isMessage).map((item) =>
            item.status === "sending" ? { ...item, status: "error" } : item,
          )
        : []
    }

    const activePhone =
      typeof parsed.activePhone === "string" && phones.includes(parsed.activePhone)
        ? parsed.activePhone
        : null

    return { phones, activePhone, messagesByPhone }
  } catch {
    return EMPTY_CHATS
  }
}

export function saveChats(chats: StoredChats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
  } catch {
    // Storage can be unavailable or full; the chat still works in memory.
  }
}

function chatPhoneForIncoming(phones: string[], incomingPhone: string) {
  return phones.find((phone) => phone === incomingPhone)
}

export function appendIncoming(
  chats: StoredChats,
  incoming: { id: string; phone: string | null; text: string },
): StoredChats {
  const matched = incoming.phone
    ? chatPhoneForIncoming(chats.phones, incoming.phone)
    : undefined
  if (incoming.phone && !matched) return chats

  const phone = matched ?? chats.activePhone
  if (!phone) return chats

  const current = chats.messagesByPhone[phone] ?? []
  if (current.some((item) => item.id === incoming.id)) return chats

  return {
    ...chats,
    messagesByPhone: {
      ...chats.messagesByPhone,
      [phone]: [
        ...current,
        { id: incoming.id, text: incoming.text, direction: "in", status: "sent" },
      ],
    },
  }
}
