export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
export const API_ADMIN_PREFIX = "/api/admin"

export const apiConfig = {
    baseURL: API_BASE_URL,
    adminPrefix: API_ADMIN_PREFIX,
    timeout: 10000,
}