import { CustomButton } from "../../ui/button"

type ChatsProps = {
  chats: string[]
  activeChat: string | null
  onOpen: (phone: string) => void
}

const Chats = ({ chats, activeChat, onOpen }: ChatsProps) => {
  if (chats.length === 0) {
    return (
      <div className="flex-1 px-4 py-6 text-center text-sm text-muted">
        Чатов пока нет
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => (
        <CustomButton
          key={chat}
          text={chat}
          bg="transparent"
          onClick={() => onOpen(chat)}
          className={`!h-auto !w-full !justify-start !rounded-none !border-0 !border-b !border-border !px-4 !py-3 !text-left !text-sm !font-medium !shadow-none ${
            chat === activeChat ? "!bg-accent/10" : "hover:!bg-foreground/5"
          }`}
        />
      ))}
    </div>
  )
}

export default Chats