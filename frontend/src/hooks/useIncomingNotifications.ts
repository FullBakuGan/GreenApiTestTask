import axios from "axios"
import { useEffect, useRef } from "react"
import { parseIncomingMessage, type IncomingMessage } from "@/lib/incomingMessage"
import { appService, loadInstanceSettings, receivingIsReady } from "@/services/appServise"
import { useToast } from "./use-toast"

let settingsNoticeShown = false
let settingsErrorShown = false

function retryDelay(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 400) return 15000
  return 3000
}

async function ensureSettings() {
  const settings = await loadInstanceSettings()
  if (receivingIsReady(settings)) return false

  await appService.setSettings({
    webhookUrl: "",
    incomingWebhook: "yes",
  })
  return true
}

export function useIncomingNotifications(
  enabled: boolean,
  onMessage: (message: IncomingMessage) => void,
) {
  const toast = useToast()
  const onMessageRef = useRef(onMessage)
  const toastRef = useRef(toast)
  onMessageRef.current = onMessage
  toastRef.current = toast

  useEffect(() => {
    if (!enabled) return

    let closed = false
    let timer: number | undefined
    const controller = new AbortController()

    const pause = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms)
      })

    const listen = async () => {
      try {
        const changed = await ensureSettings()
        if (!closed && changed && !settingsNoticeShown) {
          settingsNoticeShown = true
          toastRef.current.info(
            "Включил приём входящих. Если ответ не появится сразу, подождите около минуты",
          )
        }
      } catch {
        if (!closed && !settingsErrorShown) {
          settingsErrorShown = true
          toastRef.current.error("Не удалось включить приём входящих сообщений")
        }
      }

      while (!closed) {
        const started = Date.now()
        try {
          const response = await appService.receiveNotification(controller.signal)
          if (closed) return

          const notification = response.data
          if (notification?.receiptId) {
            const incoming = parseIncomingMessage(notification)
            if (incoming) onMessageRef.current(incoming)
            await appService.deleteNotification(notification.receiptId)
            continue
          }

          const elapsed = Date.now() - started
          if (elapsed < 5000) await pause(5000 - elapsed)
        } catch (error) {
          if (closed || axios.isCancel(error)) return
          await pause(retryDelay(error))
        }
      }
    }

    void listen()

    return () => {
      closed = true
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [enabled])
}
