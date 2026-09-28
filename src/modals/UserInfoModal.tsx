import { Input } from "antd"
import { useState } from "react"
import { ModalWrapper } from "../modalWrapper/modalWrapper"
import CustomButton from "../ui/button"
import type { GreenApiCredentials } from "@/lib/greenApiCredentials"

interface UserInfoModalProps {
  open: boolean
  onSave: (credentials: GreenApiCredentials) => void
}

const UserInfoModal = ({ open, onSave }: UserInfoModalProps) => {
  const [apiUrl, setApiUrl] = useState("")
  const [idInstance, setIdInstance] = useState("")
  const [apiTokenInstance, setApiTokenInstance] = useState("")
  const [error, setError] = useState("")

  const save = () => {
    const nextUrl = apiUrl.trim().replace(/\/$/, "")
    const nextId = idInstance.trim()
    const nextToken = apiTokenInstance.trim()

    if (!nextUrl || !nextId || !nextToken) {
      setError("Заполните apiUrl, idInstance и apiTokenInstance")
      return
    }
    if (!/^https?:\/\/.+/i.test(nextUrl)) {
      setError("apiUrl должен начинаться с http:// или https://")
      return
    }
    if (!/^\d+$/.test(nextId)) {
      setError("idInstance должен состоять из цифр")
      return
    }

    setError("")
    onSave({
      apiUrl: nextUrl,
      idInstance: nextId,
      apiTokenInstance: nextToken,
    })
  }

  return (
    <ModalWrapper
      open={open}
      onClose={() => undefined}
      title="Данные GREEN-API"
      width={520}
      maskClosable={false}
      showCloseButton={false}
      footer={
        <div className="flex justify-end">
          <CustomButton text="Сохранить" bg="primary" onClick={save} />
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          apiUrl
          <Input
            placeholder="https://4100.api.green-api.com"
            value={apiUrl}
            onChange={(event) => setApiUrl(event.target.value)}
            onPressEnter={save}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          idInstance
          <Input
            placeholder="110100001"
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            onPressEnter={save}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          apiTokenInstance
          <Input
            placeholder="Токен из личного кабинета"
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            onPressEnter={save}
          />
        </label>
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
      </div>
    </ModalWrapper>
  )
}

export default UserInfoModal
