import axios from "axios"
import { getGreenApiCredentials } from "@/lib/greenApiCredentials"

export const apiClient = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const credentials = getGreenApiCredentials()
  if (credentials) config.baseURL = credentials.apiUrl
  return config
})

export function greenApiPath(method: string) {
  const credentials = getGreenApiCredentials()
  const idInstance = credentials?.idInstance ?? ""
  const apiTokenInstance = credentials?.apiTokenInstance ?? ""
  return `/waInstance${idInstance}/${method}/${apiTokenInstance}`
}
