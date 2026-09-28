import { useEffect, useState } from "react"
import type { GreenApiCredentials } from "@/lib/greenApiCredentials"
import { loadInstanceSettings, type InstanceSettings } from "@/services/appServise"

function accountLabel(settings: InstanceSettings) {
  const phone = settings.wid?.replace(/@c\.us$/, "")
  if (!phone) return null
  return settings.typeInstance ? `${phone} · ${settings.typeInstance}` : phone
}

type UserInfoProps = {
  credentials: GreenApiCredentials
}

const UserInfo = ({ credentials }: UserInfoProps) => {
  const [settings, setSettings] = useState<InstanceSettings | null>(null)

  useEffect(() => {
    let active = true
    loadInstanceSettings()
      .then((data) => {
        if (active) setSettings(data)
      })
      .catch(() => {
        if (active) setSettings(null)
      })
    return () => {
      active = false
    }
  }, [credentials.idInstance, credentials.apiTokenInstance, credentials.apiUrl])

  const account = settings ? accountLabel(settings) : null

  return (
    <div className="space-y-3 border-b border-border px-4 py-4">
      {account ? (
        <div>
          <p className="text-xs text-muted">Аккаунт</p>
          <p className="truncate text-sm font-medium">{account}</p>
        </div>
      ) : null}
      <div>
        <p className="text-xs text-muted">apiUrl</p>
        <p className="truncate text-sm font-medium">{credentials.apiUrl}</p>
      </div>
      <div>
        <p className="text-xs text-muted">idInstance</p>
        <p className="truncate text-sm font-medium">{credentials.idInstance}</p>
      </div>
      <div>
        <p className="text-xs text-muted">apiTokenInstance</p>
        <p className="truncate text-sm font-medium">{credentials.apiTokenInstance}</p>
      </div>
      {settings ? (
        <p className="text-xs text-muted">
          {settings.incomingWebhook === "yes" && !settings.webhookUrl
            ? "Приём входящих включён"
            : "Приём входящих выключен"}
        </p>
      ) : null}
    </div>
  )
}

export default UserInfo
