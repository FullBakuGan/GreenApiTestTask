const STORAGE_KEY = "green-api-credentials"

export type GreenApiCredentials = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

let current = readCredentials()

function readCredentials(): GreenApiCredentials | null {
  if (typeof localStorage === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GreenApiCredentials>
    const apiUrl = parsed.apiUrl?.trim() ?? ""
    const idInstance = parsed.idInstance?.trim() ?? ""
    const apiTokenInstance = parsed.apiTokenInstance?.trim() ?? ""
    if (!apiUrl || !idInstance || !apiTokenInstance) return null
    return { apiUrl, idInstance, apiTokenInstance }
  } catch {
    return null
  }
}

export function getGreenApiCredentials() {
  return current
}

export function saveGreenApiCredentials(credentials: GreenApiCredentials) {
  current = {
    apiUrl: credentials.apiUrl.trim().replace(/\/$/, ""),
    idInstance: credentials.idInstance.trim(),
    apiTokenInstance: credentials.apiTokenInstance.trim(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  return current
}
