export type MessageStatus = "sending" | "sent" | "error"

export type ChatMessage = {
  id: string
  text: string
  direction: "in" | "out"
  status: MessageStatus
}

export type StoredChats = {
  phones: string[]
  activePhone: string | null
  messagesByPhone: Record<string, ChatMessage[]>
}
