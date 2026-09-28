import { apiClient, greenApiPath } from "@/lib/api/client"

export type IncomingNotification = {
  receiptId: number
  body?: {
    typeWebhook?: string
    timestamp?: number
    idMessage?: string
    senderData?: {
      chatId?: string
      sender?: string
      senderName?: string
    }
    messageData?: {
      typeMessage?: string
      textMessageData?: {
        textMessage?: string
      }
      extendedTextMessageData?: {
        text?: string
      }
    }
  }
}

export type YesNo = "yes" | "no"

export type InstanceSettings = {
  wid?: string
  typeInstance?: string
  webhookUrl?: string
  webhookUrlToken?: string
  delaySendMessagesMilliseconds?: number
  markIncomingMessagesReaded?: YesNo
  markIncomingMessagesReadedOnReply?: YesNo
  outgoingWebhook?: YesNo
  outgoingMessageWebhook?: YesNo
  outgoingAPIMessageWebhook?: YesNo
  incomingWebhook?: YesNo
  stateWebhook?: YesNo
  keepOnlineStatus?: YesNo
  editedMessageWebhook?: YesNo
  deletedMessageWebhook?: YesNo
}

let settingsRequest: Promise<InstanceSettings> | null = null

export function resetInstanceSettings() {
  settingsRequest = null
}

export function loadInstanceSettings() {
  settingsRequest ??= appService
    .getSettings()
    .then((res) => res.data)
    .catch((error: unknown) => {
      settingsRequest = null
      throw error
    })

  return settingsRequest
}

export function receivingIsReady(settings: InstanceSettings) {
  return !settings.webhookUrl && settings.incomingWebhook === "yes"
}

export const appService = {
  sendMessage: (data: { phone: string | number; message: string }) =>
    apiClient.post<{ idMessage: string }>(greenApiPath("sendMessage"), {
      chatId: `${data.phone}@c.us`,
      message: data.message,
    }),

  receiveNotification: (signal?: AbortSignal) =>
    apiClient.get<IncomingNotification | null>(greenApiPath("receiveNotification"), {
      params: { receiveTimeout: 60 },
      timeout: 70000,
      signal,
    }),

  getSettings: () => apiClient.get<InstanceSettings>(greenApiPath("getSettings")),

  setSettings: (data: { webhookUrl: ""; incomingWebhook: "yes" }) =>
    apiClient.post<{ saveSettings: boolean }>(greenApiPath("setSettings"), data),

  deleteNotification: (receiptId: number) =>
    apiClient.delete<{ result: boolean }>(
      `${greenApiPath("deleteNotification")}/${receiptId}`,
    ),
}
