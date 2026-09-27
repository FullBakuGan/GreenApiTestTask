import { Input } from "antd"
import { useEffect, useState } from "react"
import CustomButton from "../../ui/button"
import { useToast } from "../../hooks/use-toast"
import {
  enableIncomingWebhookThunk,
  messageAnswerThunk,
  sendMessageThunk,
} from "@/store/slices/appSlice"
import { useAppDispatch } from "@/store"
import type { IncomingNotification } from "@/services/appServise"

type ChatInfoProps = {
  phone: string | null
}

type ChatMessage = {
  id: string
  text: string
}

function sameChat(chatId: string, phone: string) {
  const digits = chatId.replace(/\D/g, "")
  if (!digits) return false
  return digits === phone || digits.endsWith(phone) || phone.endsWith(digits)
}

function incomingText(notification: IncomingNotification, phone: string) {
  const data = notification.body
  if (data?.typeWebhook !== "incomingMessageReceived") return null

  const text =
    data.messageData?.textMessageData?.textMessage ??
    data.messageData?.extendedTextMessageData?.text
  if (!text) return null

  const chatId = data.senderData?.chatId ?? ""
  const sender = data.senderData?.sender ?? ""
  return sameChat(chatId, phone) || sameChat(sender, phone) ? text : null
}

const ChatInfo = ({ phone }: ChatInfoProps) => {
  const toast = useToast()
  const dispatch = useAppDispatch()
  const [message, setMessage] = useState("")
  const [answers, setAnswers] = useState<ChatMessage[]>([])

  useEffect(() => {
    setAnswers([])
  }, [phone])

  useEffect(() => {
    if (!phone) return

    let active = true

    const waitForAnswer = async () => {
      try {
        const turnedOn = await dispatch(enableIncomingWebhookThunk()).unwrap()
        if (active && turnedOn) {
          toast.info(
            "Приём входящих был выключен, я его включил. Напишите ответ в WhatsApp ещё раз: настройка применяется до 5 минут",
          )
        }
      } catch {
        if (active) toast.error("Не удалось включить приём входящих сообщений")
      }

      if (!active) return
      while (active) {
        const started = Date.now()
        let received = false

        try {
          const notification = await dispatch(messageAnswerThunk()).unwrap()
          received = Boolean(notification)

          if (active && notification) {
            const text = incomingText(notification, phone)
            if (text) {
              setAnswers((current) => {
                const id = String(notification.receiptId)
                if (current.some((item) => item.id === id)) return current
                return [...current, { id, text }]
              })
            }
          }
        } catch {
          received = false
        }

        if (!active) return
        if (received) continue

        const pause = Math.max(0, 5000 - (Date.now() - started))
        if (pause > 0) await new Promise((resolve) => setTimeout(resolve, pause))
      }
    }

    waitForAnswer()
    return () => {
      active = false
    }
  }, [dispatch, phone])

  const sendMessage = () => {
    if (!phone) return
    if (message.length === 0) {
      toast.error("Сначала введите сообщение")
      return
    }
    dispatch(sendMessageThunk({ phone, message }))
  }

  return (
    <section className="chat-wallpaper flex min-w-0 flex-1 flex-col">
      {phone ? (
        <header className="border-b border-border bg-surface px-4 py-3 font-medium">
          {phone}
        </header>
      ) : null}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {!phone ? (
          <p className="m-auto text-center text-muted">Выберите чат, чтобы начать общение</p>
        ) : answers.length === 0 ? (
          <p className="m-auto text-center text-muted">Напишите первое сообщение</p>
        ) : (
          answers.map((item) => (
            <p key={item.id} className="max-w-[70%] rounded-2xl bg-surface px-3 py-2">
              {item.text}
            </p>
          ))
        )}
      </div>
      {phone ? (
        <div className="flex items-center gap-2 border-t border-border bg-surface px-4 py-3">
          <Input
            placeholder="Сообщение"
            className="min-w-0 flex-1"
            value={message}
            onChange={(text) => setMessage(text.target.value)}
          />
          <CustomButton text="Отправить" bg="primary" onClick={sendMessage} />
        </div>
      ) : null}
    </section>
  )
}

export default ChatInfo
