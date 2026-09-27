import { apiClient, greenApiPath } from "@/lib/api/client"

export type IncomingNotification = {
  receiptId: number
  body?: {
    typeWebhook?: string
    senderData?: {
      chatId?: string
      sender?: string
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

export const appService = {
  sendMessage: (data: { phone: string | number; message: string }) =>
    apiClient.post<{ idMessage: string }>(greenApiPath("sendMessage"), {
      chatId: `${data.phone}@c.us`,
      message: data.message,
    }),

  receiveNotification: () =>
    apiClient.get<IncomingNotification | null>(greenApiPath("receiveNotification")),

  getSettings: () =>
    apiClient.get<{ incomingWebhook?: "yes" | "no" }>(greenApiPath("getSettings")),

  setSettings: (data: { incomingWebhook: "yes" }) =>
    apiClient.post<{ saveSettings: boolean }>(greenApiPath("setSettings"), data),

  deleteNotification: (receiptId: number) =>
    apiClient.delete<{ result: boolean }>(
      `${greenApiPath("deleteNotification")}/${receiptId}`,
    ),
}
