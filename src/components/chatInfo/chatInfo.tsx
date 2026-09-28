import { Input } from "antd"
import { useEffect, useRef, useState } from "react"
import CustomButton from "../../ui/button"
import { useToast } from "../../hooks/use-toast"
import { selectLoading, sendMessageThunk } from "@/store/slices/appSlice"
import { useAppDispatch } from "@/store"
import type { ChatMessage } from "@/types/chat"
import { useSelector } from "react-redux"

type ChatInfoProps = {
  phone: string | null
  messages: ChatMessage[]
  onUpdateMessages: (
    phone: string,
    updater: (current: ChatMessage[]) => ChatMessage[],
  ) => void
}

const ChatInfo = ({ phone, messages, onUpdateMessages }: ChatInfoProps) => {
  const toast = useToast()
  const dispatch = useAppDispatch()
  const [message, setMessage] = useState("")
  const listRef = useRef<HTMLDivElement>(null)

  const isLoading = useSelector(selectLoading)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!phone || isLoading) return
    const text = message.trim()
    if (text.length === 0) {
      toast.error("Сначала введите сообщение")
      return
    }

    const localId = `out-${crypto.randomUUID()}`
    onUpdateMessages(phone, (current) => [
      ...current,
      { id: localId, text, direction: "out", status: "sending" },
    ])
    setMessage("")

    try {
      await dispatch(sendMessageThunk({ phone, message: text })).unwrap()
      onUpdateMessages(phone, (current) =>
        current.map((item) =>
          item.id === localId ? { ...item, status: "sent" } : item,
        ),
      )
    } catch {
      onUpdateMessages(phone, (current) =>
        current.map((item) =>
          item.id === localId ? { ...item, status: "error" } : item,
        ),
      )
      toast.error("Не удалось отправить сообщение")
    }
  }

  return (
    <section className='chat-wallpaper flex min-w-0 flex-1 flex-col'>
      {phone ? (
        <header className='border-b border-border bg-surface px-4 py-3 font-medium'>
          {phone}
        </header>
      ) : null}
      <div
        ref={listRef}
        className='flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4'
      >
        {!phone ? (
          <p className='m-auto text-center text-muted'>
            Выберите чат, чтобы начать общение
          </p>
        ) : messages.length === 0 ? (
          <p className='m-auto text-center text-muted'>
            Напишите первое сообщение
          </p>
        ) : (
          <div className='mt-auto flex flex-col gap-2'>
            {messages.map((item) => {
              const outgoing = item.direction === "out"
              return (
                <p
                  key={item.id}
                  className={`message-bubble max-w-[70%] rounded-2xl px-3 py-2 break-words shadow-sm ${
                    outgoing
                      ? "message-bubble-out self-end rounded-br-md bg-accent text-accent-foreground"
                      : "self-start rounded-bl-md bg-surface"
                  } ${item.status === "sending" ? "opacity-80" : ""}`}
                >
                  {item.text}
                  {outgoing ? (
                    <span className='message-status' aria-hidden>
                      {item.status === "sending" ? (
                        <span className='send-dots'>
                          <span />
                          <span />
                          <span />
                        </span>
                      ) : item.status === "error" ? (
                        <span className='text-xs'>!</span>
                      ) : (
                        <span className='message-status-sent text-xs'>✓</span>
                      )}
                    </span>
                  ) : null}
                </p>
              )
            })}
          </div>
        )}
      </div>
      {phone ? (
        <div className='flex items-center gap-2 border-t border-border bg-surface px-4 py-3'>
          <Input
            placeholder='Сообщение'
            className='min-w-0 flex-1'
            value={message}
            onChange={(text) => setMessage(text.target.value)}
            onPressEnter={sendMessage}
          />
          <CustomButton
            text='Отправить'
            bg='primary'
            loading={isLoading}
            disabled={isLoading}
            onClick={sendMessage}
          />
        </div>
      ) : null}
    </section>
  )
}

export default ChatInfo
