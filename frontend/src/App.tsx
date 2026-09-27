import { Input } from "antd"
import { useState } from "react"
import Chats from "./components/chats/Chats"
import ChatInfo from "./components/chatInfo/chatInfo"
import UserInfo from "./components/userInfo/UserInfo"
import { CustomButton } from "./ui/button"
import { useToast } from "./hooks/use-toast"

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "")
  const withCountry =
    digits.length === 11 && digits.startsWith("8") ? `7${digits.slice(1)}` : digits

  if (!/^[1-9]\d{9,14}$/.test(withCountry)) return null
  return withCountry
}

function App() {
  const toast = useToast()

  const [phone, setPhone] = useState("")
  const [chats, setChats] = useState<string[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)

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

    setChats((current) =>
      current.includes(normalized) ? current : [...current, normalized],
    )
    setActiveChat(normalized)
    setPhone("")
  }

  return (
    <div className="flex h-screen justify-center bg-background">
      <div className="flex h-full w-full max-w-[1280px] overflow-hidden border-x border-border bg-surface">
        <aside className="flex h-full w-[360px] shrink-0 flex-col border-r border-border">
          <UserInfo />

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

          <Chats chats={chats} activeChat={activeChat} onOpen={setActiveChat} />
        </aside>

        <ChatInfo phone={activeChat} />
      </div>
    </div>
  )
}

export default App
