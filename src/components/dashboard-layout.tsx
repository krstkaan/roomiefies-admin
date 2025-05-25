"use client"

import React, { useState } from "react" // Added useState
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, Users, Building, Settings, LogOut, User, Menu, X } from 'lucide-react' // Added Menu, X
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Kullanıcılar", href: "/dashboard/users", icon: Users },
    { name: "İlanlar", href: "/dashboard/listings", icon: Building }, // Corrected 'ilanlar' to 'İlanlar' for consistency
    { name: "Ayarlar", href: "/dashboard/settings", icon: Settings },
]

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { user, logout } = useAuth()
    const pathname = usePathname()
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false) // State for mobile sidebar

    const handleLogout = async () => {
        await logout()
        // Consider redirecting to login page after logout
        // router.push('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            {/* Added classes for transform, transition, and conditional translate for mobile */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0",
                    mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-16 items-center justify-center border-b dark:border-gray-700">
                    {/* Roomiefies Admin title can be a Link to dashboard */}
                    <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                        Roomiefies Admin
                    </Link>
                </div>

                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileSidebarOpen(false)} // Close sidebar on link click on mobile
                                        className={cn(
                                            "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                            isActive
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-50"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                                        )}
                                    >
                                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" /> {/* Added flex-shrink-0 */}
                                        {item.name}
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </div>

            {/* Backdrop for mobile sidebar */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                ></div>
            )}

            {/* Main content */}
            {/* Added md:pl-64 for conditional padding */}
            <div className="md:pl-64 flex flex-col flex-1">
                {/* Top bar */}
                <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white dark:bg-gray-800 px-4 sm:px-6 shadow-sm dark:border-b dark:border-gray-700">
                    {/* Hamburger Menu Button - visible on mobile */}
                    <div className="flex items-center">
                        <button
                            aria-label="Toggle sidebar"
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none md:hidden"
                            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                        >
                            {mobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* User Dropdown Menu */}
                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                                            {user?.name?.charAt(0).toUpperCase() || "A"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 dark:bg-gray-800 dark:border-gray-700" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">{user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground dark:text-gray-400">{user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700 cursor-pointer">
                                    <User className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
                                    <span className="text-gray-700 dark:text-gray-200">Profil</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700 cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
                                    <span className="text-gray-700 dark:text-gray-200">Ayarlar</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="dark:bg-gray-700" />
                                <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-300" />
                                    <span className="text-gray-700 dark:text-gray-200">Çıkış Yap</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Page content */}
                {/* Added flex-1 and overflow-y-auto for proper scrolling of content area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}