"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"

interface User {
    id: number
    name: string
    email: string
    is_helios: number
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
    loading: boolean
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const isAuthenticated = !!user && !!token

    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem("admin_token")
            if (savedToken) {
                setToken(savedToken)
                await checkAuth(savedToken)
            }
            setLoading(false)
        }

        initAuth()
    }, [])

    const checkAuth = async (tokenToCheck?: string) => {
        try {
            // Eğer token parametre olarak verilmişse onu kullan, yoksa mevcut token'ı kullan
            const currentToken = tokenToCheck || token
            if (!currentToken) {
                setUser(null)
                setToken(null)
                localStorage.removeItem("admin_token")
                return
            }

            const response = await apiClient.get("/me")
            if (response.data) {
                setUser(response.data)
                if (tokenToCheck) {
                    setToken(tokenToCheck)
                }
            } else {
                // Token geçersizse temizle
                localStorage.removeItem("admin_token")
                setToken(null)
                setUser(null)
            }
        } catch (error) {
            // Hata durumunda da temizle
            localStorage.removeItem("admin_token")
            setToken(null)
            setUser(null)
        }
    }

    const login = async (email: string, password: string) => {
        const response = await apiClient.post("/login", { email, password })

        if (response.data) {
            const { user, token } = response.data
            setUser(user)
            setToken(token)
            localStorage.setItem("admin_token", token)
            return { success: true }
        }

        return {
            success: false,
            error: response.error || "Giriş başarısız",
        }
    }

    const logout = async () => {
        await apiClient.post("/logout")
        setUser(null)
        setToken(null)
        localStorage.removeItem("admin_token")
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                loading,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}