import { Input } from "antd"
import { useEffect, useState } from "react"
import Chats from "./components/chats/Chats"
import ChatInfo from "./components/chatInfo/chatInfo"
import UserInfo from "./components/userInfo/UserInfo"
import { CustomButton } from "./ui/button"
import { useToast } from "./hooks/use-toast"
import { useIncomingNotifications } from "./hooks/useIncomingNotifications"
import { appendIncoming, loadChats, saveChats } from "@/lib/chatStorage"
import {
  getGreenApiCredentials,
  saveGreenApiCredentials,
  type GreenApiCredentials,
} from "@/lib/greenApiCredentials"
import { resetInstanceSettings } from "@/services/appServise"
import UserInfoModal from "./modals/UserInfoModal"
import type { ChatMessage, StoredChats } from "@/types/chat"

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "")
  const withCountry =
    digits.length === 11 && digits.startsWith("8") ? `7${digits.slice(1)}` : digits

  if (!/^[1-9]\d{9,14}$/.test(withCountry)) return null
  return withCountry
}

const EMPTY_MESSAGES: ChatMessage[] = []

function App() {
  const toast = useToast()

  const [phone, setPhone] = useState("")
  const [credentials, setCredentials] = useState<GreenApiCredentials | null>(
    getGreenApiCredentials,
  )
  const [storage, setStorage] = useState<StoredChats>(loadChats)
  const activeChat = storage.activePhone
  const messages = activeChat
    ? (storage.messagesByPhone[activeChat] ?? EMPTY_MESSAGES)
    : EMPTY_MESSAGES

  useEffect(() => {
    saveChats(storage)
  }, [storage])

  useIncomingNotifications(Boolean(credentials), (incoming) => {
    setStorage((current) => appendIncoming(current, incoming))
  })

  const saveCredentials = (next: GreenApiCredentials) => {
    resetInstanceSettings()
    setCredentials(saveGreenApiCredentials(next))
  }

  const createChat = () => {
    if (!phone.trim()) {
      toast.error("Сначала введите номер телефона")
      return
    }

    const normalized = normalizePhone(phone)
    if (!normalized) {
      toast.error("Введите корректный номер телефона, например 79001234567")
      return
    }

    setStorage((current) => ({
      ...current,
      phones: current.phones.includes(normalized)
        ? current.phones
        : [...current.phones, normalized],
      activePhone: normalized,
    }))
    setPhone("")
  }

  const updateMessages = (
    chatPhone: string,
    updater: (current: ChatMessage[]) => ChatMessage[],
  ) => {
    setStorage((current) => {
      const previous = current.messagesByPhone[chatPhone] ?? []
      const next = updater(previous)
      if (next === previous) return current
      return {
        ...current,
        messagesByPhone: {
          ...current.messagesByPhone,
          [chatPhone]: next,
        },
      }
    })
  }

  return (
    <div className="flex h-screen justify-center bg-background">
      <div className="flex h-full w-full max-w-[1280px] overflow-hidden border-x border-border bg-surface">
        <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-border">
          {credentials ? <UserInfo credentials={credentials} /> : null}

          <div className="flex items-center gap-2 px-4 py-3">
            <Input
              placeholder="Номер телефона"
              className="min-w-0 flex-1"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              onPressEnter={createChat}
            />
            <CustomButton
              text="Создать чат"
              bg="primary"
              disabled={!phone.trim()}
              onClick={createChat}
            />
          </div>

          <Chats
            chats={storage.phones}
            activeChat={activeChat}
            onOpen={(nextPhone) =>
              setStorage((current) => ({ ...current, activePhone: nextPhone }))
            }
          />
        </aside>

        <ChatInfo
          phone={activeChat}
          messages={messages}
          onUpdateMessages={updateMessages}
        />
      </div>
      <UserInfoModal open={!credentials} onSave={saveCredentials} />
    </div>
  )
}

export default App
