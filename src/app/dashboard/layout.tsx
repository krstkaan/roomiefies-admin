import React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function DashboardLayoutWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AuthGuard>
            <DashboardLayout>{children}</DashboardLayout>
        </AuthGuard>
    )
}