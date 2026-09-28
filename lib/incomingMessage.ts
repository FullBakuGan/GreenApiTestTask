export type IncomingMessage = {
  id: string
  phone: string | null
  text: string
  receiptId?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

const GROUP_CHAT_TYPES = new Set(["group", "supergroup", "channel"])

function phoneDigits(value: unknown) {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null
    value = String(Math.trunc(value))
  }
  if (typeof value !== "string" || value.startsWith("-")) return null

  const bare = value.replace(/@c\.us$/, "")
  const fromChatId = value.endsWith("@c.us")
  if (!/^\d+$/.test(bare)) return null
  if (!fromChatId && bare.length < 11) return null
  if (!/^[1-9]\d{9,14}$/.test(bare)) return null
  return bare.length === 11 && bare.startsWith("8") ? `7${bare.slice(1)}` : bare
}

function messageText(messageData: unknown) {
  if (!isRecord(messageData)) return null

  const textMessage = isRecord(messageData.textMessageData)
    ? messageData.textMessageData.textMessage
    : null
  if (typeof textMessage === "string" && textMessage.trim()) return textMessage

  const extended = isRecord(messageData.extendedTextMessageData)
    ? messageData.extendedTextMessageData.text
    : null
  if (typeof extended === "string" && extended.trim()) return extended

  return null
}

export function parseIncomingMessage(payload: unknown): IncomingMessage | null {
  if (!isRecord(payload)) return null

  const body = isRecord(payload.body) ? payload.body : payload
  if (body.typeWebhook !== "incomingMessageReceived") return null

  const text = messageText(body.messageData)
  if (!text) return null

  const senderData = isRecord(body.senderData) ? body.senderData : {}
  const chatType = typeof senderData.chatType === "string" ? senderData.chatType : ""
  if (GROUP_CHAT_TYPES.has(chatType)) return null

  const phone =
    phoneDigits(senderData.senderPhoneNumber) ??
    phoneDigits(senderData.chatId) ??
    phoneDigits(senderData.sender)

  const receiptId = typeof payload.receiptId === "number" ? payload.receiptId : undefined
  const idMessage = typeof body.idMessage === "string" ? body.idMessage : ""
  const id = receiptId
    ? String(receiptId)
    : idMessage || `in-${String(body.timestamp ?? Date.now())}`

  return { id, phone, text, receiptId }
}
