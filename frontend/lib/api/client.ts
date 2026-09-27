import axios from "axios"

const apiUrl = String(import.meta.env["VITE_GREEN-API_API_URL"] ?? "").replace(/\/$/, "")
const idInstance = String(import.meta.env.VITE_ID_INSTANCE ?? "")
const apiTokenInstance = String(import.meta.env.VITE_API_TOKEN_INSTANCE ?? "")

export const apiClient = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

export function greenApiPath(method: string) {
  return `/waInstance${idInstance}/${method}/${apiTokenInstance}`
}
